package com.contentdiagnostics.support.repository;

import com.contentdiagnostics.support.entity.TicketReply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketReplyRepository extends JpaRepository<TicketReply, Long> {
}
