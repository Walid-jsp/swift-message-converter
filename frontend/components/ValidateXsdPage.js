"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, AlertCircle, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

// Import du composant de validation XSD (déjà créé)
import ValidateXSD from "@/components/ValidateXSD"

export default function ValidateXsdPage({ backendStatus }) {
  const [mxMessage, setMxMessage] = useState("")
  const [isEnlargedDialogOpen, setIsEnlargedDialogOpen] = useState(false)
  const [enlargedContent, setEnlargedContent] = useState("")
  const [enlargedTitle, setEnlargedTitle] = useState("")

  const handleEnlargeClick = (content, title) => {
    setEnlargedContent(content)
    setEnlargedTitle(title)
    setIsEnlargedDialogOpen(true)
  }

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
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <CardTitle className="text-xl font-semibold">Message MX (ISO 20022 XML)</CardTitle>
          </div>
          {/* Bouton Agrandir pour le message MX */}
          <Button variant="outline" size="icon" onClick={() => handleEnlargeClick(mxMessage, 'Message MX')}>
            <Maximize2 className="h-4 w-4" />
          </Button>
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

      {/* Modale pour afficher le contenu agrandi */}
      <Dialog open={isEnlargedDialogOpen} onOpenChange={setIsEnlargedDialogOpen}>
        <DialogContent className="sm:max-w-[800px] w-full h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{enlargedTitle}</DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-hidden">
            <ScrollArea className="h-full w-full pr-4">
              <pre className="text-sm font-mono whitespace-pre-wrap break-all">{enlargedContent}</pre>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 