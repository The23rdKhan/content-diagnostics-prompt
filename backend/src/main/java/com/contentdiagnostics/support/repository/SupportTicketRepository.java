package com.contentdiagnostics.support.repository;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.support.entity.SupportTicket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    Page<SupportTicket> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    Optional<SupportTicket> findByIdAndUser(Long id, User user);
}
