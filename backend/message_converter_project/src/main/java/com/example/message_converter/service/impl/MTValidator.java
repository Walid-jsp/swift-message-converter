package com.example.message_converter.service.impl;

import com.example.message_converter.service.inter.MTValidationservice;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


@Service
public class MTValidator implements MTValidationservice {

    @Override
    public List<String> validate(String mtMessage) {
        List<String> errors = new ArrayList<>();

        // 1. Vérif caractères non imprimables
        if (containsNonPrintableChars(mtMessage)) {
            errors.add("Le message contient des caractères non imprimables ou spéciaux interdits.");
        }

        // 2. Taille max
        if (mtMessage.length() > 10000) {
            errors.add("Le message dépasse la taille maximale autorisée (10 000 caractères).");
        }

        if (isMessageEmpty(mtMessage)) {
            errors.add("MT Message is empty");
            return errors;
        }

        // Extraire les blocs SWIFT (1 à 4)
        Map<Integer, String> blocks = extractSwiftBlocks(mtMessage);

        // Vérifier la présence des blocs obligatoires (1, 2 et 4)
        if (!blocks.containsKey(1)) errors.add("Bloc 1 manquant (Basic Header Block)");
        if (!blocks.containsKey(2)) errors.add("Bloc 2 manquant (Application Header Block)");
        if (!blocks.containsKey(4)) errors.add("Bloc 4 manquant (Text Block, message métier)");
        if (!errors.isEmpty()) return errors; // Stop si structure de base invalide

        // Appliquer la validation métier uniquement sur le bloc 4
        String block4 = blocks.get(4).trim();
        if (block4.isEmpty()) {
            errors.add("Bloc 4 (texte métier) vide.");
            return errors;
        }

        Map<String, String> fields = parseFields(block4);

        List<String> requiredTags = new ArrayList<>(Arrays.asList(":20:", ":23B:", ":32A:", ":59:", ":70:", ":71A:"));

        // 3. Aucun champ ne doit apparaître plusieurs fois (généralisé)
        checkTagMultiplicity(block4, getAllTags(block4), errors);

        checkRequiredTags(fields, requiredTags, errors);
        checkTag50Presence(fields, errors);

        // Champs obligatoires
        if (fields.containsKey(":20:")) validateField20(fields.get(":20:"), errors);
        if (fields.containsKey(":23B:")) validateField23B(fields.get(":23B:"), errors);
        if (fields.containsKey(":32A:")) validateField32A(fields.get(":32A:"), errors);

        for (String tag50 : Arrays.asList(":50A:", ":50F:", ":50K:")) {
            if (fields.containsKey(tag50)) {
                validateField50(fields.get(tag50), errors, tag50);
            }
        }
        if (fields.containsKey(":52A:")) validateField52A(fields.get(":52A:"), errors);
        if (fields.containsKey(":57A:")) validateField57A(fields.get(":57A:"), errors);
        if (fields.containsKey(":59:")) validateField59(fields.get(":59:"), errors);
        if (fields.containsKey(":70:")) validateField70(fields.get(":70:"), errors);
        if (fields.containsKey(":71A:")) validateField71A(fields.get(":71A:"), errors);

        // Champs facultatifs fréquemment présents dans les MT103 enrichis
        if (fields.containsKey(":33B:")) validateField33B(fields.get(":33B:"), errors);
        if (fields.containsKey(":53B:")) validateField53B(fields.get(":53B:"), errors);
        if (fields.containsKey(":54A:")) validateField54A(fields.get(":54A:"), errors);

        // 4. Vérif champs obligatoires liés/cohérence ( si 53B, 54A, ou 57A => 52A obligatoire)
        checkLinkedFields(fields, errors);

        return errors;
    }

    // RÈGLES GÉNÉRALES

    private boolean containsNonPrintableChars(String input) {
        // Contrôle tabulation, retour charriot isolé, contrôle ASCII, et quelques caractères spéciaux courants
        return input.matches(".*[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F@#€].*");
    }

