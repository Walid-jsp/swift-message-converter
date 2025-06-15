"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, TrendingUp, FileText, Zap, RefreshCw, Clock, BarChart3, Camera } from "lucide-react"

export default function Dashboard({ stats, backendStatus, onCheckHealth }) {
  const successRate = stats.totalConversions > 0 ? (stats.successfulConversions / stats.totalConversions) * 100 : 0

  return (
    <div className="space-y-6">
      {/* En-tête du Dashboard */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Vue d'ensemble de vos conversions SWIFT MT vers MX (ISO 20022)</p>
      </div>

      {/* Alerte statut backend */}
      {backendStatus === "offline" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Le backend n'est pas accessible. Vérifiez que le serveur Spring Boot fonctionne sur http://localhost:8080
            <Button variant="outline" size="sm" onClick={onCheckHealth} className="ml-2">
              <RefreshCw className="h-4 w-4 mr-1" />
              Vérifier
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Cartes de statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConversions}</div>
            <p className="text-xs text-muted-foreground">Messages traités</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions Réussies</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.successfulConversions}</div>
            <p className="text-xs text-muted-foreground">Transformations réussies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Succès</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Pourcentage de réussite</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erreurs de Validation</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.validationErrors}</div>
            <p className="text-xs text-muted-foreground">Erreurs détectées</p>
          </CardContent>
        </Card>
      </div>

      {/* Guide de démarrage rapide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Guide de démarrage rapide
          </CardTitle>
          <CardDescription>Comment utiliser SWIFT Converter efficacement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">1</Badge>
                <h4 className="font-medium">Valider MT</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Commencez par valider votre message MT pour détecter les erreurs de format.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">2</Badge>
                <h4 className="font-medium">Convertir</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Transformez votre message validé en format MX (ISO 20022) compatible.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">3</Badge>
                <h4 className="font-medium">Valider contre le XSD</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Validez le message converti contre le schéma XSD pour garantir la conformité.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations sur l'application */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />À propos de MT2MX Converter
            </CardTitle>
            <CardDescription>Convertisseur professionnel de messages bancaires</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Fonctionnalités principales :</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Validation des messages MT selon les standards SWIFT</li>
                <li>• Conversion automatique vers le format MX (ISO 20022)</li>
                <li>• Validation XSD des messages convertis</li>
                <li>• Historique complet des transformations</li>
                <li>• Interface moderne et intuitive</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
