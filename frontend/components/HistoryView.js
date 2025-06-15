"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { History, Trash2, RotateCcw, Copy, Download, MessageSquare, Maximize2 } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export default function HistoryView({ history, loading, onDeleteItem, onRetry, onRefresh }) {
  const { toast } = useToast()
  // Filtres
  const [statusFilter, setStatusFilter] = useState("")
  const [errorTypeFilter, setErrorTypeFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [sortCriteria, setSortCriteria] = useState("recent") // 'recent' or 'oldest'
  // État pour la modale d'agrandissement
  const [isEnlargedDialogOpen, setIsEnlargedDialogOpen] = useState(false);
  const [enlargedMessageContent, setEnlargedMessageContent] = useState("");
  const [enlargedMessageTitle, setEnlargedMessageTitle] = useState("");

  // Liste des types d'erreur possibles
  const errorTypes = [
    "MT_VALIDATION_ERROR",
    "XSD_VALIDATION_ERROR",
    "TRANSFORMATION_ERROR"
  ]

  // Fonction de filtrage
  const filteredHistory = history.filter((item) => {
    // Filtre par statut
    if (statusFilter) {
      const successStatuses = ["SUCCESS", "TRANSFORMATION AVEC SUCCESS"]
      const isSuccess = successStatuses.includes(item.status)

      if (statusFilter === "SUCCESS" && !isSuccess) return false
      if (statusFilter === "ECHEC" && isSuccess) return false
    }

    // Filtre par type d'erreur
    if (errorTypeFilter) {
      // Vérifier les erreurs de transformation
      const hasTransformationError = (item.transformationErrors || []).some(error => {
        const errorType = error.errorType || error.type
        console.log("Transformation Error Type:", errorType, "Filter:", errorTypeFilter)
        return errorType === errorTypeFilter
      })

      // Vérifier les erreurs XSD
      const hasXsdError = (item.validationXsdErrors || []).some(error => {
        const errorType = error.errorType || error.type
        console.log("XSD Error Type:", errorType, "Filter:", errorTypeFilter)
        return errorType === errorTypeFilter
      })

      // Si aucune erreur ne correspond au type filtré, exclure l'item
      if (!hasTransformationError && !hasXsdError) {
        console.log("Item excluded - no matching error type:", item.id)
        return false
      }
    }

    // Filtre par date
    if (dateFilter) {
      const itemDate = new Date(item.transformationDate).toISOString().slice(0, 10)
      if (itemDate !== dateFilter) return false
    }

    return true
  })

  // Fonction de tri
  const sortedFilteredHistory = [...filteredHistory].sort((a, b) => {
    const dateA = new Date(a.transformationDate);
    const dateB = new Date(b.transformationDate);

    if (sortCriteria === "recent") {
      return dateB.getTime() - dateA.getTime(); // Plus récent d'abord
    } else {
      return dateA.getTime() - dateB.getTime(); // Plus ancien d'abord
    }
  });

  // Fonction pour ouvrir la modale avec le contenu du message
  const handleEnlargeClick = (content, title) => {
    setEnlargedMessageContent(content);
    setEnlargedMessageTitle(title);
    setIsEnlargedDialogOpen(true);
  };

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
      case "TRANSFORMATION AVEC SUCCESS":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">✅ Succès</Badge>
      case "ERREUR VALIDATION MT":
        return <Badge variant="destructive">❌ Validation MT</Badge>
      case "ERREUR VALIDATION XSD":
        return <Badge variant="destructive">❌ Validation XSD</Badge>
      case "ERREUR TECHNIQUE":
        return <Badge variant="destructive">❌ Technique</Badge>
      case "IN_PROGRESS":
        return <Badge variant="secondary">⏳ En cours</Badge>
      default:
        return <Badge variant="secondary">⚠️ {status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Chargement de l'historique...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="flex flex-wrap gap-4 items-end mb-2">
        <div>
          <label className="block text-sm font-medium mb-1">Trier par</label>
          <select className="border rounded px-2 py-1" value={sortCriteria} onChange={e => setSortCriteria(e.target.value)}>
            <option value="recent">Le plus récent</option>
            <option value="oldest">Le plus ancien</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            className="border rounded px-2 py-1 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-300"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
          />

        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Statut</label>
          <select className="border rounded px-2 py-1" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">Tous</option>
            <option value="SUCCESS">Succès</option>
            <option value="ECHEC">Échec</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Type d'erreur</label>
          <select className="border rounded px-2 py-1" value={errorTypeFilter} onChange={e => setErrorTypeFilter(e.target.value)}>
            <option value="">Tous</option>
            {errorTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Historique des opérations</h2>
          {/* <p className="text-muted-foreground">{filteredHistory.length} opération(s) affichée(s)</p> */}
          <p className="text-muted-foreground">{sortedFilteredHistory.length} opération(s) affichée(s)</p>
        </div>
        <Button variant="outline" onClick={onRefresh}>
          <History className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>
      {/* Contenu */}
      {filteredHistory.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <History className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucune opération dans l'historique</h3>
              <p className="text-muted-foreground mb-4">
                Les validations et conversions apparaîtront ici une fois que vous aurez traité des messages.
              </p>
              <Button onClick={() => onRetry(null)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Commencer une opération
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedFilteredHistory.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">
                      {/* Affichage du type d'opération - CORRECTION ICI */}
                      {item.operationType === "VALIDATION_MT" && "Validation MT"}
                      {item.operationType === "CONVERSION" && "Conversion"}
                      {item.operationType === "VALIDATION_XSD" && "Validation XSD"}
                      #{item.id}
                    </CardTitle>
                    {getStatusBadge(item.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => onRetry(item)}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Relancer
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onDeleteItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>{new Date(item.transformationDate).toLocaleString("fr-FR")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="input" className="w-full">
                  <TabsList>
                    {/* CORRECTION ICI - Logique d'affichage des onglets pour validation XSD */}
                    {item.operationType === "VALIDATION_XSD" ? (
                      <>
                        <TabsTrigger value="input">Message MX</TabsTrigger>
                        {item.validationXsdErrors?.length > 0 && (
                          <TabsTrigger value="xsd">Erreurs XSD ({item.validationXsdErrors.length})</TabsTrigger>
                        )}
                      </>
                    ) : (
                      <>
                        <TabsTrigger value="input">
                          {item.operationType === "VALIDATION_MT" ? "Message MT103" : "Message d'entrée"}
                        </TabsTrigger>
                        {item.operationType !== "VALIDATION_XSD" && item.payLoadOut && (
                          <TabsTrigger value="output">Message MX</TabsTrigger>
                        )}
                        {item.transformationErrors?.length > 0 && (
                          <TabsTrigger value="errors">Erreurs ({item.transformationErrors.length})</TabsTrigger>
                        )}
                        {item.validationXsdErrors?.length > 0 && (
                          <TabsTrigger value="xsd">Erreurs XSD ({item.validationXsdErrors.length})</TabsTrigger>
                        )}
                      </>
                    )}
                    {item.objetTronquees?.length > 0 && (
                      <TabsTrigger value="truncated">Tronqués ({item.objetTronquees.length})</TabsTrigger>
                    )}
                  </TabsList>
                  <>
                    {/* CORRECTION ICI - Affichage du contenu selon le type d'opération */}
                    <TabsContent value="input">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">
                            {item.operationType === "VALIDATION_XSD" 
                              ? "Message MX" 
                              : item.operationType === "VALIDATION_MT" 
                                ? "Message MT103" 
                                : "Message d'entrée"}
                          </h4>
                          <div className="flex gap-2 items-center">
                            {/* Pour validation XSD, utiliser payLoadOut, sinon payLoadIn */}
                            {(item.operationType === "VALIDATION_XSD" ? item.payLoadOut : item.payLoadIn) && (
                              <Button variant="outline" size="sm" onClick={() => handleCopy(item.operationType === "VALIDATION_XSD" ? item.payLoadOut : item.payLoadIn)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copier
                              </Button>
                            )}
                            {(item.operationType === "VALIDATION_XSD" ? item.payLoadOut : item.payLoadIn) && (
                              <Button variant="outline" size="icon" onClick={() => handleEnlargeClick(
                                item.operationType === "VALIDATION_XSD" ? item.payLoadOut : item.payLoadIn,
                                item.operationType === "VALIDATION_XSD" ? 'Message MX' : 'Message d\'entrée'
                              )}>
                                <Maximize2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <ScrollArea className="h-[200px] w-full rounded-md border">
                          <pre className="p-4 text-sm font-mono whitespace-pre-wrap">
                            {item.operationType === "VALIDATION_XSD" 
                              ? (item.payLoadOut || "Aucun message MX")
                              : (item.payLoadIn || "Aucun message d'entrée")}
                          </pre>
                        </ScrollArea>
                      </div>
                    </TabsContent>

                    {/* Erreurs de validation XSD */}
                    {item.validationXsdErrors?.length > 0 && (
                      <TabsContent value="xsd">
                        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                          <div className="space-y-3">
                            {item.validationXsdErrors.map((error, index) => (
                              <div key={index} className="border-l-2 border-red-200 pl-3">
                                <p className="font-medium text-red-700">Erreur XSD</p>
                                {/* Afficher le message de l'erreur */}
                                <p className="text-red-600 text-sm">
                                  {typeof error === 'object' && error !== null
                                    ? error.errorMessage || error.message || "Erreur inconnue (format objet)"
                                    : typeof error === 'string'
                                      ? error
                                      : "Erreur inconnue (format inconnu)"}
                                </p>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                    )}

                    {/* Message de sortie (seulement pour les opérations autres que VALIDATION_XSD) */}
                    {item.operationType !== "VALIDATION_XSD" && item.payLoadOut && (
                      <TabsContent value="output">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">Message de sortie (MX)</h4>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleCopy(item.payLoadOut)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copier
                              </Button>
                              <Button
                                variant="outline" size="sm" onClick={() => downloadResult(item.payLoadOut, `message-mx-${item.id}.xml`)}>
                                <Download className="h-4 w-4 mr-2" />
                                Télécharger
                              </Button>
                              <Button variant="outline" size="icon" onClick={() => handleEnlargeClick(item.payLoadOut, 'Message de sortie')}>
                                <Maximize2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <ScrollArea className="h-[200px] w-full rounded-md border">
                            <pre className="p-4 text-sm font-mono whitespace-pre-wrap">{item.payLoadOut}</pre>
                          </ScrollArea>
                        </div>
                      </TabsContent>
                    )}

                    {/* Erreurs de transformation (seulement pour les opérations autres que VALIDATION_XSD) */}
                    {item.operationType !== "VALIDATION_XSD" && item.transformationErrors?.length > 0 && (
                      <TabsContent value="errors">
                        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                          <div className="space-y-3">
                            {item.transformationErrors.map((error, index) => (
                              <div key={index} className="border-l-2 border-red-200 pl-3">
                                {/* Afficher le type et le message de l'erreur */}
                                <p className="font-medium text-red-700">{error.errorType || "ERROR"}</p>
                                <p className="text-red-600 text-sm">{error.errorMessage || error.message || JSON.stringify(error)}</p>
                                {error.errorDate && (
                                  <p className="text-xs text-gray-500">
                                    {new Date(error.errorDate).toLocaleString("fr-FR")}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                    )}

                    {item.objetTronquees?.length > 0 && (
                      <TabsContent value="truncated">
                        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                          <div className="space-y-3">
                            {item.objetTronquees.map((field, index) => (
                              <div key={index} className="border-l-2 border-yellow-200 pl-3">
                                <p className="font-medium text-yellow-700">{field.fieldName}</p>
                                <p className="text-yellow-600 text-sm">Valeur originale : {field.originalValue}</p>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                    )}
                  </>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {/* Modale pour afficher le message agrandi */}
      <Dialog open={isEnlargedDialogOpen} onOpenChange={setIsEnlargedDialogOpen}>
        <DialogContent className="sm:max-w-[800px] w-full h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{enlargedMessageTitle}</DialogTitle>
            {/* <DialogDescription>Message complet</DialogDescription> */}
          </DialogHeader>
          <div className="flex-grow overflow-hidden">
            <ScrollArea className="h-full w-full pr-4">
              <pre className="text-sm font-mono whitespace-pre-wrap break-all">{enlargedMessageContent}</pre>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}