package com.example.message_converter.service.inter;

import com.example.message_converter.entity.PayLoadInOut;
import com.example.message_converter.entity.ObjetTronquee;
import com.example.message_converter.entity.TransformationError;

import java.util.List;
import java.util.Optional;

public interface PersistanceService {

    // PayLoadInOut
    PayLoadInOut savePayLoadInOut(PayLoadInOut payLoad);
    Optional<PayLoadInOut> getPayLoadInOutById(Long id);


    PayLoadInOut findByPayLoadIn(String payLoadIn);

// Ajoutez ces méthodes à votre PersistanceService

    List<PayLoadInOut> getAllPayLoadInOut();

    Optional<PayLoadInOut> findById(Long id);




    // ObjetTronquee
    ObjetTronquee saveObjetTronquee(ObjetTronquee objet);
    List<ObjetTronquee> getAllObjetsTronques();
    List<ObjetTronquee> getObjetsTronquesByPayLoad(PayLoadInOut payLoad);

    // TransformationError
    TransformationError saveTransformationError(TransformationError error);
    List<TransformationError> getAllTransformationErrors();
    List<TransformationError> getTransformationErrorsByPayLoad(PayLoadInOut payLoad);

    // Méthodes de suppression si besoin
    void deletePayLoadInOut(Long id);
    void deleteObjetTronquee(Long id);
    void deleteTransformationError(Long id);

}
