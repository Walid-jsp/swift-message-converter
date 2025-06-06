package com.example.message_converter.mapper;



import com.ctc.wstx.stax.WstxInputFactory;
import javax.xml.stream.*;
import java.io.StringReader;
import java.util.HashMap;
import java.util.Map;

public class XmlLineElementMapper {
    public static Map<Integer, String> mapLineToElement(String xmlContent) throws Exception {
        Map<Integer, String> map = new HashMap<>();
        XMLInputFactory factory = new WstxInputFactory();
        XMLStreamReader reader = factory.createXMLStreamReader(new StringReader(xmlContent));
        while (reader.hasNext()) {
            int event = reader.next();
            if (event == XMLStreamConstants.START_ELEMENT) {
                map.put(reader.getLocation().getLineNumber(), reader.getLocalName());
            }
        }
        reader.close();
        return map;
    }
}
