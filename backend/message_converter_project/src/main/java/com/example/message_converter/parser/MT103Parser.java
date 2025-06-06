package com.example.message_converter.parser;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MT103Parser {


    public static String extractBlock(String mtMessage, int blockNumber) {
        String startTag = "{" + blockNumber + ":";
        int start = mtMessage.indexOf(startTag);
        if (start == -1) return "";
        int end = mtMessage.indexOf("}", start);
        if (end == -1) return "";
        return mtMessage.substring(start + startTag.length(), end).trim();
    }

    // Extraction spéciale du bloc 4
    public static String extractBlock4(String mtMessage) {
        int start = mtMessage.indexOf("{4:");
        if (start == -1) return mtMessage;
        int end = mtMessage.indexOf("-}", start);
        if (end == -1) end = mtMessage.length();
        return mtMessage.substring(start + 3, end).trim();
    }

    public static Map<String, String> parseBlock4(String mtMessage) {
        Map<String, String> tagmap = new LinkedHashMap<>();
        if (mtMessage == null || mtMessage.isEmpty()) return tagmap;
        String block4 = extractBlock4(mtMessage);
        Pattern pattern = Pattern.compile("(:\\d{2}[A-Z]?:)([\\s\\S]*?)(?=:\\d{2}[A-Z]?\\:|$)");
        Matcher matcher = pattern.matcher(block4);
        while (matcher.find()) {
            String tag = matcher.group(1).trim();
            String value = matcher.group(2).trim();
            tagmap.put(tag, value);
        }
        return tagmap;
    }
}
