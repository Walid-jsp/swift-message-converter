"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Zap,
  AlertCircle,
  Upload,
  Trash2,
  RefreshCw,
  FileText,
  Copy,
  Download,
  CheckCircle2,
} from "lucide-react"

// Importation des composants de dialogue (shadcn/ui)
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Maximize2 } from "lucide-react"

// Import du nouveau composant Validation XSD
import ValidateXSD from "@/components/ValidateXSD"

export default function ConvertMT({ backendStatus, onRefreshHistory, onAddToHistory, initialMessage }) {
  const [message, setMessage] = useState("")
  const [transformationResult, setTransformationResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // État pour la modale d'agrandissement
  const [isEnlargedDialogOpen, setIsEnlargedDialogOpen] = useState(false);
  const [enlargedContent, setEnlargedContent] = useState("");
  const [enlargedTitle, setEnlargedTitle] = useState("");

  // Fonction pour ouvrir la modale avec le contenu
  const handleEnlargeClick = (content, title) => {
    setEnlargedContent(content);
    setEnlargedTitle(title);
    setIsEnlargedDialogOpen(true);
  };

  // Mettre à jour le message si un message initial est fourni (après validation réussie)
  useEffect(() => {
    if (initialMessage) {
      setMessage(initialMessage);
    }
  }, [initialMessage]); 

  const loadSampleMessage = () => {
    const sampleMT103 = `{1:F01BANKBEBBAXXX0000000000}{2:I103BANKDEFFXXXXN}{4:
:20:REFERENCE123
:23B:CRED
:32A:230101EUR1000,00
:50K:/12345678
ORDERING CUSTOMER
ADDRESS LINE 1
ADDRESS LINE 2
:59:/87654321
BENEFICIARY NAME
BENEFICIARY ADDRESS 1
BENEFICIARY ADDRESS 2
:71A:SHA
-}`
    setMessage(sampleMT103)
    toast({
      title: "Exemple chargé",
      description: "Un exemple de message MT103 a été chargé",
    })
  }

  const handleTransform = async () => {
    if (!message.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un message MT",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setTransformationResult(null)

    try {
      const response = await fetch("http://localhost:8080/api/messages/transform-mt-to-mx", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          Accept: "application/json, text/plain, */*",
        },
        body: message.trim(),
        credentials: "include",
      })

      const text = await response.text()

      if (response.ok) {
        let result

        try {
          if (text.trim().startsWith("{") || text.trim().startsWith("[")) {
            const jsonData = JSON.parse(text)
            result = {
              status: jsonData.status || "SUCCESS",
              payLoadOut: jsonData.payLoadOut || jsonData.xml || text,
              transformationErrors: jsonData.transformationErrors || [],
              objetTronquees: jsonData.objetTronquees || [],
            }
          } else {
            result = {
              status: "SUCCESS",
              payLoadOut: text,
              transformationErrors: [],
              objetTronquees: [],
            }
          }
        } catch {
          result = {
            status: "SUCCESS",
            payLoadOut: text,
            transformationErrors: [],
            objetTronquees: [],
          }
        }

        setTransformationResult(result)

        // Ajouter à l'historique avec les détails de la conversion réussie
        if (onAddToHistory) {
           onAddToHistory({
              operationType: "CONVERSION",
              payLoadIn: message.trim(),
              payLoadOut: result.payLoadOut,
              status: result.status,
              transformationErrors: result.transformationErrors || [],
              objetTronquees: result.objetTronquees || [],
              validationErrors: [], // Les erreurs MT sont gérées dans ValidateMT
              validationXsdErrors: [], // Les erreurs XSD sont gérées séparément
           });
        }

        // Rafraîchir l'historique après transformation
        if (onRefreshHistory) {
          onRefreshHistory()
        }

        toast({
          title: "Transformation réussie",
          description: "Le message MX a été généré avec succès",
          variant: "default",
        })
      } else {
        const errorMessage = `Erreur HTTP ${response.status}: ${text}`
        const result = {
          status: "ERROR",
          payLoadOut: null,
          transformationErrors: [{ type: "HTTP_ERROR", message: errorMessage, errorType: "ERREUR TECHNIQUE" }],
          objetTronquees: [],
        }

        setTransformationResult(result)

        // Ajouter à l'historique avec les erreurs de transformation
        if (onAddToHistory) {
           onAddToHistory({
              operationType: "CONVERSION",
              payLoadIn: message.trim(),
              payLoadOut: null,
              status: result.status,
              transformationErrors: result.transformationErrors || [],
              objetTronquees: [],
              validationErrors: [],
              validationXsdErrors: [],
           });
        }

        toast({
          title: "Erreur de transformation",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Transformation error:", error)
      const errorMessage = `Erreur de connexion: ${error.message}`
      const result = {
        status: "CONNECTION_ERROR",
        payLoadOut: null,
        transformationErrors: [{ type: "CONNECTION_ERROR", message: errorMessage, errorType: "ERREUR TECHNIQUE" }],
        objetTronquees: [],
      }

      setTransformationResult(result)

       // Ajouter à l'historique avec les erreurs de connexion
       if (onAddToHistory) {
          onAddToHistory({
             operationType: "CONVERSION",
             payLoadIn: message.trim(),
             payLoadOut: null,
             status: result.status,
             transformationErrors: result.transformationErrors || [],
             objetTronquees: [],
             validationErrors: [],
             validationXsdErrors: [],
          });
       }

      toast({
        title: "Erreur de connexion",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copié !",
        description: "Le contenu a été copié dans le presse-papiers",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le contenu",
        variant: "destructive",
      })
    }
  }

  const downloadResult = (content, filename) => {
    const blob = new Blob([content], { type: "text/xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Téléchargement démarré",
      description: `Le fichier ${filename} a été téléchargé`,
    })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "SUCCESS":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">✅ Succès</Badge>
      case "ERROR":
        return <Badge variant="destructive">❌ Erreur</Badge>
      case "CONNECTION_ERROR":
        return <Badge variant="destructive">🔌 Connexion</Badge>
      default:
        return <Badge variant="secondary">⚠️ {status}</Badge>
    }
  }

  // Gérer le résultat de validation XSD reçu du composant enfant
  const handleXsdValidationComplete = (result) => {
    if (onAddToHistory && transformationResult?.payLoadOut) {
      // Ajouter à l'historique avec les détails de la validation XSD
      const xsdErrors = (result.errors || []).map(err => ({
         // S'assurer que l'erreur est un objet pour ajouter errorType
         errorType: "ERREUR VALIDATION XSD",
         message: typeof err === 'string' ? err : JSON.stringify(err),
      }));
      // Créer une nouvelle entrée pour la validation XSD
      onAddToHistory({
         operationType: "VALIDATION_XSD",
         // payLoadIn est le message MX pour la validation XSD
         payLoadIn: transformationResult.payLoadOut, 
         payLoadOut: null, // Pas de sortie après validation XSD
         status: result.valid ? "SUCCESS" : "ERROR",
         transformationErrors: [], // Pas d'erreurs de transformation dans ce cas
         objetTronquees: [],
         validationErrors: [], // Pas d'erreurs MT
         validationXsdErrors: xsdErrors,
      });
    }
    // Le toast est déjà géré dans ValidateXSD
    // Le résultat d'affichage est aussi géré dans ValidateXSD
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Conversion MT → MX</h2>
        <p className="text-muted-foreground">
          Transformez votre message SWIFT MT en format MX (ISO 20022) et validez-le contre le schéma XSD
        </p>
      </div>

      {/* Alerte statut backend */}
      {backendStatus === "offline" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Le backend n'est pas accessible. La conversion nécessite une connexion au serveur.
          </AlertDescription>
        </Alert>
      )}

      {/* Saisie du message */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Message MT
            {/* Bouton Agrandir pour le message MT */}
            <Button variant="outline" size="icon" className="ml-auto" onClick={() => handleEnlargeClick(message, 'Message MT')}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </CardTitle>
          <CardDescription>Saisissez ou collez votre message SWIFT MT ci-dessous pour le convertir</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Saisissez votre message MT ici..."
            className="min-h-[250px] font-mono text-sm"
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadSampleMessage}>
              <Upload className="h-4 w-4 mr-2" />
              Charger un exemple
            </Button>
            <Button variant="outline" onClick={() => setMessage("")}>
              <Trash2 className="h-4 w-4 mr-2" />
              Effacer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Boutons d'action */}
      <div className="flex gap-4">
        {/* Carte pour le bouton de conversion */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Conversion MT103 → MX
            </CardTitle>
            <CardDescription>Lancez la conversion de votre message validé en format MX.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
        <Button
          onClick={handleTransform}
          disabled={!message.trim() || loading || backendStatus === "offline"}
          size="lg"
              className="w-full"
        >
          {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
          {loading ? "Conversion en cours..." : "Convertir en MX"}
        </Button>
          </CardContent>
        </Card>

        {/* Le composant ValidateXSD prend en charge son propre bouton et affichage */}
        <ValidateXSD
          mxMessage={transformationResult?.payLoadOut}
          backendStatus={backendStatus}
          onValidationComplete={handleXsdValidationComplete}
        />
      </div>

      {/* Résultat de transformation */}
      {transformationResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Message MX généré
                {getStatusBadge(transformationResult.status)}
                {/* Bouton Agrandir pour le message MX */}
                {transformationResult.payLoadOut && (
                  <Button variant="outline" size="icon" className="ml-auto" onClick={() => handleEnlargeClick(transformationResult.payLoadOut, 'Message MX généré')}>
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
              {transformationResult.payLoadOut && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleCopy(transformationResult.payLoadOut)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadResult(transformationResult.payLoadOut, "message-mx.xml")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {transformationResult.payLoadOut ? (
              <ScrollArea className="h-[400px] w-full rounded-md border">
                <pre className="p-4 text-sm font-mono whitespace-pre-wrap">{transformationResult.payLoadOut}</pre>
              </ScrollArea>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Aucun message MX généré en raison d'erreurs de transformation.</AlertDescription>
              </Alert>
            )}

            {/* Erreurs de transformation */}
            {transformationResult.transformationErrors?.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                <h4 className="font-medium text-destructive">Erreurs de transformation :</h4>
                  {/* Bouton Agrandir pour les erreurs de transformation */}
                  <Button variant="outline" size="icon" onClick={() => handleEnlargeClick(transformationResult.transformationErrors.map(err => typeof err === 'object' ? (err.message || err.errorMessage || JSON.stringify(err)) : err).join('\n'), 'Erreurs de transformation')}>
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
                <ScrollArea className="h-[150px] w-full rounded-md border p-4">
                  <div className="space-y-2">
                    {transformationResult.transformationErrors.map((error, index) => (
                      <div key={index} className="text-sm border-l-2 border-red-200 pl-3">
                        <p className="font-medium text-red-700">{error.type || "ERROR"}</p>
                        <p className="text-red-600">{error.message || error}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Champs tronqués */}
            {transformationResult.objetTronquees?.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                <h4 className="font-medium text-yellow-700">Champs tronqués :</h4>
                  {/* Bouton Agrandir pour les champs tronqués */}
                  <Button variant="outline" size="icon" onClick={() => handleEnlargeClick(transformationResult.objetTronquees.map(field => `Champ: ${field.fieldName}, Valeur: ${field.originalValue}`).join('\n'), 'Champs tronqués')}>
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
                <ScrollArea className="h-[150px] w-full rounded-md border p-4">
                  <div className="space-y-2">
                    {transformationResult.objetTronquees.map((field, index) => (
                      <div key={index} className="text-sm border-l-2 border-yellow-200 pl-3">
                        <p className="font-medium text-yellow-700">{field.fieldName}</p>
                        <p className="text-yellow-600">Valeur originale : {field.originalValue}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
