const ValidationResult = ({ errors, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Validation en cours...</span>
      </div>
    )
  }

  if (!errors || errors.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Résultat de la validation</h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <div className="w-5 h-5 text-green-500 mr-3">✅</div>
            <div className="text-green-700">Le message MT est valide. Aucune erreur détectée.</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Résultat de la validation</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center mb-4">
          <div className="w-5 h-5 text-red-500 mr-3">⚠️</div>
          <div className="text-red-700">{errors.length} erreur(s) détectée(s) dans le message MT.</div>
        </div>

        <div>
          <h4 className="text-md font-medium mb-2">Liste des erreurs :</h4>
          <ul className="list-disc pl-5 space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-red-600">
                {error}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ValidationResult