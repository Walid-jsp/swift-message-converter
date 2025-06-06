"use client"

import { useState } from "react"

const MessageInput = ({ message, setMessage, onValidate, onTransform, loading }) => {
  const [showPlaceholder, setShowPlaceholder] = useState(!message)

  const handleChange = (e) => {
    setMessage(e.target.value)
    setShowPlaceholder(!e.target.value)
  }

  const handlePaste = () => {
    // Exemple de message MT103 pour faciliter les tests
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
    setShowPlaceholder(false)
  }

  const handleClear = () => {
    setMessage("")
    setShowPlaceholder(true)
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="p-6">
        <div className="relative">
          <textarea
            value={message}
            onChange={handleChange}
            className="w-full min-h-[300px] p-4 border border-gray-300 rounded-md font-mono text-sm resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder=""
          />
          {showPlaceholder && (
            <div className="absolute top-0 left-0 p-4 text-gray-400 pointer-events-none font-mono text-sm">
              {`{1:F01BANKBEBBAXXX0000000000}{2:I103BANKDEFFXXXXN}{4:
:20:REFERENCE
:23B:CRED
:32A:YYMMDDCUR1000,00
:50K:/ACCOUNT
NAME
ADDRESS
...
-}`}
            </div>
          )}
        </div>
      </div>
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between flex-wrap gap-2">
        <div>
          <button
            onClick={handlePaste}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition-colors mr-2"
          >
            Exemple
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          >
            Effacer
          </button>
        </div>
        <div>
          <button
            onClick={onValidate}
            disabled={!message.trim() || loading}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mr-2"
          >
            {loading ? "Validation..." : "Valider"}
          </button>
          <button
            onClick={onTransform}
            disabled={!message.trim() || loading}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Transformation..." : "Transformer"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MessageInput