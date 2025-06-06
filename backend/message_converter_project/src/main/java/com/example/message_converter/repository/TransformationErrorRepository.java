package com.example.message_converter.repository;

import com.example.message_converter.entity.PayLoadInOut;
import com.example.message_converter.entity.TransformationError;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransformationErrorRepository  extends JpaRepository<TransformationError, Long> {
    List<TransformationError> findByPayLoadInOut(PayLoadInOut payLoadInOut);
}
