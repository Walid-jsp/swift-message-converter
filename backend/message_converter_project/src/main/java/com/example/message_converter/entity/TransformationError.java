package com.example.message_converter.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class TransformationError {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne
    @JoinColumn(name = "payLoad_id")
    @JsonBackReference
    private PayLoadInOut payLoadInOut;

    private String errorType;

    @Column(columnDefinition = "TEXT")
    private String errorMessage;
    private LocalDateTime errorDate;

    public TransformationError() { }

    public TransformationError(long id, PayLoadInOut payLoadInOut, String errorType, String errorMessage, LocalDateTime errorDate) {
        this.id = id;
        this.payLoadInOut = payLoadInOut;
        this.errorType = errorType;
        this.errorMessage = errorMessage;
        this.errorDate = errorDate;
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

    public String getErrorType() {
        return errorType;
    }

    public void setErrorType(String errorType) {
        this.errorType = errorType;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public LocalDateTime getErrorDate() {
        return errorDate;
    }

    public void setErrorDate(LocalDateTime errorDate) {
        this.errorDate = errorDate;
    }
}
