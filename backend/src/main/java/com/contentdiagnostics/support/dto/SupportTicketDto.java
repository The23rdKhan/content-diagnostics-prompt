package com.contentdiagnostics.support.dto;

import com.contentdiagnostics.support.entity.SupportTicket;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupportTicketDto {
    private String id;
    private String subject;
    private String message;
    private String status;
    private String priority;
    private Instant createdAt;
    private Instant updatedAt;
    private List<TicketReplyDto> replies;

    public static SupportTicketDto fromEntity(SupportTicket ticket) {
        return SupportTicketDto.builder()
                .id(String.valueOf(ticket.getId()))
                .subject(ticket.getSubject())
                .message(ticket.getMessage())
                .status(ticket.getStatus().name())
                .priority(ticket.getPriority().name())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .replies(ticket.getReplies().stream()
                        .map(TicketReplyDto::fromEntity)
                        .collect(Collectors.toList()))
                .build();
    }
}
