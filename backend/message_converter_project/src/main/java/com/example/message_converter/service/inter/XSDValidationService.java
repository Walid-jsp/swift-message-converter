package com.example.message_converter.service.inter;

import com.example.message_converter.errors.XSDValidationError;

import java.util.List;

public interface XSDValidationService
{
    List<XSDValidationError> validateXSD(String xmlMessage , String xsdPath);


}
