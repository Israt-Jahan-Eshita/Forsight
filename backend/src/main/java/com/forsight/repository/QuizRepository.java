package com.forsight.repository;

import com.forsight.model.Quiz;
import com.forsight.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    
    List<Quiz> findByClassNameAndSubject(String className, String subject);
    
    List<Quiz> findByTeacher(User teacher);

    @Query("SELECT DISTINCT q.className FROM Quiz q")
    List<String> findDistinctClassNames();

    @Query("SELECT DISTINCT q.subject FROM Quiz q WHERE q.className = :className")
    List<String> findDistinctSubjectsByClassName(@Param("className") String className);
}
