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
    
    List<Resource> findByClassName(String className);
    
    List<Resource> findByClassNameAndSubject(String className, String subject);
    
    List<Resource> findByTeacher(User teacher);

    @Query("SELECT DISTINCT r.className FROM Resource r")
    List<String> findDistinctClassNames();

    @Query("SELECT DISTINCT r.subject FROM Resource r WHERE r.className = :className")
    List<String> findDistinctSubjectsByClassName(@Param("className") String className);
}
