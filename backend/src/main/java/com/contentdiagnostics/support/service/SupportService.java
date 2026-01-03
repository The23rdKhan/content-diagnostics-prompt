package com.contentdiagnostics.support.service;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.common.exception.ResourceNotFoundException;
import com.contentdiagnostics.support.dto.AddReplyRequest;
import com.contentdiagnostics.support.dto.CreateTicketRequest;
import com.contentdiagnostics.support.dto.SupportTicketDto;
import com.contentdiagnostics.support.dto.TicketReplyDto;
import com.contentdiagnostics.support.entity.SupportTicket;
import com.contentdiagnostics.support.entity.TicketReply;
import com.contentdiagnostics.support.repository.SupportTicketRepository;
import com.contentdiagnostics.support.repository.TicketReplyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SupportService {

    private final SupportTicketRepository ticketRepository;
    private final TicketReplyRepository replyRepository;

    /**
     * Get paginated tickets for a user.
     */
    @Transactional(readOnly = true)
    public Page<SupportTicketDto> getTickets(User user, int page, int size) {
        Page<SupportTicket> tickets = ticketRepository.findByUserOrderByCreatedAtDesc(
                user, PageRequest.of(page, size));
        return tickets.map(SupportTicketDto::fromEntity);
    }

    /**
     * Create a new support ticket.
     */
    @Transactional
    public SupportTicketDto createTicket(User user, CreateTicketRequest request) {
        SupportTicket ticket = SupportTicket.builder()
                .user(user)
                .subject(request.getSubject())
                .message(request.getMessage())
                .priority(request.getPriority() != null
                        ? request.getPriority()
                        : SupportTicket.TicketPriority.MEDIUM)
                .status(SupportTicket.TicketStatus.OPEN)
                .build();

        ticket = ticketRepository.save(ticket);
        log.info("Created support ticket {} for user {}", ticket.getId(), user.getId());

        return SupportTicketDto.fromEntity(ticket);
    }

    /**
     * Add a reply to a ticket.
     */
    @Transactional
    public TicketReplyDto addReply(User user, Long ticketId, AddReplyRequest request) {
        SupportTicket ticket = ticketRepository.findByIdAndUser(ticketId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", ticketId.toString()));

        TicketReply reply = TicketReply.builder()
                .ticket(ticket)
                .message(request.getMessage())
                .author(TicketReply.ReplyAuthor.USER)
                .build();

        reply = replyRepository.save(reply);

        // Update ticket status if it was resolved/closed
        if (ticket.getStatus() == SupportTicket.TicketStatus.RESOLVED ||
            ticket.getStatus() == SupportTicket.TicketStatus.CLOSED) {
            ticket.setStatus(SupportTicket.TicketStatus.OPEN);
            ticketRepository.save(ticket);
        }

        log.info("Added reply to ticket {} by user {}", ticketId, user.getId());

        return TicketReplyDto.fromEntity(reply);
    }
}
