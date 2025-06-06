package com.example.message_converter.repository;

import com.example.message_converter.entity.PayLoadInOut;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PayLoadRepository extends JpaRepository<PayLoadInOut, Long> {

    /**
     * Correction : Ajout de l'annotation @Query pour éviter l'ambiguïté
     * d'interprétation du nom de la méthode par Spring Data JPA.
     * La requête JPQL spécifie explicitement de rechercher sur le champ 'payLoadIn'.
     */

    @Query("SELECT p FROM PayLoadInOut p WHERE p.payLoadIn = :payload")
    PayLoadInOut findByPayLoadIn(@Param("payload") String payLoadIn);

}