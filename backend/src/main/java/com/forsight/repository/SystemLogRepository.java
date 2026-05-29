package com.forsight.repository;

import com.forsight.model.SystemLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SystemLogRepository extends JpaRepository<SystemLog, Long> {
    List<SystemLog> findTop10ByOrderByTimestampDesc();
}
