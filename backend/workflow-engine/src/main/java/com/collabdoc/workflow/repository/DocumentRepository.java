package com.collabdoc.workflow.repository;


import com.collabdoc.workflow.entity.Document;
import com.collabdoc.workflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentRepository
        extends JpaRepository<Document, Long> {

    List<Document> findByOwner(User owner);

    List<Document> findBySharedWith(User user);
}
