package com.contentdiagnostics.support.controller;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.common.dto.ApiResponse;
import com.contentdiagnostics.common.dto.PagedResponse;
import com.contentdiagnostics.common.util.SecurityUtils;
import com.contentdiagnostics.support.dto.AddReplyRequest;
import com.contentdiagnostics.support.dto.CreateTicketRequest;
import com.contentdiagnostics.support.dto.SupportTicketDto;
import com.contentdiagnostics.support.dto.TicketReplyDto;
import com.contentdiagnostics.support.service.SupportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for support ticket endpoints.
 */
@Slf4j
@RestController
@RequestMapping("/support")
@RequiredArgsConstructor
public class SupportController {

    private final SupportService supportService;

    /**
     * Get paginated tickets for current user.
     * GET /api/support/tickets
     */
    @GetMapping("/tickets")
    public ResponseEntity<ApiResponse<PagedResponse<SupportTicketDto>>> getTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        User user = SecurityUtils.getCurrentUser();
        Page<SupportTicketDto> tickets = supportService.getTickets(user, page, size);

        PagedResponse<SupportTicketDto> response = PagedResponse.<SupportTicketDto>builder()
                .content(tickets.getContent())
                .page(tickets.getNumber())
                .size(tickets.getSize())
                .totalElements(tickets.getTotalElements())
                .totalPages(tickets.getTotalPages())
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Create a new support ticket.
     * POST /api/support/tickets
     */
    @PostMapping("/tickets")
    public ResponseEntity<ApiResponse<SupportTicketDto>> createTicket(
            @Valid @RequestBody CreateTicketRequest request) {

        User user = SecurityUtils.getCurrentUser();
        SupportTicketDto ticket = supportService.createTicket(user, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Ticket created", ticket));
    }

    /**
     * Add a reply to a ticket.
     * POST /api/support/tickets/{ticketId}/replies
     */
    @PostMapping("/tickets/{ticketId}/replies")
    public ResponseEntity<ApiResponse<TicketReplyDto>> addReply(
            @PathVariable Long ticketId,
            @Valid @RequestBody AddReplyRequest request) {

        User user = SecurityUtils.getCurrentUser();
        TicketReplyDto reply = supportService.addReply(user, ticketId, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Reply added", reply));
    }
}
