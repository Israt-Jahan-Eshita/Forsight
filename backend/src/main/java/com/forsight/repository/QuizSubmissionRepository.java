package com.forsight.repository;

import com.forsight.model.Quiz;
import com.forsight.model.QuizSubmission;
import com.forsight.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizSubmissionRepository extends JpaRepository<QuizSubmission, Long> {
    
    List<QuizSubmission> findByStudent(User student);
    
    List<QuizSubmission> findByQuizTeacher(User teacher);
    
    Optional<QuizSubmission> findByQuizAndStudent(Quiz quiz, User student);
}
