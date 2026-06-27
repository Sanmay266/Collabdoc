package com.collabdoc.workflow.controller;

import com.collabdoc.workflow.dto.DocumentEditMessage;
import com.collabdoc.workflow.dto.PresenceMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
public class DocumentWebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;


    @MessageMapping("/document/join")
    public void joinDocument(
            PresenceMessage message) {

        messagingTemplate.convertAndSend(
                "/topic/presence/" + message.getDocumentId(),
                message
        );
    }

    @MessageMapping("/document/edit")
    public void editDocument(
            DocumentEditMessage message) {

        System.out.println(
                "Received edit for document: "
                        + message.getDocumentId());

        messagingTemplate.convertAndSend(
                "/topic/document/"
                        + message.getDocumentId(),
                message
        );
    }
}