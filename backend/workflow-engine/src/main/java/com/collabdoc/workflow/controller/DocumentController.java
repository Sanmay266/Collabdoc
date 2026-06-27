package com.collabdoc.workflow.controller;

import com.collabdoc.workflow.dto.CreateDocumentRequest;
import com.collabdoc.workflow.dto.DocumentResponse;
import com.collabdoc.workflow.dto.DocumentVersionResponse;
import com.collabdoc.workflow.dto.ShareDocumentRequest;
import com.collabdoc.workflow.entity.Document;
import com.collabdoc.workflow.service.DocumentService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping
    public DocumentResponse createDocument(
             @Valid @RequestBody CreateDocumentRequest request) {

        return documentService.createDocument(request);
    }

    @GetMapping
    public List<DocumentResponse> getAllDocuments() {
        return documentService.getAllDocuments();
    }

    @GetMapping("/{id}")
    public DocumentResponse getDocumentById(@PathVariable Long id) {
        return documentService.getDocumentById(id);
    }

    @PutMapping("/{id}")
    public DocumentResponse updateDocument(
            @PathVariable Long id,
           @Valid @RequestBody CreateDocumentRequest request) {

        return documentService.updateDocument(id, request);
    }

    @DeleteMapping("/{id}")
    public String deleteDocument(@PathVariable Long id) {

        documentService.deleteDocument(id);

        return "Document deleted successfully";
    }

    @GetMapping("/{id}/history")
    public List<DocumentVersionResponse>
    getDocumentHistory(
            @PathVariable Long id) {

        return documentService
                .getDocumentHistory(id);
    }

    @PostMapping("/{id}/share")
    public String shareDocument(
            @PathVariable Long id,
            @RequestBody ShareDocumentRequest request) {

        return documentService.shareDocument(
                id,
                request);
    }

    @PostMapping("/{documentId}/restore/{versionId}")
    public DocumentResponse restoreVersion(
            @PathVariable Long documentId,
            @PathVariable Long versionId) {

        return documentService
                .restoreVersion(
                        documentId,
                        versionId);
    }
}