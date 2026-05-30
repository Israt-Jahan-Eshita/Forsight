package com.forsight.repository;

import com.forsight.model.Notification;
import com.forsight.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByTimestampDesc(User user);
}
