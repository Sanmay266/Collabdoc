package com.collabdoc.workflow.repository;

import com.collabdoc.workflow.entity.Document;
import com.collabdoc.workflow.entity.DocumentVersion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DocumentVersionRepository
        extends JpaRepository<DocumentVersion, Long> {

    List<DocumentVersion> findByDocument(Document document);

    Optional<DocumentVersion> findByIdAndDocument(
            Long versionId,
            Document document
    );

    void deleteByDocument(Document document);
}