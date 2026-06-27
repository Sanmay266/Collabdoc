package com.collabdoc.workflow.service;

import com.collabdoc.workflow.dto.CreateDocumentRequest;
import com.collabdoc.workflow.dto.DocumentResponse;
import com.collabdoc.workflow.dto.DocumentVersionResponse;
import com.collabdoc.workflow.dto.ShareDocumentRequest;

import java.util.List;

public interface DocumentService {

    DocumentResponse createDocument(CreateDocumentRequest request);

    List<DocumentResponse> getAllDocuments();

    DocumentResponse getDocumentById(Long id);

    DocumentResponse updateDocument(Long id, CreateDocumentRequest request);

    void deleteDocument(Long id);

    List<DocumentVersionResponse>
    getDocumentHistory(Long documentId);



    DocumentResponse restoreVersion(
            Long documentId,
            Long versionId);


    String shareDocument(
            Long documentId,
            ShareDocumentRequest request);


}