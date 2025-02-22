"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"

interface ElevenLabsContextType {
  isInitialized: boolean
  error: string | null
}

const ElevenLabsContext = createContext<ElevenLabsContextType>({
  isInitialized: false,
  error: null,
})

export function ElevenLabsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ElevenLabsContextType>({
    isInitialized: false,
    error: null,
  })

  useEffect(() => {
    const initializeElevenLabs = async () => {
      try {
        if (!process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY) {
          throw new Error("ElevenLabs API key is not configured")
        }
        if (!process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID) {
          throw new Error("ElevenLabs Agent ID is not configured")
        }

        setState({ isInitialized: true, error: null })
      } catch (error) {
        setState({
          isInitialized: false,
          error: error instanceof Error ? error.message : "Failed to initialize ElevenLabs",
        })
      }
    }

    initializeElevenLabs()
  }, [])

  if (state.error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600">Configuration Error</h2>
          <p className="mt-2 text-sm text-gray-600">{state.error}</p>
        </div>
      </div>
    )
  }

  if (!state.isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-gray-600">Initializing ElevenLabs...</p>
        </div>
      </div>
    )
  }

  return <ElevenLabsContext.Provider value={state}>{children}</ElevenLabsContext.Provider>
}

export function useElevenLabs() {
  const context = useContext(ElevenLabsContext)
  if (context === undefined) {
    throw new Error("useElevenLabs must be used within an ElevenLabsProvider")
  }
  return context
}

