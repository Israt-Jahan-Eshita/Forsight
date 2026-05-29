package com.forsight.repository;

import com.forsight.model.Resource;
import com.forsight.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByCourse_Id(Long courseId);
    
    List<Resource> findByTeacher(User teacher);
}
