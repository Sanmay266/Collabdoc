package com.collabdoc.workflow.dto;

import com.collabdoc.workflow.enums.PermissionType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ShareDocumentRequest {

    @NotBlank
    @Email
    private String email;

    @NotNull
    private PermissionType permission;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public PermissionType getPermission() {
        return permission;
    }

    public void setPermission(PermissionType permission) {
        this.permission = permission;
    }
}