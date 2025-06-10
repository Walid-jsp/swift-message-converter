"use client"

import { useState, useEffect } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { BarChart3, CheckCircle2, History, MessageSquare, Zap, Shield } from "lucide-react"

// Import des composants
import Dashboard from "@/components/Dashboard"
import ValidateMT from "@/components/ValidateMT"
import ConvertMT from "@/components/ConvertMT"
import HistoryView from "@/components/HistoryView"
import ValidateXsdPage from "@/components/ValidateXsdPage"

export default function Home() {
  const [activeView, setActiveView] = useState("dashboard")
  const [backendStatus, setBackendStatus] = useState("checking")
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [stats, setStats] = useState({
    totalConversions: 0,
    successfulConversions: 0,
    failedConversions: 0,
    validationErrors: 0,
  })
  const [mtMessageForConversion, setMtMessageForConversion] = useState("");
  const { toast } = useToast()

  // Vérification du backend au chargement
  useEffect(() => {
    checkBackendHealth()
    loadHistory()
  }, [])

  // Mise à jour des stats quand l'historique change
  useEffect(() => {
    updateStats()
  }, [history])

  const checkBackendHealth = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/messages/health", {
        method: "GET",
        credentials: "include",
      })
      setBackendStatus(response.ok ? "online" : "offline")
    } catch (error) {
      console.error("Backend health check failed:", error)
      setBackendStatus("offline")
    }
  }

  const loadHistory = async () => {
    if (backendStatus === "offline") return

    setHistoryLoading(true)
    try {
      const response = await fetch("http://localhost:8080/api/messages/history", {
        method: "GET",
        credentials: "include",
      })

      if (response.ok) {
        const historyData = await response.json()


        // Transformer les données pour correspondre au format attendu
        const formattedHistory = historyData.map((item) => {
          // Normaliser les erreurs de transformation
          const transformationErrors = (item.transformationErrors || []).map(err => {
            // Si errorType déjà présent, on garde
            if (err.errorType) return err
            // Déduction plus intelligente de errorType
            const errorMessage = JSON.stringify(err).toLowerCase();
            if (errorMessage.includes("xsd") || errorMessage.includes("schema")) {
              return { ...err, errorType: "XSD_VALIDATION_ERROR" }
            }
            // Utiliser l'operationType déduit précédemment si disponible, sinon une déduction basique
            const currentOperationType = (item.validationXsdErrors && item.validationXsdErrors.length > 0) ? "VALIDATION_XSD" : (item.payLoadOut ? "CONVERSION" : "VALIDATION_MT");
            if (currentOperationType === "VALIDATION_MT") return { ...err, errorType: "MT_VALIDATION_ERROR" }
            if (currentOperationType === "CONVERSION") return { ...err, errorType: "TRANSFORMATION_ERROR" }
            return { ...err, errorType: "ERREUR TECHNIQUE" }
          })
          // Normaliser les erreurs XSD (en s'assurant qu'elles ont bien le bon errorType)
          const validationXsdErrors = (item.validationXsdErrors || []).map(err => {
               // Assurez-vous que err est un objet avant d'accéder à errorType
               const existingErrorType = err && typeof err === 'object' ? err.errorType : undefined;
               if (existingErrorType === "XSD_VALIDATION_ERROR") return err;
               // Si ce n'est pas déjà une erreur XSD normalisée, la marquer comme telle
               return { ... (typeof err === 'object' ? err : { message: JSON.stringify(err) }), errorType: "XSD_VALIDATION_ERROR" };
          });

          // Combiner toutes les erreurs XSD qui pourraient être dans transformationErrors après normalisation
          const combinedValidationXsdErrors = [
            ...validationXsdErrors,
            ...transformationErrors.filter(err => err.errorType === "XSD_VALIDATION_ERROR")
          ];

          // Filtrer les erreurs XSD du tableau transformationErrors
          const filteredTransformationErrors = transformationErrors.filter(err => err.errorType !== "XSD_VALIDATION_ERROR");

          // Déduire le type d'opération *après* normalisation et combinaison des erreurs
          let operationType = "VALIDATION_MT"; // Default
          if (combinedValidationXsdErrors.length > 0) {
            operationType = "VALIDATION_XSD"; // Priorité si erreurs XSD présentes
          } else if (item.payLoadOut) {
            operationType = "CONVERSION"; // Sinon, si un payload de sortie existe, c'est une conversion
          }

          return {
            id: item.id,
            payLoadIn: item.payLoadIn,
            payLoadOut: item.payLoadOut,
            status: item.status,
            transformationDate: item.transformationDate,
            transformationErrors: filteredTransformationErrors, // Utiliser les erreurs de transformation filtrées
            objetTronquees: item.objetTronquees || [],
            validationErrors: item.validationErrors || [], // Garder ce champ s'il est utilisé pour autre chose
            validationXsdErrors: combinedValidationXsdErrors, // Utiliser les erreurs XSD combinées
            operationType, // Utiliser le type d'opération déduit après normalisation
          }
        })
        setHistory(formattedHistory)
        formattedHistory.forEach(item => {
          console.log(`Operation Type for item ${item.id}: ${item.operationType}`);
        });
      }
    } catch (error) {
      console.error("Failed to load history:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique",
        variant: "destructive",
      })
    } finally {
      setHistoryLoading(false)
    }
  }

  const updateStats = () => {
    const total = history.length
    const successful = history.filter((item) => item.status === "SUCCESS").length
    const failed = total - successful
    const validationErrors = history.reduce((acc, item) => {
      return acc + (item.transformationErrors?.length || 0)
    }, 0)

    setStats({
      totalConversions: total,
      successfulConversions: successful,
      failedConversions: failed,
      validationErrors: validationErrors,
    })
  }

  const refreshHistory = () => {
    loadHistory()
  }

  // Fonction pour ajouter à l'historique
  const addToHistory = (itemDetails) => {
    // Déduire le type d'opération au moment de l'ajout
    let operationType = "VALIDATION_MT"
    if (itemDetails.validationXsdErrors && itemDetails.validationXsdErrors.length > 0) {
      operationType = "VALIDATION_XSD"
    } else if (itemDetails.payLoadOut) {
      operationType = "CONVERSION"
    }

    const newItem = {
      id: Date.now(), // Générer un ID temporaire côté client, l'ID backend sera mis à jour au prochain load
      transformationDate: new Date().toISOString(),
      ...itemDetails,
      operationType, // Utiliser le type d'opération déduit ici
      transformationErrors: itemDetails.transformationErrors || [],
      objetTronquees: itemDetails.objetTronquees || [],
      validationErrors: itemDetails.validationErrors || [],
      validationXsdErrors: itemDetails.validationXsdErrors || [],
    };
    setHistory(prevHistory => [newItem, ...prevHistory]);
    // On rafraîchit aussi pour synchroniser avec le backend si l'opération est enregistrée côté serveur
    // Note: Le rafraîchissement va re-déduire le type basé sur les données backend, idéalement de la même manière.
    refreshHistory();
  }

  const deleteHistoryItem = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/messages/history/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        setHistory((prev) => prev.filter((item) => item.id !== id))
        toast({
          title: "Supprimé",
          description: "L'élément a été supprimé de l'historique",
        })
      } else {
        throw new Error("Erreur lors de la suppression")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'élément",
        variant: "destructive",
      })
    }
  }

  const retryConversion = async (item) => {
    try {
      const response = await fetch(`http://localhost:8080/api/messages/history/${item.id}/retry`, {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        setActiveView("convert")
        toast({
          title: "Conversion relancée",
          description: "Vous pouvez maintenant relancer la conversion",
        })
        // Optionnel : recharger le message dans l'interface de conversion
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de relancer la conversion",
        variant: "destructive",
      })
    }
  }

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard stats={stats} backendStatus={backendStatus} onCheckHealth={checkBackendHealth} />
      case "validate":
        return (
          <ValidateMT
            backendStatus={backendStatus}
            onAddToHistory={addToHistory}
            onRefreshHistory={refreshHistory}
            onValidationSuccess={(message) => {
              setMtMessageForConversion(message);
              setActiveView("convert");
            }}
          />
        )
      case "convert":
        return (
          <ConvertMT
            backendStatus={backendStatus}
            onAddToHistory={addToHistory}
            onRefreshHistory={refreshHistory}
            initialMessage={mtMessageForConversion}
          />
        )
      case "history":
        return (
          <HistoryView
            history={history}
            loading={historyLoading}
            onDeleteItem={deleteHistoryItem}
            onRetry={retryConversion}
            onRefresh={refreshHistory}
          />
        )
      case "validate-xsd":
        return <ValidateXsdPage backendStatus={backendStatus} />
      default:
        return <Dashboard stats={stats} backendStatus={backendStatus} onCheckHealth={checkBackendHealth} />
    }
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full ">
        {/* Sidebar */}
       <Sidebar className="border-r bg-gradient-to-r from-[#FF914D] to-[#FFC045]">
          <SidebarHeader className="border-b p-4 bg-gradient-to-r from-[#FF914D] to-[#FFC045]">
            {/* <div className="flex items-center">
                <img src="/logo-attijariwafa-bank.png" alt="" />
            </div> */}
          </SidebarHeader>

          <SidebarContent className="bg-gradient-to-r from-[#FF914D] to-[#FFC045]">
            <SidebarGroup>
              <SidebarGroupLabel className="text-black-800 font-medium">Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => setActiveView("dashboard")} 
                      isActive={activeView === "dashboard"}
                      className="hover:bg-orange-200/50 data-[state=open]:bg-orange-200/70 text-black-900"
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => setActiveView("validate")} 
                      isActive={activeView === "validate"}
                      className="hover:bg-orange-200/50 data-[state=open]:bg-orange-200/70 text-black-900"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Valider MT</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => setActiveView("convert")} 
                      isActive={activeView === "convert"}
                      className="hover:bg-orange-200/50 data-[state=open]:bg-orange-200/70 text-black-900"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Convertir</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => setActiveView("validate-xsd")} 
                      isActive={activeView === "validate-xsd"}
                      className="hover:bg-orange-200/50 data-[state=open]:bg-orange-200/70 text-black-900"
                    >
                      <Shield className="h-4 w-4" />
                      <span>Valider contre le XSD</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      onClick={() => setActiveView("history")} 
                      isActive={activeView === "history"}
                      className="hover:bg-orange-200/50 data-[state=open]:bg-orange-200/70 text-black-900"
                    >
                      <History className="h-4 w-4" />
                      <span>Historique</span>
                      {history.length > 0 && (
                        <Badge variant="secondary" className="ml-auto bg-orange-300 text-black-900">
                          {history.length}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-black-800 font-medium">Statistiques</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-3 py-2 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-black-900">Total:</span>
                    <Badge variant="outline" className="border-orange-400 text-black-800 bg-orange-100">{stats.totalConversions}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-black-900">Succès:</span>
                    <Badge className="bg-green-200 text-green-800 hover:bg-green-200">{stats.successfulConversions}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-black-900">Échecs:</span>
                    <Badge className="bg-red-200 text-red-800 hover:bg-red-200">{stats.failedConversions}</Badge>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

         <SidebarFooter className="border-t p-4 bg-gradient-to-r from-[#FF914D] to-[#FFC045]">

            <div className="text-xs text-black-800">
              <p className="font-medium">walid choukri lmerrakchi</p>
              <p className="mt-1">© 2025</p>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Contenu principal */}
        <SidebarInset className="flex-1">
          <header
  className="flex h-16 shrink-0 items-center gap-2 border-b px-4"
  style={{
    background: 'linear-gradient(90deg, #FFC045 0%,  #FF914D 100%)',
    boxShadow: '0 2px 8px 0 rgba(255, 193, 69, 0.15)'
  }}
>

            <SidebarTrigger className="-ml-1 text-black-900 hover:bg-orange-200/50" />
            <Separator orientation="vertical" className="mr-2 h-4 bg-orange-300" />
            <h1 className="text-xl font-semibold text-black-900">
              MT2MX Converter
            </h1>
          </header>

         <main className="flex-1 overflow-auto p-6 bg-gradient-to-br from-orange-100 to-yellow-100">{renderContent()}</main>

        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}