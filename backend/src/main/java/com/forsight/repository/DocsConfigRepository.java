package com.forsight.repository;

import com.forsight.model.DocsConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocsConfigRepository extends JpaRepository<DocsConfig, Long> {
}
