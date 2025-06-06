"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle2, AlertCircle, Upload, Trash2, RefreshCw, FileText, Maximize2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export default function ValidateMT({ backendStatus, onAddToHistory, onRefreshHistory, onValidationSuccess }) {
  const [message, setMessage] = useState("")
  const [validationResult, setValidationResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [isEnlargedDialogOpen, setIsEnlargedDialogOpen] = useState(false)
  const [enlargedContent, setEnlargedContent] = useState("")
  const [enlargedTitle, setEnlargedTitle] = useState("")

  const handleEnlargeClick = (content, title) => {
    setEnlargedContent(content)
    setEnlargedTitle(title)
    setIsEnlargedDialogOpen(true)
  }

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

  const handleValidate = async () => {
    if (!message.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un message MT103",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setValidationResult(null)

    try {
      const response = await fetch("http://localhost:8080/api/messages/validate-mt", {
        method: "POST",
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          Accept: "application/json, text/plain, */*",
        },
        body: message.trim(),
        credentials: "include",
      })

      const text = await response.text()
      let errors = []

      if (response.ok) {
        if (text && text.trim() !== "") {
          if (text.trim() === "MT Valide !") {
            errors = []
          } else {
            try {
              const jsonData = JSON.parse(text)
              errors = Array.isArray(jsonData) ? jsonData : [jsonData]
            } catch {
              errors = [text]
            }
          }
        }

        const result = {
          success: true,
          errors: errors.filter((err) => err && err.trim() !== ""),
        }

        setValidationResult(result)

        // Ajouter à l'historique
        onAddToHistory(message.trim(), null, "VALIDATION", [], [], result.errors.length > 0 ? result.errors : [])

        // Rafraîchir l'historique après validation
        if (onRefreshHistory) {
          onRefreshHistory()
        }

        // Si la validation est un succès, notifier le parent et passer le message
        if (result.success && result.errors.length === 0 && onValidationSuccess) {
          onValidationSuccess(message.trim());
        }

        toast({
          title: "Validation terminée",
          description:
            result.errors.length === 0 ? "Message valide ✅" : `${result.errors.length} erreur(s) détectée(s) ⚠️`,
          variant: result.errors.length === 0 ? "default" : "destructive",
        })
      } else {
        const errorMessage = `Erreur HTTP ${response.status}: ${text}`
        setValidationResult({
          success: false,
          errors: [errorMessage],
        })

        toast({
          title: "Erreur de validation",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Validation error:", error)
      const errorMessage = `Erreur de connexion: ${error.message}`
      setValidationResult({
        success: false,
        errors: [errorMessage],
      })

      toast({
        title: "Erreur de connexion",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Validation MT103</h2>
        <p className="text-muted-foreground">
          Validez votre message SWIFT MT103 selon les standards bancaires internationaux
        </p>
      </div>

      {/* Alerte statut backend */}
      {backendStatus === "offline" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Le backend n'est pas accessible. La validation nécessite une connexion au serveur.
          </AlertDescription>
        </Alert>
      )}

      {/* Saisie du message */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Message MT103
            <Button variant="outline" size="icon" className="ml-auto" onClick={() => handleEnlargeClick(message, 'Message MT103')}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </CardTitle>
          <CardDescription>Saisissez ou collez votre message SWIFT MT103 ci-dessous pour le valider</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Saisissez votre message MT103 ici..."
            className="min-h-[300px] font-mono text-sm"
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

      {/* Bouton de validation */}
      <div className="flex justify-center">
        <Button
          onClick={handleValidate}
          disabled={!message.trim() || loading || backendStatus === "offline"}
          size="lg"
          className="px-8"
        >
          {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
          {loading ? "Validation en cours..." : "Valider le message"}
        </Button>
      </div>

      {/* Résultats de validation */}
      {validationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Résultat de la validation
            </CardTitle>
          </CardHeader>
          <CardContent>
            {validationResult.errors.length === 0 ? (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  ✅ Le message MT103 est valide. Aucune erreur détectée. Vous pouvez maintenant procéder à la
                  conversion.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    ⚠️ {validationResult.errors.length} erreur(s) détectée(s) dans le message MT103.
                  </AlertDescription>
                </Alert>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Liste des erreurs :</h4>
                  {validationResult.errors.length > 0 && (
                    <Button variant="outline" size="icon" onClick={() => handleEnlargeClick(validationResult.errors.map(err => typeof err === 'string' ? err : JSON.stringify(err)).join('\n'), 'Liste des erreurs')}>
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                  <div className="space-y-2">
                    {validationResult.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-600 border-l-2 border-red-200 pl-3 py-1">
                        {error}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Guide d'utilisation */}
      <Card>
        <CardHeader>
          <CardTitle>Guide de validation</CardTitle>
          <CardDescription>Conseils pour une validation réussie</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              • Assurez-vous que votre message commence par {`{1:`} et se termine par {`-}`}
            </p>
            <p>• Vérifiez que tous les champs obligatoires sont présents (:20, :32A, :50K, :59)</p>
            <p>• Respectez les formats de date (YYMMDD) et de montant</p>
            <p>• Les codes de devise doivent être conformes à la norme ISO 4217</p>
            <p>• Utilisez l'exemple fourni comme référence pour le format correct</p>
          </div>
        </CardContent>
      </Card>

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
