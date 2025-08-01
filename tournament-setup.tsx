"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Trash2 } from "lucide-react"
import type { TournamentMode, Tournament, Player, Pair, PlayerProfile } from "@/app/page"
import PlayerSelector from "@/components/player-selector"
import PairCreator from "@/components/pair-creator"

interface TournamentSetupProps {
  mode: TournamentMode
  playerProfiles: PlayerProfile[]
  onTournamentStart: (tournament: Tournament) => void
  onBack: () => void
}

export default function TournamentSetup({ mode, playerProfiles, onTournamentStart, onBack }: TournamentSetupProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [courts, setCourts] = useState(1)
  const [pairs, setPairs] = useState<Pair[]>([])
  const [tournamentName, setTournamentName] = useState("")
  const [category, setCategory] = useState("")

  const categories = [...new Set(playerProfiles.map((p) => p.category))].filter(Boolean).sort()

  const addPlayer = (player: Player) => {
    setPlayers([...players, player])
  }

  const addManualPlayer = (name: string) => {
    const newPlayer: Player = {
      id: Date.now().toString(),
      name: name,
      points: 0,
      wins: 0,
      draws: 0,
      losses: 0,
    }
    setPlayers([...players, newPlayer])
  }

  const removePlayer = (playerId: string) => {
    setPlayers(players.filter((p) => p.id !== playerId))
    // Also remove from pairs if exists
    setPairs(pairs.filter((pair) => pair.player1.id !== playerId && pair.player2.id !== playerId))
  }

  const createPair = (player1Id: string, player2Id: string) => {
    const player1 = players.find((p) => p.id === player1Id)
    const player2 = players.find((p) => p.id === player2Id)

    if (player1 && player2) {
      const newPair: Pair = {
        id: `pair-${pairs.length + 1}`,
        player1,
        player2,
        points: 0,
      }
      setPairs([...pairs, newPair])
    }
  }

  const removePair = (pairId: string) => {
    setPairs(pairs.filter((p) => p.id !== pairId))
  }

  const getAvailablePlayers = () => {
    const usedPlayerIds = pairs.flatMap((pair) => [pair.player1.id, pair.player2.id])
    return players.filter((player) => !usedPlayerIds.includes(player.id))
  }

  const startTournament = () => {
    const tournament: Tournament = {
      id: Date.now().toString(),
      name: tournamentName || `${mode === "6-loco" ? "6 LOCO" : "Parejas Fijas"} - ${category || "Sin categoría"}`,
      category: category || "Sin categoría",
      mode,
      players,
      pairs: mode === "fixed-pairs" ? pairs : undefined,
      rounds: [],
      currentRound: 0,
      courts,
      createdAt: new Date(),
      status: "setup",
    }

    onTournamentStart(tournament)
  }

  const canStart = () => {
    if (mode === "6-loco") {
      return players.length >= 4 && players.length % 4 === 0
    } else {
      return pairs.length >= 2 && pairs.length % 2 === 0 && getAvailablePlayers().length === 0
    }
  }

  const getRequiredPlayers = () => {
    if (mode === "6-loco") {
      return courts * 4
    }
    return "múltiplo de 4"
  }

  const getPlayerProfile = (player: Player): PlayerProfile | undefined => {
    return player.profileId ? playerProfiles.find((p) => p.id === player.profileId) : undefined
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            SIX-CRAZYS - {mode === "6-loco" ? "6 LOCO" : "Parejas Fijas"}
          </h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Torneo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tournamentName">Nombre del Torneo (Opcional)</Label>
                <Input
                  id="tournamentName"
                  value={tournamentName}
                  onChange={(e) => setTournamentName(e.target.value)}
                  placeholder={`${mode === "6-loco" ? "6 LOCO" : "Parejas Fijas"} - Torneo`}
                />
              </div>

              <div>
                <Label htmlFor="category">Categoría</Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Solo se mostrarán jugadores de esta categoría en el selector
                </p>
              </div>

              <div>
                <Label htmlFor="courts">Número de Canchas</Label>
                <Input
                  id="courts"
                  type="number"
                  min="1"
                  value={courts}
                  onChange={(e) => setCourts(Number.parseInt(e.target.value) || 1)}
                />
                <p className="text-sm text-gray-500 mt-1">Cada cancha requiere 4 jugadores</p>
              </div>

              <div className="text-sm text-gray-600">
                <p>Jugadores necesarios: {getRequiredPlayers()}</p>
                <p>Jugadores actuales: {players.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agregar Jugadores</CardTitle>
            </CardHeader>
            <CardContent>
              <PlayerSelector
                playerProfiles={playerProfiles}
                category={category}
                selectedPlayers={players}
                onAddPlayer={addPlayer}
                onAddManualPlayer={addManualPlayer}
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Jugadores Registrados ({players.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {players.map((player) => {
                  const profile = getPlayerProfile(player)
                  return (
                    <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{player.name}</span>
                          {profile ? (
                            <Badge variant="default">Catálogo</Badge>
                          ) : (
                            <Badge variant="outline">Manual</Badge>
                          )}
                        </div>
                        {profile && (
                          <div className="text-xs text-gray-500">
                            {profile.category} • {profile.phone}
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removePlayer(player.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {mode === "fixed-pairs" && players.length >= 2 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Crear Parejas Manualmente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <PairCreator availablePlayers={getAvailablePlayers()} onCreatePair={createPair} />
                {getAvailablePlayers().length === 0 && players.length > 0 && (
                  <div className="text-sm text-green-600 p-2 bg-green-50 rounded">
                    ✓ Todos los jugadores han sido asignados a parejas
                  </div>
                )}

                {pairs.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Parejas Formadas ({pairs.length})</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {pairs.map((pair, index) => (
                        <div key={pair.id} className="p-3 bg-blue-50 rounded-lg relative">
                          <Badge variant="secondary" className="mb-2">
                            Pareja {index + 1}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePair(pair.id)}
                            className="absolute top-2 right-2 h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                          <div className="text-sm">
                            <p>{pair.player1.name}</p>
                            <p>{pair.player2.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-6 text-center">
          <Button onClick={startTournament} disabled={!canStart()} size="lg" className="px-8">
            Crear Torneo
          </Button>
          {!canStart() && (
            <p className="text-sm text-red-500 mt-2">
              {mode === "6-loco"
                ? "Necesitas un múltiplo de 4 jugadores (mínimo 4)"
                : "Necesitas generar las parejas primero"}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
