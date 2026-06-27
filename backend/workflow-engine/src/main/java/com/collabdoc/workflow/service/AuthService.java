package com.collabdoc.workflow.service;

import com.collabdoc.workflow.dto.LoginRequest;
import com.collabdoc.workflow.dto.RegisterRequest;

public interface AuthService {

    String register(RegisterRequest request);

    String login(LoginRequest request);
}