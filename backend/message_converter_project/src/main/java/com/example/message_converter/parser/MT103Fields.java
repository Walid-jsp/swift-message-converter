package com.example.message_converter.parser;

import java.util.Arrays;
import java.util.Map;

public class MT103Fields {
    // Blocs d’en-tête SWIFT
    private String block1;
    private String block2;
    private String block3;

    // Champs business (bloc 4)
    private String reference;      // :20:
    private String typeOperation;  // :23B:
    private String date;           // :32A:
    private String currency;
    private String amount;

    // Tag 50 - Ordering Customer
    private String orderingCustomerBic;     // :50A:
    private String orderingCustomerIban;    // :50F:/:50K:
    private String orderingCustomerName;
    private String orderingCustomerAddress;
    private String orderingCustomerCountry;
    private String orderingCustomerRaw;

    // Tag 52 - Ordering Institution
    private String orderingInstitutionBic;      // :52A:
    private String orderingInstitutionName;     // :52D:
    private String orderingInstitutionAddress;

    // Tag 57 - Account With Institution (Beneficiary’s Bank)
    private String accountWithInstitutionBic;      // :57A:
    private String accountWithInstitutionName;     // :57D:
    private String accountWithInstitutionAddress;

    // Tag 59 - Beneficiary Customer
    private String beneficiaryIban;            // :59: ou :59A:
    private String beneficiaryName;
    private String beneficiaryAddress;
    private String beneficiaryCountry;
    private String beneficiaryRaw;

    private String remittanceInfo; // :70:
    private String chargeDetails;  // :71A:

    // Champs supplémentaires
    private String intermediaryBIC;        // :53B:
    private String correspondentBIC;       // :54A:
    private String detailsOfCharges;       // :71F:
    private String exchangeRate;           // :36:
    private String instructionCode;        // :23E:

    public String getBlock1() {
        return block1;
    }

    public void setBlock1(String block1) {
        this.block1 = block1;
    }

    public String getBlock2() {
        return block2;
    }

    public void setBlock2(String block2) {
        this.block2 = block2;
    }

    public String getBlock3() {
        return block3;
    }

    public void setBlock3(String block3) {
        this.block3 = block3;
    }

    public String getOrderingCustomerCity() {
        return orderingCustomerCountry;
    }

    public void setOrderingCustomerCity(String orderingCustomerCountry) {
        this.orderingCustomerCountry = orderingCustomerCountry;
    }

    public String getBeneficiaryCountry() {
        return beneficiaryCountry;
    }

