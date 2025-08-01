"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, User } from "lucide-react"
import type { PlayerProfile, Player } from "@/app/page"

interface PlayerSelectorProps {
  playerProfiles: PlayerProfile[]
  category: string
  selectedPlayers: Player[]
  onAddPlayer: (player: Player) => void
  onAddManualPlayer: (name: string) => void
}

export default function PlayerSelector({
  playerProfiles,
  category,
  selectedPlayers,
  onAddPlayer,
  onAddManualPlayer,
}: PlayerSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [manualPlayerName, setManualPlayerName] = useState("")
  const [showManualInput, setShowManualInput] = useState(false)

  // Filter players by category and search term, exclude already selected players
  const availablePlayers = playerProfiles
    .filter((profile) => {
      const matchesCategory = !category || profile.category.toLowerCase() === category.toLowerCase()
      const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase())
      const notSelected = !selectedPlayers.some((p) => p.profileId === profile.id)
      return matchesCategory && matchesSearch && notSelected
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  const handleSelectPlayer = (profile: PlayerProfile) => {
    const player: Player = {
      id: Date.now().toString(),
      name: profile.name,
      points: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      profileId: profile.id,
    }
    onAddPlayer(player)
    setSearchTerm("")
  }

  const handleAddManualPlayer = () => {
    if (manualPlayerName.trim()) {
      onAddManualPlayer(manualPlayerName.trim())
      setManualPlayerName("")
      setShowManualInput(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="playerSearch">Buscar Jugadores del Catálogo</Label>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="playerSearch"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Buscar jugadores${category ? ` de ${category}` : ""}...`}
            className="pl-10"
          />
        </div>
        {category && (
          <p className="text-sm text-gray-500 mt-1">
            Mostrando solo jugadores de: <Badge variant="outline">{category}</Badge>
          </p>
        )}
      </div>

      {/* Available Players List */}
      {searchTerm && (
        <div className="max-h-40 overflow-y-auto border rounded-lg">
          {availablePlayers.length > 0 ? (
            availablePlayers.map((profile) => (
              <div
                key={profile.id}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex items-center justify-between"
                onClick={() => handleSelectPlayer(profile)}
              >
                <div>
                  <p className="font-medium">{profile.name}</p>
                  <div className="flex gap-2 text-xs text-gray-500">
                    <span>{profile.category}</span>
                    {profile.phone && <span>• {profile.phone}</span>}
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <Plus className="h-3 w-3 mr-1" />
                  Agregar
                </Button>
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-gray-500">
              <User className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No se encontraron jugadores</p>
              {category && <p className="text-xs">en la categoría {category}</p>}
            </div>
          )}
        </div>
      )}

      {/* Manual Player Input */}
      <div className="border-t pt-4">
        {!showManualInput ? (
          <Button variant="outline" onClick={() => setShowManualInput(true)} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Jugador Manual (No está en el catálogo)
          </Button>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="manualPlayer">Nombre del Jugador</Label>
            <div className="flex gap-2">
              <Input
                id="manualPlayer"
                value={manualPlayerName}
                onChange={(e) => setManualPlayerName(e.target.value)}
                placeholder="Nombre completo del jugador"
                onKeyPress={(e) => e.key === "Enter" && handleAddManualPlayer()}
              />
              <Button onClick={handleAddManualPlayer}>Agregar</Button>
              <Button variant="outline" onClick={() => setShowManualInput(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
