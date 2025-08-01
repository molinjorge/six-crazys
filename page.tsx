"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Shuffle, Trophy, Plus, List, UserCog } from "lucide-react"
import TournamentSetup from "@/components/tournament-setup"
import TournamentManager from "@/components/tournament-manager"
import TournamentList from "@/components/tournament-list"
import PlayerCatalog from "@/components/player-catalog"

export type TournamentMode = "6-loco" | "fixed-pairs" | null

export type PlayerProfile = {
  id: string
  name: string
  phone: string
  email: string
  idNumber: string
  category: string
  createdAt: Date
}

export type Player = {
  id: string
  name: string
  points: number
  wins: number
  draws: number
  losses: number
  profileId?: string // Reference to PlayerProfile
}

export type Pair = {
  id: string
  player1: Player
  player2: Player
  points: number
}

export type Match = {
  id: string
  court: number
  pair1: Pair
  pair2: Pair
  result?: "pair1" | "pair2" | "draw"
  completed: boolean
  score?: {
    pair1Games: number
    pair2Games: number
  }
}

export type Round = {
  id: string
  number: number
  matches: Match[]
  completed: boolean
}

export type Tournament = {
  id: string
  name: string
  category: string
  mode: TournamentMode
  players: Player[]
  pairs?: Pair[]
  rounds: Round[]
  currentRound: number
  courts: number
  createdAt: Date
  status: "setup" | "active" | "completed"
}

export default function Home() {
  const [selectedMode, setSelectedMode] = useState<TournamentMode>(null)
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null)
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [playerProfiles, setPlayerProfiles] = useState<PlayerProfile[]>([])
  const [currentView, setCurrentView] = useState<"home" | "list" | "setup" | "tournament" | "players">("home")

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedTournaments = localStorage.getItem("six-crazys-tournaments")
    const savedPlayers = localStorage.getItem("six-crazys-players")

    if (savedTournaments) {
      try {
        const parsed = JSON.parse(savedTournaments)
        setTournaments(parsed.map((t: any) => ({ ...t, createdAt: new Date(t.createdAt) })))
      } catch (error) {
        console.error("Error loading tournaments:", error)
      }
    }

    if (savedPlayers) {
      try {
        const parsed = JSON.parse(savedPlayers)
        setPlayerProfiles(parsed.map((p: any) => ({ ...p, createdAt: new Date(p.createdAt) })))
      } catch (error) {
        console.error("Error loading players:", error)
      }
    }
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("six-crazys-tournaments", JSON.stringify(tournaments))
  }, [tournaments])

  useEffect(() => {
    localStorage.setItem("six-crazys-players", JSON.stringify(playerProfiles))
  }, [playerProfiles])

  const handleModeSelect = (mode: TournamentMode) => {
    setSelectedMode(mode)
    setCurrentView("setup")
  }

  const handleTournamentStart = (tournamentData: Tournament) => {
    const newTournament = { ...tournamentData, status: "active" as const }
    setTournaments((prev) => [...prev, newTournament])
    setActiveTournament(newTournament)
    setCurrentView("tournament")
  }

  const handleSelectTournament = (tournament: Tournament) => {
    setActiveTournament(tournament)
    setCurrentView("tournament")
  }

  const handleUpdateTournament = (updatedTournament: Tournament) => {
    setTournaments((prev) => prev.map((t) => (t.id === updatedTournament.id ? updatedTournament : t)))
    setActiveTournament(updatedTournament)
  }

  const handleBackToHome = () => {
    setCurrentView("home")
    setSelectedMode(null)
    setActiveTournament(null)
  }

  const handleBackToList = () => {
    setCurrentView("list")
    setActiveTournament(null)
  }

  const handleUpdatePlayerProfiles = (profiles: PlayerProfile[]) => {
    setPlayerProfiles(profiles)
  }

  if (currentView === "players") {
    return (
      <PlayerCatalog
        playerProfiles={playerProfiles}
        onUpdateProfiles={handleUpdatePlayerProfiles}
        onBack={handleBackToHome}
      />
    )
  }

  if (currentView === "tournament" && activeTournament) {
    return (
      <TournamentManager
        tournament={activeTournament}
        setTournament={handleUpdateTournament}
        onBack={tournaments.length > 1 ? handleBackToList : handleBackToHome}
      />
    )
  }

  if (currentView === "setup" && selectedMode) {
    return (
      <TournamentSetup
        mode={selectedMode}
        playerProfiles={playerProfiles}
        onTournamentStart={handleTournamentStart}
        onBack={() => setCurrentView("home")}
      />
    )
  }

  if (currentView === "list") {
    return (
      <TournamentList
        tournaments={tournaments}
        onSelectTournament={handleSelectTournament}
        onBack={handleBackToHome}
        onNewTournament={() => setCurrentView("home")}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">SIX-CRAZYS</h1>
          <p className="text-lg text-gray-600">Gestiona tus Juegos de Padel</p>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <Button onClick={() => setCurrentView("players")} variant="outline">
            <UserCog className="h-4 w-4 mr-2" />
            Catálogo de Jugadores ({playerProfiles.length})
          </Button>
          {tournaments.length > 0 && (
            <Button onClick={() => setCurrentView("list")} variant="outline">
              <List className="h-4 w-4 mr-2" />
              Torneos Activos ({tournaments.length})
            </Button>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleModeSelect("6-loco")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shuffle className="h-6 w-6 text-orange-500" />6 LOCO
              </CardTitle>
              <CardDescription>Parejas aleatorias que cambian cada ronda</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Parejas se forman aleatoriamente</li>
                <li>• No se repiten parejas entre rondas</li>
                <li>• Ganador: 2 puntos, Empate: 1 punto c/u</li>
                <li>• Múltiples canchas disponibles</li>
              </ul>
              <Button className="w-full mt-4 bg-transparent" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Crear Nuevo Torneo
              </Button>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleModeSelect("fixed-pairs")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-500" />
                Parejas Fijas
              </CardTitle>
              <CardDescription>Parejas fijas con oponentes aleatorios</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Parejas permanecen fijas</li>
                <li>• Oponentes cambian cada ronda</li>
                <li>• No se repiten enfrentamientos</li>
                <li>• Sistema de puntuación igual</li>
              </ul>
              <Button className="w-full mt-4 bg-transparent" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Crear Nuevo Torneo
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Características del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Catálogo de Jugadores</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>Base de datos completa</li>
                  <li>Información de contacto</li>
                  <li>Categorías organizadas</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Múltiples Torneos</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>Gestiona varios torneos simultáneamente</li>
                  <li>Diferentes categorías</li>
                  <li>Cambio rápido entre torneos</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Gestión Avanzada</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>Marcadores detallados</li>
                  <li>Tabla de posiciones en tiempo real</li>
                  <li>Historial completo de partidos</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