    public void setBeneficiaryCountry(String beneficiaryCountry) {
        this.beneficiaryCountry = beneficiaryCountry;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public String getTypeOperation() {
        return typeOperation;
    }

    public void setTypeOperation(String typeOperation) {
        this.typeOperation = typeOperation;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getAmount() {
        return amount;
    }

    public void setAmount(String amount) {
        this.amount = amount;
    }

    public String getOrderingCustomerBic() {
        return orderingCustomerBic;
    }

    public void setOrderingCustomerBic(String orderingCustomerBic) {
        this.orderingCustomerBic = orderingCustomerBic;
    }

    public String getOrderingCustomerIban() {
        return orderingCustomerIban;
    }

    public void setOrderingCustomerIban(String orderingCustomerIban) {
        this.orderingCustomerIban = orderingCustomerIban;
    }

    public String getOrderingCustomerName() {
        return orderingCustomerName;
    }

    public void setOrderingCustomerName(String orderingCustomerName) {
        this.orderingCustomerName = orderingCustomerName;
    }

    public String getOrderingCustomerAddress() {
        return orderingCustomerAddress;
    }

    public void setOrderingCustomerAddress(String orderingCustomerAddress) {
        this.orderingCustomerAddress = orderingCustomerAddress;
    }

    public String getOrderingCustomerRaw() {
        return orderingCustomerRaw;
    }

    public void setOrderingCustomerRaw(String orderingCustomerRaw) {
        this.orderingCustomerRaw = orderingCustomerRaw;
    }

    public String getOrderingInstitutionBic() {
        return orderingInstitutionBic;
    }

    public void setOrderingInstitutionBic(String orderingInstitutionBic) {
        this.orderingInstitutionBic = orderingInstitutionBic;
    }

    public String getOrderingInstitutionName() {
        return orderingInstitutionName;
    }

    public void setOrderingInstitutionName(String orderingInstitutionName) {
        this.orderingInstitutionName = orderingInstitutionName;
    }

    public String getOrderingInstitutionAddress() {
        return orderingInstitutionAddress;
    }

    public void setOrderingInstitutionAddress(String orderingInstitutionAddress) {
        this.orderingInstitutionAddress = orderingInstitutionAddress;
    }

    public String getAccountWithInstitutionBic() {
        return accountWithInstitutionBic;
    }

    public void setAccountWithInstitutionBic(String accountWithInstitutionBic) {
        this.accountWithInstitutionBic = accountWithInstitutionBic;
    }

    public String getAccountWithInstitutionName() {
        return accountWithInstitutionName;
    }

    public void setAccountWithInstitutionName(String accountWithInstitutionName) {
        this.accountWithInstitutionName = accountWithInstitutionName;
    }

    public String getAccountWithInstitutionAddress() {
        return accountWithInstitutionAddress;
    }

    public void setAccountWithInstitutionAddress(String accountWithInstitutionAddress) {
        this.accountWithInstitutionAddress = accountWithInstitutionAddress;
    }

    public String getBeneficiaryIban() {
        return beneficiaryIban;
    }

    public void setBeneficiaryIban(String beneficiaryIban) {
        this.beneficiaryIban = beneficiaryIban;
    }

    public String getBeneficiaryName() {
        return beneficiaryName;
    }

    public void setBeneficiaryName(String beneficiaryName) {
        this.beneficiaryName = beneficiaryName;
    }

    public String getBeneficiaryAddress() {
        return beneficiaryAddress;
    }

    public void setBeneficiaryAddress(String beneficiaryAddress) {
        this.beneficiaryAddress = beneficiaryAddress;
    }

    public String getBeneficiaryRaw() {
        return beneficiaryRaw;
    }

    public void setBeneficiaryRaw(String beneficiaryRaw) {
        this.beneficiaryRaw = beneficiaryRaw;
    }

    public String getRemittanceInfo() {
        return remittanceInfo;
    }

    public void setRemittanceInfo(String remittanceInfo) {
        this.remittanceInfo = remittanceInfo;
    }

    public String getChargeDetails() {
        return chargeDetails;
    }

    public void setChargeDetails(String chargeDetails) {
        this.chargeDetails = chargeDetails;
    }

    public String getIntermediaryBIC() {
        return intermediaryBIC;
    }

    public void setIntermediaryBIC(String intermediaryBIC) {
        this.intermediaryBIC = intermediaryBIC;
    }

    public String getCorrespondentBIC() {
        return correspondentBIC;
    }

    public void setCorrespondentBIC(String correspondentBIC) {
        this.correspondentBIC = correspondentBIC;
    }

    public String getDetailsOfCharges() {
        return detailsOfCharges;
    }

    public void setDetailsOfCharges(String detailsOfCharges) {
        this.detailsOfCharges = detailsOfCharges;
    }

    public String getExchangeRate() {
        return exchangeRate;
    }

    public void setExchangeRate(String exchangeRate) {
        this.exchangeRate = exchangeRate;
    }

    public String getInstructionCode() {
        return instructionCode;
    }

    public void setInstructionCode(String instructionCode) {
        this.instructionCode = instructionCode;
    }

    public String getOrderingCustomerCountry() {
        return orderingCustomerCountry;
    }

    public void setOrderingCustomerCountry(String orderingCustomerCountry) {
        this.orderingCustomerCountry = orderingCustomerCountry;
    }

    // Création d'un MT103Fields à partir du parsing complet
    public static MT103Fields fromParsedData(Map<String, String> tagMap, String block1, String block2, String block3) {
        MT103Fields fields = new MT103Fields();

        fields.setBlock1(block1);
        fields.setBlock2(block2);
        fields.setBlock3(block3);

        fields.setReference(tagMap.getOrDefault(":20:", ""));
        fields.setTypeOperation(tagMap.getOrDefault(":23B:", ""));

        String field32A = tagMap.getOrDefault(":32A:", "");
        if (!field32A.isEmpty() && field32A.length() >= 9) {
            fields.setDate(field32A.substring(0, 6));
            fields.setCurrency(field32A.substring(6, 9));
            fields.setAmount(field32A.substring(9));
        }

        // 50 (Ordering Customer)
        for (String tag : Arrays.asList(":50A:", ":50F:", ":50K:")) {
            if (tagMap.containsKey(tag)) {
                String value = tagMap.get(tag).trim();
                fields.setOrderingCustomerRaw(value);
                if (tag.equals(":50A:")) {
                    // BIC seulement
                    fields.setOrderingCustomerBic(value);
                } else {
                    // :50F: ou :50K: => /IBAN\nNOM\nADRESSE
                    String[] parts = value.split("\n");
                    fields.setOrderingCustomerIban(parts.length > 0 ? parts[0].replace("/", "").trim() : "");
                    fields.setOrderingCustomerName(parts.length > 1 ? parts[1].trim() : "");
                    fields.setOrderingCustomerAddress(parts.length > 2 ? parts[2].trim() : "");
                    fields.setOrderingCustomerCity(parts.length>3 ? parts[3].trim() : "");
                }
                break; // On ne prend que le premier trouvé
            }
        }

        // 52 (Ordering Institution)
        for (String tag : Arrays.asList(":52A:", ":52D:")) {
            if (tagMap.containsKey(tag)) {
                String value = tagMap.get(tag).trim();
                if (tag.equals(":52A:")) {
                    fields.setOrderingInstitutionBic(value);
                } else {
                    String[] parts = value.split("\n");
                    fields.setOrderingInstitutionName(parts.length > 0 ? parts[0].trim() : "");
                    fields.setOrderingInstitutionAddress(parts.length > 1 ? parts[1].trim() : "");
                }
                break;
            }
        }

        //57 (Account With Institution)
        for (String tag : Arrays.asList(":57A:", ":57D:")) {
            if (tagMap.containsKey(tag)) {
                String value = tagMap.get(tag).trim();
                if (tag.equals(":57A:")) {
                    fields.setAccountWithInstitutionBic(value);
                } else {
                    String[] parts = value.split("\n");
                    fields.setAccountWithInstitutionName(parts.length > 0 ? parts[0].trim() : "");
                    fields.setAccountWithInstitutionAddress(parts.length > 1 ? parts[1].trim() : "");
                }
                break;
            }
        }

        // 59 (Beneficiary Customer)
        for (String tag : Arrays.asList(":59A:", ":59:")) {
            if (tagMap.containsKey(tag)) {
                String value = tagMap.get(tag).trim();
                fields.setBeneficiaryRaw(value);
                if (tag.equals(":59A:")) {
                    // :59A: IBAN + nom
                    String[] parts = value.split("\n");
                    fields.setBeneficiaryIban(parts.length > 0 ? parts[0].replace("/", "").trim() : "");
                    fields.setBeneficiaryName(parts.length > 1 ? parts[1].trim() : "");
                } else {
                    // :59: — soit /IBAN\nNOM, soit NOM\nADRESSE, etc
                    String[] parts = value.split("\n");
                    if (parts[0].startsWith("/")) {
                        fields.setBeneficiaryIban(parts[0].replace("/", "").trim());
                        fields.setBeneficiaryName(parts.length > 1 ? parts[1].trim() : "");
                        fields.setBeneficiaryAddress(parts.length > 2 ? parts[2].trim() : "");
                    } else {
                        fields.setBeneficiaryName(parts[0].trim());
                        fields.setBeneficiaryAddress(parts.length > 1 ? parts[1].trim() : "");
                    }
                }
                break;
            }
        }

        fields.setRemittanceInfo(tagMap.getOrDefault(":70:", ""));
        fields.setChargeDetails(tagMap.getOrDefault(":71A:", ""));

        // Champs supplémentaires
        fields.setIntermediaryBIC(tagMap.getOrDefault(":53B:", ""));
        fields.setCorrespondentBIC(tagMap.getOrDefault(":54A:", ""));
        fields.setDetailsOfCharges(tagMap.getOrDefault(":71F:", ""));
        fields.setExchangeRate(tagMap.getOrDefault(":36:", ""));
        fields.setInstructionCode(tagMap.getOrDefault(":23E:", ""));

        return fields;
    }
}