    // Récupérer la liste de tous les tags du bloc 4 pour vérifier la multiplicité générale
    private List<String> getAllTags(String block4) {
        List<String> tags = new ArrayList<>();
        Pattern tagPattern = Pattern.compile("(:[0-9A-Z]{2,3}[A-Z]?:)");
        Matcher matcher = tagPattern.matcher(block4);
        while (matcher.find()) {
            tags.add(matcher.group(1));
        }
        return tags;
    }

    // ======= RÈGLES PAR CHAMP =======

    // :20: Référence
    private void validateField20(String value, List<String> errors) {
        if (value.length() > 16) {
            errors.add("Le champ de la référence (:20:) ne doit pas dépasser 16 caractères.");
        }
        if (value.length() < 8) {
            errors.add("Le champ de la référence (:20:) doit comporter au moins 8 caractères.");
        }
        if (!value.matches("^[a-zA-Z0-9]+$")) {
            errors.add("La référence (:20:) ne doit contenir que des caractères alphanumériques, sans espaces.");
        }
        if (value.startsWith(" ") || value.startsWith("/")) {
            errors.add("La référence (:20:) ne doit pas commencer par un espace ou par '/'.");
        }
        if (value.trim().isEmpty()) {
            errors.add("Le champ de la référence (:20:) ne doit pas être vide.");
        }
    }

    // :23B: (toujours "CRED" en majuscule)
    private void validateField23B(String value, List<String> errors) {
        if (!"CRED".equals(value)) {
            errors.add("Le champ :23B: doit avoir la valeur 'CRED' en majuscule.");
        }
    }

    // :32A: (Date, Devise, Montant)
    private void validateField32A(String value, List<String> errors) {
        if (!value.matches("\\d{6}[A-Z]{3}[0-9,.]+")) {
            errors.add("Le champ :32A: n'est pas au format YYMMDDCCYAMOUNT.");
        } else {
            String montantPart = value.replaceAll("\\d{6}[A-Z]{3}", "");
            try {
                double montant = Double.parseDouble(montantPart.replace(",", "."));
                if (montant <= 0) {
                    errors.add("Le montant dans :32A: doit être supérieur à zéro.");
                }
                // Max 2 décimales
                if (montantPart.contains(".") && montantPart.substring(montantPart.indexOf('.') + 1).length() > 2) {
                    errors.add("Le montant dans :32A: doit comporter au maximum deux décimales.");
                }
            } catch (NumberFormatException e) {
                errors.add("Le montant dans :32A: n'est pas un nombre valide.");
            }
            String datePart = value.substring(0, 6);
            try {
                DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("yyMMdd");
                LocalDate dateValue = LocalDate.parse(datePart, dateTimeFormatter);
                if (dateValue.isAfter(LocalDate.now())) {
                    errors.add("La date de valeur dans :32A: ne peut pas être future.");
                }
                if (dateValue.isBefore(LocalDate.of(1980, 1, 1))) {
                    errors.add("La date de valeur dans :32A: doit être postérieure à 1980.");
                }
            } catch (Exception e) {
                errors.add("le champ 32A contient une date invalide");
            }
            // La devise est déjà vérifiée avec isValidISOCurrency (voir code existant)
        }
    }

    // :50A:/K/F (Donneur d'ordre)
    private void validateField50(String value, List<String> errors, String tag) {
        String[] parts = value.split("\n");
        // IBAN/compte
        if (parts.length < 1 || parts[0].trim().isEmpty()) {
            errors.add("Le champ " + tag + " doit contenir un IBAN ou un numéro de compte.");
        } else {
            String iban = parts[0].trim();
            if (iban.startsWith("/")) iban = iban.substring(1);
            if (!iban.matches("^[A-Z]{2}\\d{2}[A-Za-z0-9]{10,30}$")) {
                errors.add("Le champ " + tag + " doit contenir un IBAN valide (ex : FR...).");
            } else {
                // Vérification clé IBAN (modulo 97)
                if (!checkIBANKey(iban)) {
                    errors.add("Le champ " + tag + " contient un IBAN dont la clé est invalide (modulo 97).");
                }
                // Vérif pays IBAN
                String country = iban.substring(0, 2);
                if (!isValidCountryCode(country)) {
                    errors.add("Le champ " + tag + " contient un code pays IBAN non reconnu.");
                }
            }
        }
        // Nom
        if (parts.length < 2 || parts[1].trim().isEmpty()) {
            errors.add("Le champ " + tag + " doit contenir un nom de donneur d'ordre après l'IBAN.");
        } else {
            if (parts[1].matches(".*[0-9@#€].*")) {
                errors.add("Le nom du donneur d'ordre (" + tag + ") ne doit pas contenir de chiffres ou de caractères spéciaux.");
            }
        }
        // Adresse
        if (parts.length < 3 || parts[2].trim().isEmpty()) {
            errors.add("Le champ " + tag + " doit contenir une adresse de donneur d'ordre après le nom.");
        } else {
            if (!parts[2].matches(".*\\d+.*")) {
                errors.add("L'adresse du donneur d'ordre (" + tag + ") doit contenir au moins un chiffre.");
            }
        }
    }

