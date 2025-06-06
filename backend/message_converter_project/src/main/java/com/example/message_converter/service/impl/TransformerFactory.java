package com.example.message_converter.service.impl;

import com.example.message_converter.service.inter.TransformerService;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;
import com.example.message_converter.service.inter.TransformerService;

@Component
public class TransformerFactory {

    private final ApplicationContext context;

    // Injection via constructeur (bonne pratique)
    public TransformerFactory(ApplicationContext context) {
        this.context = context;
    }

    public TransformerService getTransformer(String messageType) {
        switch (messageType) {
            case "MT103_TO_PACS008":
                return (TransformerService) context.getBean(Mt103ToPacs008Transformer.class);
            default:
                throw new IllegalArgumentException(
                        "Type de transformation non supporté : " + messageType
                );
        }
    }
}
