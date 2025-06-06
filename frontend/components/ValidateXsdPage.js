"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText } from "lucide-react"
import { AlertCircle } from "lucide-react"

// Import du composant de validation XSD (déjà créé)
import ValidateXSD from "@/components/ValidateXSD"

export default function ValidateXsdPage({ backendStatus }) {
  const [mxMessage, setMxMessage] = useState("")

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Validation XSD Manuelle</h2>
        <p className="text-muted-foreground">
          Collez un message SWIFT MX (ISO 20022 XML) ci-dessous pour le valider contre le schéma XSD.
        </p>
      </div>

       {/* Alerte statut backend */}
       {backendStatus === "offline" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Le backend n'est pas accessible. La validation XSD nécessite une connexion au serveur.
          </AlertDescription>
        </Alert>
      )}

      {/* Saisie du message MX */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Message MX (ISO 20022 XML)
          </CardTitle>
          <CardDescription>Collez votre message MX ici.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={mxMessage}
            onChange={(e) => setMxMessage(e.target.value)}
            placeholder="Collez votre message MX ici..."
            className="min-h-[250px] font-mono text-sm"
          />
        </CardContent>
      </Card>

      {/* Composant de validation XSD */}
      <ValidateXSD mxMessage={mxMessage} backendStatus={backendStatus} />

    </div>
  )
} 