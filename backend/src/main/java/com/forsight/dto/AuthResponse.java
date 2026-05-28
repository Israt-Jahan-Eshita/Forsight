package com.forsight.dto;

import com.forsight.model.User;

public class AuthResponse {
    private String token;
    private String rawPassword; // Only populated for newly provisioned accounts (shown once!)
    private User user;

    public AuthResponse() {}

    public AuthResponse(String token, String rawPassword, User user) {
        this.token = token;
        this.rawPassword = rawPassword;
        this.user = user;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getRawPassword() { return rawPassword; }
    public void setRawPassword(String rawPassword) { this.rawPassword = rawPassword; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
