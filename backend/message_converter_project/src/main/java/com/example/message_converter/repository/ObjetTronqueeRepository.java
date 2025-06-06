package com.example.message_converter.repository;

import com.example.message_converter.entity.ObjetTronquee;
import com.example.message_converter.entity.PayLoadInOut;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ObjetTronqueeRepository extends JpaRepository<ObjetTronquee,Long> {

    List<ObjetTronquee> findByPayLoadInOut(PayLoadInOut payLoadInOut);
}
