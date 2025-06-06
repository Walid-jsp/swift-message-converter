"use client"

import { useState } from "react"

const HistoryList = ({ history, loading, onDelete, onRetry, onRefresh }) => {
  const [selectedItem, setSelectedItem] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState("details")

  const handleViewDetails = (item) => {
    setSelectedItem(item)
    setModalContent("details")
    setShowModal(true)
  }

  const handleViewErrors = (item) => {
    setSelectedItem(item)
    setModalContent("errors")
    setShowModal(true)
  }

  const handleViewTruncated = (item) => {
    setSelectedItem(item)
    setModalContent("truncated")
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedItem(null)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusBadge = (status) => {
    if (status === "SUCCESS") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          ✅ Succès
        </span>
      )
    } else if (status.includes("ERREUR VALIDATION")) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          ⚠️ Erreur validation
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          ⚠️ {status}
        </span>
      )
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

  if (!history || history.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Historique des conversions</h3>
            <button
              onClick={onRefresh}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition-colors flex items-center"
            >
              🔄 Actualiser
            </button>
          </div>
          <p className="text-center text-gray-500 py-8">Aucune conversion dans l'historique.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Historique des conversions</h3>
            <button
              onClick={onRefresh}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition-colors flex items-center"
            >
              🔄 Actualiser
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Erreurs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Champs tronqués
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(item.transformationDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.transformationErrors && item.transformationErrors.length > 0 ? (
                        <button
                          onClick={() => handleViewErrors(item)}
                          className="text-red-600 hover:text-red-800 flex items-center"
                        >
                          ⚠️ {item.transformationErrors.length}
                        </button>
                      ) : (
                        <span className="text-gray-500">Aucune</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.objetTronquees && item.objetTronquees.length > 0 ? (
                        <button
                          onClick={() => handleViewTruncated(item)}
                          className="text-yellow-600 hover:text-yellow-800 flex items-center"
                        >
                          ⚠️ {item.objetTronquees.length}
                        </button>
                      ) : (
                        <span className="text-gray-500">Aucun</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(item)}
                          className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded"
                          title="Voir les détails"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => onRetry(item.id)}
                          className="text-green-600 hover:text-green-800 px-2 py-1 rounded"
                          title="Relancer"
                        >
                          🔄
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="text-red-600 hover:text-red-800 px-2 py-1 rounded"
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[80vh] overflow-y-auto w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {modalContent === "details" && "Détails de la conversion"}
                  {modalContent === "errors" && "Erreurs de transformation"}
                  {modalContent === "truncated" && "Champs tronqués"}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl font-bold">
                  ✕
                </button>
              </div>

              {modalContent === "details" && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Message MT103 (Entrée)</h4>
                    <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-sm font-mono max-h-[200px] overflow-y-auto border">
                      {selectedItem.payLoadIn}
                    </pre>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Message MX (Sortie)</h4>
                    <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-sm font-mono max-h-[200px] overflow-y-auto border">
                      {selectedItem.payLoadOut || "Aucune sortie générée"}
                    </pre>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>ID:</strong> {selectedItem.id}
                    </div>
                    <div>
                      <strong>Date:</strong> {formatDate(selectedItem.transformationDate)}
                    </div>
                    <div className="col-span-2">
                      <strong>Statut:</strong> {selectedItem.status}
                    </div>
                  </div>
                </div>
              )}

              {modalContent === "errors" && (
                <div className="space-y-4">
                  {selectedItem.transformationErrors && selectedItem.transformationErrors.length > 0 ? (
                    selectedItem.transformationErrors.map((error, index) => (
                      <div key={index} className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="font-medium text-red-700">Type: {error.type}</p>
                        <p className="text-red-600">{error.message}</p>
                        <p className="text-xs text-gray-500">Date: {formatDate(error.date)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">Aucune erreur détectée.</p>
                  )}
                </div>
              )}

              {modalContent === "truncated" && (
                <div>
                  {selectedItem.objetTronquees && selectedItem.objetTronquees.length > 0 ? (
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
                          {selectedItem.objetTronquees.map((field, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {field.fieldName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {field.originalValue}
                              </td>
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

              <div className="flex justify-end mt-6">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default HistoryList
