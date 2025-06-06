package com.example.message_converter.service.impl;

import com.example.message_converter.entity.PayLoadInOut;
import com.example.message_converter.entity.ObjetTronquee;
import com.example.message_converter.entity.TransformationError;
import com.example.message_converter.repository.PayLoadRepository;
import com.example.message_converter.repository.ObjetTronqueeRepository;
import com.example.message_converter.repository.TransformationErrorRepository;
import com.example.message_converter.service.inter.PersistanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class PersistanceServiceImpl implements PersistanceService {

    private final PayLoadRepository payLoadInOutRepository;
    private final ObjetTronqueeRepository objetTronqueeRepository;
    private final TransformationErrorRepository transformationErrorRepository;

    @Autowired
    public PersistanceServiceImpl(PayLoadRepository payLoadInOutRepository,
                                  ObjetTronqueeRepository objetTronqueeRepository,
                                  TransformationErrorRepository transformationErrorRepository) {
        this.payLoadInOutRepository = payLoadInOutRepository;
        this.objetTronqueeRepository = objetTronqueeRepository;
        this.transformationErrorRepository = transformationErrorRepository;
    }

    // PayLoadInOut
    @Transactional
    @Override
    public PayLoadInOut savePayLoadInOut(PayLoadInOut payLoad) {
        return payLoadInOutRepository.save(payLoad);
    }

    @Override
    public Optional<PayLoadInOut> getPayLoadInOutById(Long id) {
        return payLoadInOutRepository.findById(id);
    }

    @Override
    public List<PayLoadInOut> getAllPayLoadInOut() {
        return payLoadInOutRepository.findAll();
    }

    @Override
    public Optional<PayLoadInOut> findById(Long id) {
        return payLoadInOutRepository.findById(id);
    }

    @Override
    public PayLoadInOut findByPayLoadIn(String payLoadIn) {
        return payLoadInOutRepository.findByPayLoadIn(payLoadIn);
    }






    // ObjetTronquee
    @Transactional
    @Override
    public ObjetTronquee saveObjetTronquee(ObjetTronquee objet) {
        return objetTronqueeRepository.save(objet);
    }

    @Override
    public List<ObjetTronquee> getAllObjetsTronques() {
        return objetTronqueeRepository.findAll();
    }

    @Override
    public List<ObjetTronquee> getObjetsTronquesByPayLoad(PayLoadInOut payLoad) {
        return objetTronqueeRepository.findByPayLoadInOut(payLoad);
    }

    // TransformationError
    @Transactional
    @Override
    public TransformationError saveTransformationError(TransformationError error) {
        return transformationErrorRepository.save(error);
    }

    @Override
    public List<TransformationError> getAllTransformationErrors() {
        return transformationErrorRepository.findAll();
    }

    @Override
    public List<TransformationError> getTransformationErrorsByPayLoad(PayLoadInOut payLoad) {
        return transformationErrorRepository.findByPayLoadInOut(payLoad);
    }

    // Suppression (optionnelle)
    @Transactional
    @Override
    public void deletePayLoadInOut(Long id) {
        payLoadInOutRepository.deleteById(id);
    }

    @Transactional
    @Override
    public void deleteObjetTronquee(Long id) {
        objetTronqueeRepository.deleteById(id);
    }

    @Transactional
    @Override
    public void deleteTransformationError(Long id) {
        transformationErrorRepository.deleteById(id);
    }
}
