package com.contentdiagnostics.billing.repository;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.billing.entity.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Page<Invoice> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    Optional<Invoice> findByIdAndUser(Long id, User user);
    Optional<Invoice> findByStripeInvoiceId(String stripeInvoiceId);
}