    // :52A:, :53B:, :54A:, :57A: (BIC)
    private void validateField52A(String value, List<String> errors) {
        validateBIC(value, ":52A:", errors);
    }
    private void validateField53B(String value, List<String> errors) {
        validateBIC(value, ":53B:", errors);
    }
    private void validateField54A(String value, List<String> errors) {
        validateBIC(value, ":54A:", errors);
    }
    private void validateField57A(String value, List<String> errors) {
        validateBIC(value, ":57A:", errors);
    }
    private void validateBIC(String bic, String tag, List<String> errors) {
        bic = bic.trim();
        if (!bic.matches("^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$")) {
            errors.add("Le champ " + tag + " doit contenir un BIC valide (8 ou 11 caractères, lettres/chiffres).");
        }
        if (bic.length() != 8 && bic.length() != 11) {
            errors.add("Le champ " + tag + " doit avoir exactement 8 ou 11 caractères.");
        }
        // Vérification code pays BIC
        if (bic.length() >= 6 && !isValidCountryCode(bic.substring(4, 6))) {
            errors.add("Le champ " + tag + " contient un code pays BIC non reconnu.");
        }
        if (bic.matches(".*[@#€].*")) {
            errors.add("Le champ " + tag + " ne doit pas contenir de caractères spéciaux.");
        }
    }

    // :59: (Bénéficiaire)
    private void validateField59(String value, List<String> errors) {
        String[] parts = value.split("\n");
        if (parts.length < 1 || parts[0].trim().isEmpty()) {
            errors.add("Le champ :59: doit contenir un IBAN valide.");
        } else {
            String iban = parts[0].trim();
            if (iban.startsWith("/")) iban = iban.substring(1);
            if (!iban.matches("^[A-Z]{2}\\d{2}[A-Za-z0-9]{10,30}$")) {
                errors.add("Le champ :59: doit contenir un IBAN valide (ex : FR...).");
            } else {
                if (!checkIBANKey(iban)) {
                    errors.add("Le champ :59: contient un IBAN dont la clé est invalide (modulo 97).");
                }
                String country = iban.substring(0, 2);
                if (!isValidCountryCode(country)) {
                    errors.add("Le champ :59: contient un code pays IBAN non reconnu.");
                }
            }
        }
        if (parts.length < 2 || parts[1].trim().isEmpty()) {
            errors.add("Le champ :59: doit contenir le nom du bénéficiaire après l'IBAN ");
        } else {
            if (parts[1].matches(".*[0-9@#€].*")) {
                errors.add("Le nom du bénéficiaire (:59:) ne doit pas contenir de chiffres ou de caractères spéciaux.");
            }
        }
        if (parts.length < 3 || parts[2].trim().isEmpty()) {
            errors.add("Le champ :59: doit contenir une adresse après le nom du bénéficiaire ");
        } else {
            if (!parts[2].matches(".*\\d+.*")) {
                errors.add("L'adresse du bénéficiaire (:59:) doit contenir au moins un chiffre.");
            }
        }
    }

