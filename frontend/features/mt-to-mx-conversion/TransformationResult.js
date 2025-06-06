"use client"

import { useState } from "react"

const TransformationResult = ({ result, loading }) => {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("xml")

  const handleCopy = () => {
    if (result?.payLoadOut) {
      navigator.clipboard.writeText(result.payLoadOut)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Transformation en cours...</span>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Résultat de la transformation</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
            <div className="w-5 h-5 text-blue-500 mr-3">ℹ️</div>
            <div className="text-blue-700">
              Aucune transformation n'a encore été effectuée. Veuillez transformer un message MT103.
            </div>
          </div>
        </div>
      </div>
    )
  }

  const hasErrors = result.transformationErrors && result.transformationErrors.length > 0
  const hasTruncatedFields = result.objetTronquees && result.objetTronquees.length > 0

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Résultat de la transformation</h3>

        {result.status !== "SUCCESS" ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center mb-4">
            <div className="w-5 h-5 text-red-500 mr-3">⚠️</div>
            <div className="text-red-700">Statut: {result.status}</div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center mb-4">
            <div className="w-5 h-5 text-green-500 mr-3">✅</div>
            <div className="text-green-700">Transformation réussie</div>
          </div>
        )}

        {/* Navigation par onglets */}
        <div className="mb-4">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("xml")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "xml"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Message MX
            </button>
            <button
              onClick={() => setActiveTab("errors")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "errors"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Erreurs {hasErrors && `(${result.transformationErrors.length})`}
            </button>
            <button
              onClick={() => setActiveTab("truncated")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "truncated"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Champs tronqués {hasTruncatedFields && `(${result.objetTronquees.length})`}
            </button>
          </div>
        </div>

        {/* Contenu des onglets */}
        {activeTab === "xml" && (
          <div>
            {result.payLoadOut ? (
              <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-sm font-mono max-h-[400px] overflow-y-auto border">
                {result.payLoadOut}
              </pre>
            ) : (
              <p className="text-gray-500">Aucun message MX généré.</p>
            )}
          </div>
        )}

        {activeTab === "errors" && (
          <div>
            {hasErrors ? (
              <div className="space-y-2">
                {result.transformationErrors.map((error, index) => (
                  <div key={index} className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="font-medium text-red-700">Type: {error.type}</p>
                    <p className="text-red-600">{error.message}</p>
                    <p className="text-xs text-gray-500">Date: {new Date(error.date).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Aucune erreur détectée.</p>
            )}
          </div>
        )}

        {activeTab === "truncated" && (
          <div>
            {hasTruncatedFields ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Champ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valeur originale
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {result.objetTronquees.map((field, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {field.fieldName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{field.originalValue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">Aucun champ tronqué.</p>
            )}
          </div>
        )}
      </div>

      {result.payLoadOut && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={handleCopy}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            {copied ? (
              <>
                <span className="mr-2">✅</span>
                Copié !
              </>
            ) : (
              <>
                <span className="mr-2">📋</span>
                Copier le XML
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default TransformationResult
