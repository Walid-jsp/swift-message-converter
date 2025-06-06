package com.example.message_converter.service.impl;

import com.example.message_converter.entity.PayLoadInOut;
import com.example.message_converter.entity.TransformationError;
import com.example.message_converter.parser.MT103Fields;
import com.example.message_converter.parser.MT103Parser;
import com.example.iso20022.*;
import com.example.message_converter.entity.ObjetTronquee;

import com.example.message_converter.service.inter.PersistanceService;
import com.example.message_converter.service.inter.TransformerService;
import jakarta.transaction.Transactional;
import jakarta.xml.bind.JAXBContext;
import jakarta.xml.bind.Marshaller;
import org.springframework.stereotype.Service;

import javax.xml.datatype.DatatypeFactory;
import javax.xml.datatype.XMLGregorianCalendar;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.GregorianCalendar;

import java.io.StringWriter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;


@Service
@Transactional
public class Mt103ToPacs008Transformer implements TransformerService {

    private final PersistanceService   persistanceService;

    public Mt103ToPacs008Transformer(PersistanceService persistanceService) {
        this.persistanceService = persistanceService;

    }

    @Override
    public String transform(String mtMessage) {

        //Sauvegarde du message IN
        PayLoadInOut  payLoadInOut = new PayLoadInOut();
        payLoadInOut.setPayLoadIn(mtMessage);
        payLoadInOut.setStatus("RECU");
        payLoadInOut.setTransformationDate(LocalDateTime.now());
        payLoadInOut = persistanceService.savePayLoadInOut(payLoadInOut);

        // 1. Parsing complet des blocs
        String block1 = MT103Parser.extractBlock(mtMessage, 1);
        String block2 = MT103Parser.extractBlock(mtMessage, 2);
        String block3 = MT103Parser.extractBlock(mtMessage, 3);
        Map<String, String> tagMap = MT103Parser.parseBlock4(mtMessage);
        MT103Fields fields = MT103Fields.fromParsedData(tagMap, block1, block2, block3);

        // 2. Création du document MX
        Document document = new Document();
        FIToFICustomerCreditTransferV13 fIToFICstmrCdtTrf = new FIToFICustomerCreditTransferV13();
        document.setFIToFICstmrCdtTrf(fIToFICstmrCdtTrf);

        // 3. GroupHeader (bloc général)
        GroupHeader131 grpHdr = new GroupHeader131();

// MsgId :20: ou bloc 3 {108:...}
        String msgId = extractReference108(fields.getBlock3());
        if (msgId == null || msgId.isEmpty()) msgId = fields.getReference(); // fallback :20:
        grpHdr.setMsgId(msgId);

// Date/heure de création


        LocalDateTime localDateTime = LocalDateTime.now();
        GregorianCalendar cal = GregorianCalendar.from(localDateTime.atZone(ZoneId.systemDefault()));

        XMLGregorianCalendar xmlCal = null;
        try {
            xmlCal = DatatypeFactory.newInstance().newXMLGregorianCalendar(cal);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        grpHdr.setCreDtTm(xmlCal);


// NbOfTxs : toujours 1 pour un MT103
        grpHdr.setNbOfTxs("1");

// SttlmInf : méthode de règlement (pas dans MT, valeur standard)
        SettlementInstruction15 settlementInstruction15 = new SettlementInstruction15();
        settlementInstruction15.setSttlmMtd(SettlementMethod1Code.CLRG);
        grpHdr.setSttlmInf(settlementInstruction15);

        fIToFICstmrCdtTrf.setGrpHdr(grpHdr);


        // 4. Transaction principale
        CreditTransferTransaction70 cdtTrfTxInfo = new CreditTransferTransaction70();
        PaymentIdentification13 pmtId = new PaymentIdentification13();
        pmtId.setInstrId(msgId);
        pmtId.setEndToEndId(msgId);
        pmtId.setTxId(msgId);
        cdtTrfTxInfo.setPmtId(pmtId);


        // montant et devise
        if (fields.getCurrency() != null && fields.getAmount() != null) {
            ActiveCurrencyAndAmount amt = new ActiveCurrencyAndAmount();
            amt.setCcy(fields.getCurrency());
            amt.setValue(new BigDecimal(fields.getAmount().replace(",", ".")));

            cdtTrfTxInfo.setIntrBkSttlmAmt(amt);
        }


        // Date de règlement (Interbank Settlement Date)
        if (fields.getDate() != null) {
            LocalDate date = LocalDate.parse(formatDate(fields.getDate()));
            cdtTrfTxInfo.setIntrBkSttlmDt(toXMLGregorianCalendar(date));
        } else {
            cdtTrfTxInfo.setIntrBkSttlmDt(toXMLGregorianCalendar(LocalDate.now()));
        }


        // Donneur d’ordre (50K/A/F)
        PartyIdentification272 dbtr = new PartyIdentification272();
        dbtr.setNm(fields.getOrderingCustomerName());
        if (fields.getOrderingCustomerAddress() != null) {
            PostalAddress27 addr = new PostalAddress27();

            if (fields.getOrderingCustomerCity() != null)
                addr.setTwnNm(fields.getOrderingCustomerCity());

            if (fields.getOrderingCustomerCountry() != null)
                addr.setCtry(fields.getOrderingCustomerCountry());

            if (fields.getOrderingCustomerAddress() != null)
                for (String line : fields.getOrderingCustomerAddress().split("\\n"))
                    addr.getAdrLine().add(line.trim());

            dbtr.setPstlAdr(addr);

        }
        cdtTrfTxInfo.setDbtr(dbtr);

        // Compte donneur d'ordre
        if (fields.getOrderingCustomerIban() != null) {
            CashAccount40 dbtrAcct = new CashAccount40();
            AccountIdentification4Choice dbtrAcctId = new AccountIdentification4Choice();
            dbtrAcctId.setIBAN(fields.getOrderingCustomerIban());
            dbtrAcct.setId(dbtrAcctId);
            cdtTrfTxInfo.setDbtrAcct(dbtrAcct);
        }


        // Bénéficiaire (59)
        PartyIdentification272 cdtr = new PartyIdentification272();
        cdtr.setNm(fields.getBeneficiaryName());
        if (fields.getBeneficiaryAddress() != null) {
            PostalAddress27 addr = new PostalAddress27();
            addr.getAdrLine().add(fields.getBeneficiaryAddress());
            cdtr.setPstlAdr(addr);
        }
        cdtTrfTxInfo.setCdtr(cdtr);

        // Compte bénéficiaire
        if (fields.getBeneficiaryIban() != null) {
            CashAccount40 cdtrAcct = new CashAccount40();
            AccountIdentification4Choice cdtrAcctId = new AccountIdentification4Choice();
            cdtrAcctId.setIBAN(fields.getBeneficiaryIban());
            cdtrAcct.setId(cdtrAcctId);
            cdtTrfTxInfo.setCdtrAcct(cdtrAcct);
        }

        // Banque bénéficiaire (57A)
        if (fields.getAccountWithInstitutionBic() != null && !fields.getAccountWithInstitutionBic().isEmpty()) {
            BranchAndFinancialInstitutionIdentification8 cdtrAgt = new BranchAndFinancialInstitutionIdentification8();
            FinancialInstitutionIdentification23 finInstn = new FinancialInstitutionIdentification23();
            finInstn.setBICFI(fields.getAccountWithInstitutionBic());
            cdtrAgt.setFinInstnId(finInstn);
            cdtTrfTxInfo.setCdtrAgt(cdtrAgt);
        }

        // Détail des frais :71A: → ChrgBr
        String chrgBr = mapChargeBearer(fields.getChargeDetails());
        if (chrgBr != null) {
            cdtTrfTxInfo.setChrgBr(ChargeBearerType1Code.valueOf(chrgBr));
        } else {
            // Stocker valeur non mappée
            storeNonMappedField("71A", fields.getChargeDetails(),payLoadInOut);
        }

        // Motif/remittance (70)
        if (fields.getRemittanceInfo() != null && !fields.getRemittanceInfo().isEmpty()) {
            RemittanceInformation22 rmtInf = new RemittanceInformation22();
            rmtInf.getUstrd().add(fields.getRemittanceInfo());
            cdtTrfTxInfo.setRmtInf(rmtInf);
        }

        // Champs supplémentaires non mappés (par exemple 23E, 36, 53B, 54A, 71F…)
        storeNonMappedField("23E", fields.getInstructionCode(),payLoadInOut);
        storeNonMappedField("36", fields.getExchangeRate(),payLoadInOut);
        storeNonMappedField("53B", fields.getIntermediaryBIC(),payLoadInOut);
        storeNonMappedField("54A", fields.getCorrespondentBIC(),payLoadInOut);


        // Ajout de la transaction à la liste
        fIToFICstmrCdtTrf.getCdtTrfTxInf().add(cdtTrfTxInfo);

        //Marshalling en XML
        try {
            JAXBContext context = JAXBContext.newInstance(Document.class);
            Marshaller marshaller = context.createMarshaller();
            marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, Boolean.TRUE);
            StringWriter writer = new StringWriter();
            marshaller.marshal(document, writer);
            payLoadInOut.setPayLoadOut(writer.toString());
            payLoadInOut.setStatus("TRANSFORMATION AVEC SUCCESS");
            persistanceService.savePayLoadInOut(payLoadInOut);
            return writer.toString();
        } catch (Exception e) {
            TransformationError transformationError = new TransformationError();
            transformationError.setErrorType("MARSHALLING ERROR");
            // Ajoute le stacktrace dans le message (pour debug, temporairement)
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            transformationError.setErrorMessage(e.getMessage() + "\nSTACKTRACE:\n" + sw.toString());
            transformationError.setPayLoadInOut(payLoadInOut);
            persistanceService.saveTransformationError(transformationError);

            payLoadInOut.setStatus("TRANSFORMATION FAILED");
            persistanceService.savePayLoadInOut(payLoadInOut);

            throw new RuntimeException("Error during Marshalling " + e.getMessage(), e);
        }

    }

