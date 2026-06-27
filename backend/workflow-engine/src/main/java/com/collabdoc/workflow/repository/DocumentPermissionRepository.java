package com.collabdoc.workflow.repository;

import com.collabdoc.workflow.entity.Document;
import com.collabdoc.workflow.entity.DocumentPermission;
import com.collabdoc.workflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DocumentPermissionRepository
        extends JpaRepository<DocumentPermission, Long> {

    List<DocumentPermission> findByUser(User user);

    List<DocumentPermission> findByDocument(Document document);

    Optional<DocumentPermission> findByDocumentAndUser(
            Document document,
            User user
    );
}