    // :70: (Motif)
    private void validateField70(String value, List<String> errors) {
        if (value.length() > 140) {
            errors.add("Le champ 70 ne doit pas dépasser 140 caractères");
        }
        if (value.matches(".*[€#@].*")) {
            errors.add("Le champ :70: ne doit pas contenir de caractères spéciaux (€ # @ etc.)");
        }
        if (value.matches(".*(IBAN|BIC|SECRET|XXX).*")) {
            errors.add("Le champ :70: ne doit pas contenir des informations sensibles ou interdites (IBAN, BIC, SECRET, XXX).");
        }
    }

    // :71A:
    private void validateField71A(String value, List<String> errors) {
        if (!value.equals("SHA") && !value.equals("BEN") && !value.equals("OUR")) {
            errors.add("Le champ :71A: doit être SHA, BEN ou OUR");
        }
        // (Exemple de règle avancée possible : vérifier cohérence avec les banques intermédiaires ici)
    }

    // :33B: (optionnel)
    private void validateField33B(String value, List<String> errors) {
        if (!value.matches("^[A-Z]{3}[0-9,.]+$")) {
            errors.add("Le champ :33B: n'est pas au format CCYAMOUNT.");
        } else {
            String currency = value.substring(0, 3);
            String amount = value.substring(3);
            if (!isValidISOCurrency(currency)) {
                errors.add("Le code devise du champ :33B: doit être conforme à la norme ISO 4217.");
            }
            try {
                double montant = Double.parseDouble(amount.replace(",", "."));
                if (montant <= 0) {
                    errors.add("Le montant dans :33B: doit être supérieur à zéro.");
                }
                // Max 2 décimales
                if (amount.contains(".") && amount.substring(amount.indexOf('.') + 1).length() > 2) {
                    errors.add("Le montant dans :33B: doit comporter au maximum deux décimales.");
                }
            } catch (NumberFormatException e) {
                errors.add("Le montant dans :33B: n'est pas un nombre valide.");
            }
        }
    }

    // Champs liés/cohérence Si 53B, 54A, 57A présents, alors 52A obligatoire
    private void checkLinkedFields(Map<String, String> fields, List<String> errors) {
        boolean has53B = fields.containsKey(":53B:");
        boolean has54A = fields.containsKey(":54A:");
        boolean has57A = fields.containsKey(":57A:");
        if ((has53B || has54A || has57A) && !fields.containsKey(":52A:")) {
            errors.add("Si un des champs :53B:, :54A: ou :57A: est présent, le champ :52A: doit aussi être présent.");
        }
    }

    // Vérification IBAN modulo 97 (clé IBAN)
    private boolean checkIBANKey(String iban) {
        try {
            String reformatted = iban.substring(4) + iban.substring(0, 4);
            StringBuilder numericIban = new StringBuilder();
            for (char ch : reformatted.toCharArray()) {
                if (Character.isLetter(ch)) {
                    numericIban.append(Character.getNumericValue(ch));
                } else {
                    numericIban.append(ch);
                }
            }
            // Attention: la chaîne peut dépasser la taille d'un long, donc on utilise BigInteger
            java.math.BigInteger ibanInt = new java.math.BigInteger(numericIban.toString());
            return ibanInt.mod(java.math.BigInteger.valueOf(97)).intValue() == 1;
        } catch (Exception e) {
            return false;
        }
    }

    // Liste basique des codes pays IBAN/BIC courants (adaptable)
    private boolean isValidCountryCode(String code) {
        Set<String> validCodes = Set.of(
                // Europe
                "FR", "DE", "ES", "IT", "GB", "BE", "NL", "CH", "PT", "SE", "NO", "DK", "FI", "AT", "IE", "LU",
                "MC", "GR", "CZ", "PL", "HU", "SK", "SI", "BG", "RO", "LT", "LV", "EE", "HR", "CY", "MT",

                // Afrique
                "MA", // Maroc
                "TN", // Tunisie
                "DZ", // Algérie
                "EG", // Égypte
                "CI", // Côte d'Ivoire
                "SN", // Sénégal
                "GA", // Gabon
                "CM", // Cameroun
                "GH", // Ghana
                "NG", // Nigéria
                "KE", // Kenya
                "ZA", // Afrique du Sud

                // Amériques
                "US", // États-Unis
                "CA", // Canada
                "MX", // Mexique
                "BR", // Brésil
                "AR", // Argentine
                "CL", // Chili

                // Moyen-Orient/Asie
                "SA", // Arabie Saoudite
                "AE", // Émirats Arabes Unis
                "QA", // Qatar
                "KW", // Koweït
                "TR", // Turquie
                "RU", // Russie
                "JP", // Japon
                "CN", // Chine
                "IN", // Inde
                "SG", // Singapour
                "HK", // Hong Kong
                "KR", // Corée du Sud
                "AU", // Australie
                "NZ"  // Nouvelle-Zélande
                // ... Ajoute d'autres au besoin !
        );
        return validCodes.contains(code);
    }


