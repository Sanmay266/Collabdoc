package com.collabdoc.workflow.service.impl;

import com.collabdoc.workflow.dto.CreateDocumentRequest;
import com.collabdoc.workflow.dto.DocumentResponse;
import com.collabdoc.workflow.dto.DocumentVersionResponse;
import com.collabdoc.workflow.dto.ShareDocumentRequest;
import com.collabdoc.workflow.entity.Document;
import com.collabdoc.workflow.entity.DocumentPermission;
import com.collabdoc.workflow.entity.User;
import com.collabdoc.workflow.entity.DocumentVersion;
import com.collabdoc.workflow.enums.PermissionType;
import com.collabdoc.workflow.exception.ResourceNotFoundException;
import com.collabdoc.workflow.repository.DocumentPermissionRepository;
import com.collabdoc.workflow.repository.DocumentRepository;
import com.collabdoc.workflow.repository.DocumentVersionRepository;
import com.collabdoc.workflow.repository.UserRepository;
import com.collabdoc.workflow.service.DocumentService;
import jakarta.transaction.Transactional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;


import java.util.List;

@Service
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final DocumentPermissionRepository
            documentPermissionRepository;
    private final DocumentVersionRepository
            documentVersionRepository;


    public DocumentServiceImpl(
            DocumentRepository documentRepository,
            UserRepository userRepository,
            DocumentPermissionRepository documentPermissionRepository, DocumentVersionRepository documentVersionRepository) {

        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.documentPermissionRepository =
                documentPermissionRepository;
        this.documentVersionRepository = documentVersionRepository;
    }

    @Override
    public DocumentResponse createDocument(CreateDocumentRequest request) {

        Document document = new Document();

        document.setTitle(request.getTitle());
        document.setContent(request.getContent());

        String email =
                SecurityContextHolder.getContext()
                        .getAuthentication()
                        .getName();

        User owner = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        document.setOwner(owner);

        Document saved = documentRepository.save(document);

        return mapToResponse(saved);
    }

    private boolean canEdit(
            Document document,
            User user) {

        if (document.getOwner()
                .getId()
                .equals(user.getId())) {

            return true;
        }

        return documentPermissionRepository
                .findByDocumentAndUser(
                        document,
                        user)
                .map(permission ->
                        permission.getPermission()
                                == PermissionType.EDITOR)
                .orElse(false);
    }

    @Override
    public List<DocumentResponse> getAllDocuments() {

        String email =
                SecurityContextHolder.getContext()
                        .getAuthentication()
                        .getName();

        User owner = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        List<Document> ownedDocuments =
                documentRepository.findByOwner(owner);

        List<Document> sharedDocuments =
                documentRepository.findBySharedWith(owner);

        ownedDocuments.addAll(sharedDocuments);

        return ownedDocuments.stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public DocumentResponse getDocumentById(Long id) {

        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        return mapToResponse(document);
    }

    @Override
    public DocumentResponse updateDocument(
            Long id,
            CreateDocumentRequest request) {

        Document document = documentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Document not found"));

        String email =
                SecurityContextHolder.getContext()
                        .getAuthentication()
                        .getName();

        User currentUser =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"));

        if (!canEdit(document, currentUser)) {

            throw new RuntimeException(
                    "You do not have permission to edit this document");
        }

        DocumentVersion version =
                new DocumentVersion();

        version.setDocument(document);

        version.setTitle(document.getTitle());

        version.setContent(document.getContent());

        documentVersionRepository.save(version);

        document.setTitle(request.getTitle());
        document.setContent(request.getContent());

        Document updated =
                documentRepository.save(document);

        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteDocument(Long id) {

        Document document = documentRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Document not found"));

        String email =
                SecurityContextHolder.getContext()
                        .getAuthentication()
                        .getName();

        User currentUser =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "User not found"));



        if (!document.getOwner()
                .getId()
                .equals(currentUser.getId())) {

            throw new RuntimeException(
                    "Only owner can delete document");
        }
        System.out.println("Deleting versions...");
        documentVersionRepository.deleteByDocument(document);

        System.out.println("Deleting document...");
        documentRepository.delete(document);

        System.out.println("Delete complete");

    }






    @Override
    public DocumentResponse restoreVersion(
            Long documentId,
            Long versionId) {

        Document document =
                documentRepository.findById(documentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Document not found"));

        DocumentVersion version =
                documentVersionRepository
                        .findByIdAndDocument(
                                versionId,
                                document)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Version not found"));

        DocumentVersion backup =
                new DocumentVersion();

        backup.setDocument(document);
        backup.setTitle(document.getTitle());
        backup.setContent(document.getContent());

        documentVersionRepository.save(backup);

        document.setTitle(version.getTitle());
        document.setContent(version.getContent());

        Document restored =
                documentRepository.save(document);

        return mapToResponse(restored);
    }

    @Override
    public String shareDocument(
            Long documentId,
            ShareDocumentRequest request) {

        String email =
                SecurityContextHolder.getContext()
                        .getAuthentication()
                        .getName();

        User currentUser =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found"));

        Document document =
                documentRepository.findById(documentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Document not found"));

        if (!document.getOwner()
                .getId()
                .equals(currentUser.getId())) {

            throw new RuntimeException(
                    "Only owner can share document");
        }

        User targetUser =
                userRepository.findByEmail(
                                request.getEmail())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Target user not found"));

        DocumentPermission permission =
                new DocumentPermission();

        permission.setDocument(document);

        permission.setUser(targetUser);

        permission.setPermission(
                request.getPermission());

        documentPermissionRepository.save(
                permission);

        return "Document shared successfully";
    }

    @Override
    public List<DocumentVersionResponse>
    getDocumentHistory(Long documentId) {

        Document document =
                documentRepository.findById(documentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Document not found"));

        return documentVersionRepository
                .findByDocument(document)
                .stream()
                .map(version ->
                        new DocumentVersionResponse(
                                version.getId(),
                                version.getTitle(),
                                version.getContent(),
                                version.getCreatedAt()))
                .toList();
    }

    private DocumentResponse mapToResponse(Document document) {

        return new DocumentResponse(
                document.getId(),
                document.getTitle(),
                document.getContent()
        );
    }
}