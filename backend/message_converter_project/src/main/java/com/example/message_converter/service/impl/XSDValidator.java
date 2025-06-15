package com.example.message_converter.service.impl;

import com.example.message_converter.errors.XSDValidationError;
import com.example.message_converter.service.inter.XSDValidationService;
import com.example.message_converter.mapper.XmlLineElementMapper;
import org.springframework.stereotype.Service;
import org.xml.sax.SAXException;
import org.xml.sax.SAXParseException;

import javax.xml.transform.stream.StreamSource;
import javax.xml.validation.*;
import java.io.IOException;
import java.io.StringReader;
import java.util.*;

@Service
public class XSDValidator implements XSDValidationService {

    @Override
    public List<XSDValidationError> validateXSD(String xmlMessage, String xsdPath) {
        List<XSDValidationError> errors = new ArrayList<>();
        Map<Integer, String> lineToElement = new HashMap<>();
        Set<String> seen = new HashSet<>();
        try {
            lineToElement = XmlLineElementMapper.mapLineToElement(xmlMessage);

            SchemaFactory factory = SchemaFactory.newInstance("http://www.w3.org/2001/XMLSchema");
            Schema schema = factory.newSchema(new StreamSource(
                    getClass().getClassLoader().getResourceAsStream(xsdPath)));
            Validator validator = schema.newValidator();

            Map<Integer, String> finalLineToElement = lineToElement;
            validator.setErrorHandler(new org.xml.sax.helpers.DefaultHandler() {
                @Override
                public void error(SAXParseException e) throws SAXException {
                    errors.add(clarifySaxError(e, xmlMessage, e.getMessage(), finalLineToElement));
                }
                @Override
                public void fatalError(SAXParseException e) throws SAXException {
                    errors.add(clarifySaxError(e, xmlMessage, e.getMessage(), finalLineToElement));
                }
            });

            validator.validate(new StreamSource(new StringReader(xmlMessage)));
        } catch (SAXException e) {
            errors.add(new XSDValidationError("?", "?", -1, "Erreur XSD : " + e.getMessage()));
        } catch (IOException e) {
            errors.add(new XSDValidationError("?", "?", -1, "Erreur lecture XML/XSD : " + e.getMessage()));
        } catch (Exception e) {
            errors.add(new XSDValidationError("?", "?", -1, "Erreur parsing XML : " + e.getMessage()));
        }

        // Déduplication des erreurs
        List<XSDValidationError> deduped = new ArrayList<>();
        for (XSDValidationError err : errors) {
            String key = err.getElement() + "|" + err.getLine() + "|" + err.getMessage();
            if (!seen.contains(key)) {
                deduped.add(err);
                seen.add(key);
            }
        }
        return deduped;
    }

    private XSDValidationError clarifySaxError(SAXParseException ex, String xml, String raw, Map<Integer, String> lineToElement) {
        int line = ex.getLineNumber();
        String element = findClosestElement(lineToElement, line, raw);
        String value = extractElementValue(xml, line, element);
        String message = clarifyMessage(raw, element);
        return new XSDValidationError(element, value, line, message);
    }

    private String findClosestElement(Map<Integer, String> map, int line, String raw) {
        for (int l = line; l >= 1; l--) {
            if (map.containsKey(l)) {
                return map.get(l);
            }
        }
        return extractElementName(raw);
    }

    private String clarifyMessage(String raw, String element) {
        if (raw.contains("cvc-complex-type.2.4.a")) {
            return "An expected element is missing or misplaced: " + element + ". Please check the order and presence of your XML tags.";
        } else if (raw.contains("cvc-complex-type.2.4.b")) {
            return "This element is incomplete. A required sub-element is missing in: " + element + ".";
        } else if (raw.contains("cvc-datatype-valid.1.2.1")) {
            return "The value type is invalid (e.g., wrong date, text instead of a number, etc.).";
        } else if (raw.contains("cvc-enumeration-valid")) {
            return "The value provided is not allowed for: " + element + " (invalid enumeration).";
        } else if (raw.contains("cvc-pattern-valid")) {
            return "Invalid format for: " + element + " (e.g., IBAN, BIC, etc.).";
        } else if (raw.contains("cvc-type.3.1.3")) {
            return "The value does not match the expected type for: " + element + ".";
        }
        // Ajoute d'autres cas si besoin
        return raw;
    }


    private String extractElementName(String message) {
        int idx = message.indexOf("element '");
        if (idx != -1) {
            int start = idx + "element '".length();
            int end = message.indexOf("'", start);
            if (end != -1) return message.substring(start, end);
        }
        return "?";
    }

    // Version améliorée pour éviter la balise fermante dans value
    private String extractElementValue(String xml, int lineNumber, String element) {
        String[] lines = xml.split("\n");
        if (lineNumber > 0 && lineNumber <= lines.length && element != null && !element.equals("?")) {
            String line = lines[lineNumber - 1].trim();
            // Recherche de <element>valeur</element>
            String openTag = "<" + element;
            int openIdx = line.indexOf(openTag);
            int gtIdx = line.indexOf('>', openIdx);
            int closeIdx = line.indexOf("</" + element + ">");
            if (openIdx != -1 && gtIdx != -1 && closeIdx != -1 && gtIdx < closeIdx) {
                return line.substring(gtIdx + 1, closeIdx).trim();
            }
            // Si c’est un champ vide : <Tag></Tag>
            if (openIdx != -1 && gtIdx != -1 && line.endsWith("></" + element + ">")) {
                return "";
            }
        }
        return "?";
    }
}