    private boolean isValidISOCurrency(String code) {
        try {
            java.util.Currency.getInstance(code);
            return true;
        } catch (Exception e) {
            return false;
        }
    }


    private Map<Integer, String> extractSwiftBlocks(String mtMessage) {
        Map<Integer, String> blocks = new HashMap<>();
        Pattern pattern = Pattern.compile("\\{(\\d):(.*?)(?=\\{\\d:|$)", Pattern.DOTALL);
        Matcher matcher = pattern.matcher(mtMessage);
        while (matcher.find()) {
            int blockNum = Integer.parseInt(matcher.group(1));
            String blockContent = matcher.group(2);

            // Pour le bloc 4, on enlève éventuellement le "-}" final
            if (blockNum == 4) {
                int idx = blockContent.lastIndexOf("-}");
                if (idx != -1) {
                    blockContent = blockContent.substring(0, idx);
                }
            }
            blocks.put(blockNum, blockContent.trim());
        }
        return blocks;
    }

    //Parseur multiligne
    private Map<String, String> parseFields(String block4) {
        Map<String, String> fields = new LinkedHashMap<>();
        String[] lines = block4.split("\n");
        String currentTag = null;
        StringBuilder currentValue = new StringBuilder();

        for (String line : lines) {
            if (line.startsWith(":")) {
                if (currentTag != null) {
                    fields.put(currentTag, currentValue.toString().trim());
                }
                int idx = line.indexOf(':', 1);
                if (idx > 0) {
                    currentTag = line.substring(0, idx + 1);
                    currentValue = new StringBuilder(line.substring(idx + 1).trim());
                } else {
                    currentTag = line.substring(0, 4);
                    currentValue = new StringBuilder(line.substring(4).trim());
                }
            } else {
                currentValue.append("\n").append(line.trim());
            }
        }
        if (currentTag != null) {
            fields.put(currentTag, currentValue.toString().trim());
        }
        return fields;
    }

    // prrésence de champs oblifgatoires
    private void checkRequiredTags(Map<String, String> fields, List<String> requiredTags, List<String> errors) {
        for (String requiredTag : requiredTags) {
            if (!fields.containsKey(requiredTag)) {
                errors.add("champ obligatoire manquant : " + requiredTag);
            }
        }
    }

    //présence et unicité des champs 50
    private void checkTag50Presence(Map<String, String> fields, List<String> errors) {
        int count50 = 0;
        for (String tag : Arrays.asList(":50A:", ":50F:", ":50K:")) {
            if (fields.containsKey(tag)) count50++;
        }
        if (count50 == 0) {
            errors.add("l'un des champs :50A:, :50F: ou :50K: doit apparaitre obligatoirement");
        } else if (count50 > 1) {
            errors.add("il doit y avoir qu'un seul champ 50A, 50F ou 50K dans le message");
        }
    }

    //multiplicité des tags
    private void checkTagMultiplicity(String block4, List<String> tags, List<String> errors) {
        for (String tag : tags) {
            int count = block4.split(tag, -1).length - 1;
            if (count > 1) {
                errors.add("Le champ " + tag + " apparaît plusieurs fois.");
            }
        }
    }

    private boolean isMessageEmpty(String mtMessage) {
        return (mtMessage == null || mtMessage.trim().isEmpty());
    }
}