    // Mapping MX des valeurs 71A
    private String mapChargeBearer(String mtValue) {
        if (mtValue == null) return null;
        switch (mtValue.trim().toUpperCase()) {
            case "SHA":
                return "SHAR";
            case "OUR":
                return "DEBT";
            case "BEN":
                return "CRED";
            default:
                return null;
        }
    }

    // Récupérer la référence 108 du bloc 3
    private String extractReference108(String block3) {
        if (block3 == null) return "";
        int idx = block3.indexOf("{108:");
        if (idx != -1) {
            int start = idx + 5;
            int end = block3.indexOf("}", start);
            return end != -1 ? block3.substring(start, end) : block3.substring(start);
        }
        return null;
    }

    // Formater date :32A: (yymmdd → yyyy-MM-dd)
    private String formatDate(String dateYYMMDD) {
        if (dateYYMMDD.length() == 6) {
            String yy = dateYYMMDD.substring(0, 2);
            String mm = dateYYMMDD.substring(2, 4);
            String dd = dateYYMMDD.substring(4, 6);
            return "20" + yy + "-" + mm + "-" + dd;
        }
        return LocalDate.now().toString();
    }

    // Stockage des champs non mappés dans ObjetTronquee
    private void storeNonMappedField(String fieldName, String value,PayLoadInOut payLoadInOut) {
        if (value != null && !value.isEmpty()) {

            ObjetTronquee obj = new ObjetTronquee();
            obj.setFieldName(fieldName);
            obj.setOriginalValue(value  );
            obj.setPayLoadInOut(payLoadInOut);
            persistanceService.saveObjetTronquee(obj);

        }
    }

    public static XMLGregorianCalendar toXMLGregorianCalendar(LocalDate date) {
        try {
            return DatatypeFactory.newInstance().newXMLGregorianCalendar(date.toString());

        } catch (Exception e) {
            throw new RuntimeException("Conversion LocalDate → XMLGregorianCalendar échouée", e);
        }
    }

}
