package com.example.message_converter.controller;

import com.example.message_converter.entity.PayLoadInOut;
import com.example.message_converter.entity.TransformationError;
import com.example.message_converter.errors.XSDValidationError;
import com.example.message_converter.service.impl.TransformerFactory;
import com.example.message_converter.service.inter.MTValidationservice;
import com.example.message_converter.service.inter.PersistanceService;
import com.example.message_converter.service.inter.TransformerService;
import com.example.message_converter.service.inter.XSDValidationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/messages")
public class MessageConverterController {

    private final MTValidationservice mtValidationservice;
    private final TransformerFactory transformerFactory;
    private final XSDValidationService xsdValidationService;
    private final PersistanceService persistanceService;


    private static final String XSDPATH = "xsd/pacs.008.001.13.xsd";

    @Autowired
    public MessageConverterController(
            MTValidationservice mtValidationservice,
            TransformerFactory transformerFactory,
            XSDValidationService xsdValidationService, PersistanceService persistanceService) {
        this.mtValidationservice = mtValidationservice;
        this.transformerFactory = transformerFactory;
        this.xsdValidationService = xsdValidationService;
        this.persistanceService = persistanceService;
    }

    @PostMapping("/validate-mt")
    public ResponseEntity<?> validateMT(@RequestBody String mtMessage) {
        PayLoadInOut payLoad = new PayLoadInOut();
        payLoad.setPayLoadIn(mtMessage);
        payLoad.setTransformationDate(LocalDateTime.now());
        List<String> mtErrors = mtValidationservice.validate(mtMessage);

        if (!mtErrors.isEmpty()) {
            payLoad.setStatus("ERREUR VALIDATION MT");
            payLoad = persistanceService.savePayLoadInOut(payLoad);
            for (String error : mtErrors) {
                TransformationError err = new TransformationError();
                err.setErrorType("MT_VALIDATION_ERROR");
                err.setErrorMessage(error);
                err.setErrorDate(LocalDateTime.now());
                err.setPayLoadInOut(payLoad);
                persistanceService.saveTransformationError(err);
            }
            return ResponseEntity.badRequest().body(mtErrors);
        }

        payLoad.setStatus("SUCCESS");
        persistanceService.savePayLoadInOut(payLoad);
        return ResponseEntity.ok("MT Valide !");
    }




    @PostMapping("/transform-mt-to-mx")
    public ResponseEntity<?> transformMTtoMX(@RequestBody String mtMessage) {
        PayLoadInOut payLoadIn = persistanceService.findByPayLoadIn(mtMessage);
        if (payLoadIn == null) {
            payLoadIn = new PayLoadInOut();
            payLoadIn.setPayLoadIn(mtMessage);
            payLoadIn.setTransformationDate(LocalDateTime.now());
            payLoadIn.setStatus("IN_PROGRESS");
            payLoadIn = persistanceService.savePayLoadInOut(payLoadIn);
        }

        String mxXml;
        try {
            TransformerService transformer = transformerFactory.getTransformer("MT103_TO_PACS008");
            mxXml = transformer.transform(mtMessage);
            payLoadIn.setPayLoadOut(mxXml);
        } catch (Exception e) {
            payLoadIn.setStatus("ERREUR TECHNIQUE");
            persistanceService.savePayLoadInOut(payLoadIn);
            TransformationError err = new TransformationError();
            err.setErrorType("TRANSFORMATION_ERROR");
            err.setErrorMessage(e.getMessage());
            err.setErrorDate(LocalDateTime.now());
            err.setPayLoadInOut(payLoadIn);
            persistanceService.saveTransformationError(err);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la transformation : " + e.getMessage());
        }
        payLoadIn.setStatus("SUCCESS");
        persistanceService.savePayLoadInOut(payLoadIn);
        return ResponseEntity.ok(mxXml);
    }

    @PostMapping("/validate-mx-xsd")
    public ResponseEntity<?> validateMX_XSD(@RequestBody String mxMessage) {
        PayLoadInOut payLoad = new PayLoadInOut();
        payLoad.setPayLoadOut(mxMessage);
        payLoad.setTransformationDate(LocalDateTime.now());

        List<XSDValidationError> errors = xsdValidationService.validateXSD(mxMessage, XSDPATH);
        if (!errors.isEmpty()) {
            payLoad.setStatus("ERREUR VALIDATION XSD");
            payLoad = persistanceService.savePayLoadInOut(payLoad);
            for (XSDValidationError errXSD : errors) {
                TransformationError err = new TransformationError();
                err.setErrorType("XSD_VALIDATION_ERROR");
                err.setErrorMessage(errXSD.getMessage());
                err.setErrorDate(LocalDateTime.now());
                err.setPayLoadInOut(payLoad);
                persistanceService.saveTransformationError(err);
            }
            return ResponseEntity.badRequest().body(errors);
        }

        payLoad.setStatus("SUCCESS");
        persistanceService.savePayLoadInOut(payLoad);
        return ResponseEntity.ok("XSD Valide !");
    }
    @GetMapping("/history")
    public ResponseEntity<List<PayLoadInOut>> getHistory() {
        List<PayLoadInOut> history = persistanceService.getAllPayLoadInOut();
        return ResponseEntity.ok(history);
    }

    @DeleteMapping("/history/{id}")
    public ResponseEntity<?> deleteConversion(@PathVariable Long id) {
        persistanceService.deletePayLoadInOut(id);
        return ResponseEntity.ok("Conversion supprimée");
    }

    @PostMapping("/history/{id}/retry")
    public ResponseEntity<?> retryConversion(@PathVariable Long id) {
        Optional<PayLoadInOut> payLoad = persistanceService.findById(id);
        if (payLoad.isPresent()) {
            // Logique pour relancer la conversion
            return ResponseEntity.ok("Conversion relancée");
        }
        return ResponseEntity.notFound().build();
    }

    // Endpoint de santé simple
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Backend is running");
    }



}
