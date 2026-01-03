package com.contentdiagnostics.support.dto;

import com.contentdiagnostics.support.entity.TicketReply;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketReplyDto {
    private String id;
    private String ticketId;
    private String message;
    private String author;
    private Instant createdAt;

    public static TicketReplyDto fromEntity(TicketReply reply) {
        return TicketReplyDto.builder()
                .id(String.valueOf(reply.getId()))
                .ticketId(String.valueOf(reply.getTicket().getId()))
                .message(reply.getMessage())
                .author(reply.getAuthor().name())
                .createdAt(reply.getCreatedAt())
                .build();
    }
}
