package com.example.message_converter.errors;

public class XSDValidationError {
    private String element;
    private String value;
    private int line;
    private String message;

    public XSDValidationError(String element, String value, int line, String message) {
        this.element = element;
        this.value = value;
        this.line = line;
        this.message = message;
    }

    public String getElement() { return element; }
    public String getValue() { return value; }
    public int getLine() { return line; }
    public String getMessage() { return message; }


}
