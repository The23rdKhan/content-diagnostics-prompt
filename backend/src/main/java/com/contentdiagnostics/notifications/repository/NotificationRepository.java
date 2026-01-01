package com.contentdiagnostics.notifications.repository;

import com.contentdiagnostics.auth.entity.User;
import com.contentdiagnostics.notifications.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Notification entities.
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Find all notifications for a user.
     */
    Page<Notification> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    /**
     * Find recent notifications for a user.
     */
    List<Notification> findTop50ByUserOrderByCreatedAtDesc(User user);

    /**
     * Count unread notifications.
     */
    long countByUserAndIsReadFalse(User user);

    /**
     * Mark specific notifications as read.
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.id IN :ids AND n.user = :user")
    int markAsRead(@Param("ids") List<Long> ids, @Param("user") User user);

    /**
     * Mark all notifications as read for a user.
     */
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user = :user AND n.isRead = false")
    int markAllAsRead(@Param("user") User user);
}
