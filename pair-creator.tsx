"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import type { Player } from "@/app/page"

interface PairCreatorProps {
  availablePlayers: Player[]
  onCreatePair: (player1Id: string, player2Id: string) => void
}

export default function PairCreator({ availablePlayers, onCreatePair }: PairCreatorProps) {
  const [selectedPlayer1, setSelectedPlayer1] = useState<string>("")
  const [selectedPlayer2, setSelectedPlayer2] = useState<string>("")

  const handleCreatePair = () => {
    if (selectedPlayer1 && selectedPlayer2 && selectedPlayer1 !== selectedPlayer2) {
      onCreatePair(selectedPlayer1, selectedPlayer2)
      setSelectedPlayer1("")
      setSelectedPlayer2("")
    }
  }

  const getPlayer2Options = () => {
    return availablePlayers.filter((player) => player.id !== selectedPlayer1)
  }

  if (availablePlayers.length < 2) {
    return (
      <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
        No hay suficientes jugadores disponibles para crear más parejas
      </div>
    )
  }

  return (
    <div className="space-y-3 p-3 bg-blue-50 rounded-lg">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Jugador 1</label>
          <Select value={selectedPlayer1} onValueChange={setSelectedPlayer1}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar jugador" />
            </SelectTrigger>
            <SelectContent>
              {availablePlayers.map((player) => (
                <SelectItem key={player.id} value={player.id}>
                  {player.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Jugador 2</label>
          <Select value={selectedPlayer2} onValueChange={setSelectedPlayer2}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar jugador" />
            </SelectTrigger>
            <SelectContent>
              {getPlayer2Options().map((player) => (
                <SelectItem key={player.id} value={player.id}>
                  {player.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={handleCreatePair}
        disabled={!selectedPlayer1 || !selectedPlayer2 || selectedPlayer1 === selectedPlayer2}
        className="w-full"
        size="sm"
      >
        <Plus className="h-4 w-4 mr-2" />
        Crear Pareja
      </Button>
    </div>
  )
}
