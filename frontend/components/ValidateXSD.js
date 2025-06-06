"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Shield, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react"

export default function ValidateXSD({ mxMessage, onValidationComplete, backendStatus }) {
  const [xsdValidationResult, setXsdValidationResult] = useState(null)
  const [xsdLoading, setXsdLoading] = useState(false)
  const { toast } = useToast()

  const handleXsdValidation = async () => {
    if (!mxMessage) {
      toast({
        title: "Erreur",
        description: "Aucun message MX à valider",
        variant: "destructive",
      })
      return
    }

    setXsdLoading(true)
    setXsdValidationResult(null)

    try {
      const response = await fetch("http://localhost:8080/api/messages/validate-mx-xsd", {
        method: "POST",
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          Accept: "application/json, text/plain, */*",
        },
        body: mxMessage,
        credentials: "include",
      })

      const text = await response.text()
      let result

      console.log("Raw response text:", text);
      console.log("Response status:", response.status);

      if (response.ok) {
        try {
          if (text.trim().startsWith("{") || text.trim().startsWith("[")) {
            result = JSON.parse(text)
          } else {
            // Handle non-JSON response, assume text is error or success indicator
            result = {
              valid: text.toLowerCase().includes("valid") || text.toLowerCase().includes("success"),
              errors: text ? [text] : [], // Assume the entire text is an error if not valid JSON
            }
          }
        } catch {
           // If JSON parsing fails, treat the text as potential error message
          result = {
            valid: text.toLowerCase().includes("valid") || text.toLowerCase().includes("success"),
            errors: text ? [text] : [],
          }
        }

        setXsdValidationResult(result)
        if(onValidationComplete) onValidationComplete(result)

        toast({
          title: "Validation XSD terminée",
          description: result.valid ? "Le message MX est conforme au schéma XSD ✅" : "Erreurs XSD détectées ⚠️",
          variant: result.valid ? "default" : "destructive",
        })

      } else {
        // Handle HTTP errors
        const status = response.status
        const responseText = text

        let errorsToDisplay = []

        if (status === 400) {
          try {
            const errorDetails = JSON.parse(responseText)
            console.log("Parsed 400 error details:", errorDetails);
            // Check if the response is an array and contains objects with a 'message' property
            if (Array.isArray(errorDetails)) {
              // Successfully parsed expected JSON format, extract messages
              errorsToDisplay = errorDetails.map(err => 
                typeof err === 'object' && err !== null 
                  ? err.message || JSON.stringify(err)
                  : String(err)
              );
            } else if (typeof errorDetails === 'object' && errorDetails !== null) {
              // Si c'est un objet unique avec un message
              errorsToDisplay = [errorDetails.message || JSON.stringify(errorDetails)];
            } else {
              // Si le format est inattendu
              errorsToDisplay = [String(errorDetails)];
            }
          } catch (jsonError) {
            // Si le parsing JSON échoue, utiliser le texte brut
            errorsToDisplay = [responseText];
          }
        } else {
           // For other non-400 HTTP errors
           errorsToDisplay = [`Erreur du serveur lors de la validation XSD (HTTP ${status}).`];
        }

        console.log("Errors to display before setting state:", errorsToDisplay);

        const errorResult = {
          valid: false,
          errors: errorsToDisplay,
        }
        setXsdValidationResult(errorResult)
        if(onValidationComplete) onValidationComplete(errorResult)

        toast({
          title: "Erreur de validation XSD",
          description: "Des erreurs XSD ont été détectées. Veuillez consulter la liste des erreurs ci-dessous.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("XSD validation error:", error)
      const errorMessage = `Erreur de connexion: ${error.message}`
      const errorResult = {
        valid: false,
        errors: [errorMessage],
      }
      setXsdValidationResult(errorResult)
      if(onValidationComplete) onValidationComplete(errorResult)

      toast({
        title: "Erreur de connexion",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setXsdLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Validation XSD
          {xsdValidationResult && (
             <Badge variant={xsdValidationResult.valid ? "default" : "destructive"}>
               {xsdValidationResult.valid ? "✅ Valide" : "❌ Invalide"}
             </Badge>
          )}
        </CardTitle>
        <CardDescription>Validez le message MX généré contre le schéma XSD</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
         <Button
            onClick={handleXsdValidation}
            disabled={!mxMessage || xsdLoading || backendStatus === "offline"}
            size="lg"
            className="w-full"
          >
            {xsdLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Shield className="h-4 w-4 mr-2" />}
            {xsdLoading ? "Validation XSD en cours..." : "Lancer la validation XSD"}
          </Button>

        {xsdValidationResult && !xsdValidationResult.valid && xsdValidationResult.errors?.length > 0 && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                ❌ Le message MX ne respecte pas le schéma XSD. Veuillez corriger les erreurs.
              </AlertDescription>
            </Alert>
             <ScrollArea className="h-[150px] w-full rounded-md border p-4">
               <div className="space-y-2">
                 {xsdValidationResult.errors.map((error, index) => (
                   <div key={index} className="text-sm text-red-600 border-l-2 border-red-200 pl-3 py-1">
                     {"-" + error}
                   </div>
                 ))}
               </div>
             </ScrollArea>
          </div>
        )}

         {xsdValidationResult && xsdValidationResult.valid && (
           <Alert>
             <CheckCircle2 className="h-4 w-4" />
             <AlertDescription>
               ✅ Le message MX est conforme au schéma XSD. Il peut être utilisé en production.
             </AlertDescription>
           </Alert>
         )}

      </CardContent>
    </Card>
  )
} 