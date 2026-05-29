package com.forsight;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ForsightApplication {
    public static void main(String[] args) {
        SpringApplication.run(ForsightApplication.class, args);
    }
}