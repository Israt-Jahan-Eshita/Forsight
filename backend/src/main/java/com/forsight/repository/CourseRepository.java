package com.forsight.repository;

import com.forsight.model.Course;
import com.forsight.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByTeacher(User teacher);
    List<Course> findByClassName(String className);

    @Query("SELECT DISTINCT c.className FROM Course c")
    List<String> findDistinctClassNames();
}
