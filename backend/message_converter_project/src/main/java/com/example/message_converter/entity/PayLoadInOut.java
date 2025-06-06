package com.example.message_converter.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
public class PayLoadInOut {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(columnDefinition = "TEXT")
    private String payLoadIn;

    @Column(columnDefinition = "TEXT")
    private String payLoadOut;
    private String status;
    private LocalDateTime transformationDate;

    @OneToMany(mappedBy = "payLoadInOut", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ObjetTronquee> objetTronquees;

    @OneToMany(mappedBy = "payLoadInOut", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<TransformationError> transformationErrors;

    public PayLoadInOut() { }

    public PayLoadInOut(long id, String payLoadIn, String payLoadOut, String status, LocalDateTime transformationDate) {
        this.id = id;
        this.payLoadIn = payLoadIn;
        this.payLoadOut = payLoadOut;
        this.status = status;
        this.transformationDate = transformationDate;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getPayLoadIn() {
        return payLoadIn;
    }

    public void setPayLoadIn(String payLoadIn) {
        this.payLoadIn = payLoadIn;
    }

    public String getPayLoadOut() {
        return payLoadOut;
    }

    public void setPayLoadOut(String payLoadOut) {
        this.payLoadOut = payLoadOut;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getTransformationDate() {
        return transformationDate;
    }

    public void setTransformationDate(LocalDateTime transformationDate) {
        this.transformationDate = transformationDate;
    }

    public List<ObjetTronquee> getObjetTronquees() {
        return objetTronquees;
    }

    public void setObjetTronquees(List<ObjetTronquee> objetTronquees) {
        this.objetTronquees = objetTronquees;
    }

    public List<TransformationError> getTransformationErrors() {
        return transformationErrors;
    }

    public void setTransformationErrors(List<TransformationError> transformationErrors) {
        this.transformationErrors = transformationErrors;
    }
}
