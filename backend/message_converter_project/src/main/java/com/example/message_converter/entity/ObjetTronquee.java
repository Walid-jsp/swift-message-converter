package com.example.message_converter.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
public class ObjetTronquee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne
    @JoinColumn(name = "payLoad_id")
    @JsonBackReference
    private PayLoadInOut payLoadInOut;

    private String fieldName;
    private String originalValue;

    public ObjetTronquee() { }

    public ObjetTronquee(long id, PayLoadInOut payLoadInOut, String fieldName, String originalValue) {
        this.id = id;
        this.payLoadInOut = payLoadInOut;
        this.fieldName = fieldName;
        this.originalValue = originalValue;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public PayLoadInOut getPayLoadInOut() {
        return payLoadInOut;
    }

    public void setPayLoadInOut(PayLoadInOut payLoad) {
        this.payLoadInOut = payLoad;
    }

    public String getFieldName() {
        return fieldName;
    }

    public void setFieldName(String fieldName) {
        this.fieldName = fieldName;
    }

    public String getOriginalValue() {
        return originalValue;
    }

    public void setOriginalValue(String originalValue) {
        this.originalValue = originalValue;
    }
}
