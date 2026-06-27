package com.collabdoc.workflow.controller;

import com.collabdoc.workflow.dto.LoginRequest;
import com.collabdoc.workflow.dto.RegisterRequest;
import com.collabdoc.workflow.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public String register(
            @Valid @RequestBody RegisterRequest request) {

        return authService.register(request);
    }

    @PostMapping("/login")
    public String login(
            @Valid @RequestBody LoginRequest request) {

        return authService.login(request);
    }

    @GetMapping("/test")
    public String test() {
        return "JWT working";
    }
}