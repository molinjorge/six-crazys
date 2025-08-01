"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Trophy, Users, Minus, Edit, Check, X } from "lucide-react"
import type { Match } from "@/app/page"

interface MatchCardProps {
  match: Match
  onUpdateResult: (result: "pair1" | "pair2" | "draw", score?: { pair1Games: number; pair2Games: number }) => void
}

export default function MatchCard({ match, onUpdateResult }: MatchCardProps) {
  const [pair1Games, setPair1Games] = useState<number>(0)
  const [showScoreInput, setShowScoreInput] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const pair2Games = 7 - pair1Games

  const handleScoreChange = (games: number) => {
    if (games >= 0 && games <= 7) {
      setPair1Games(games)
    }
  }

  const handleResultWithScore = (result: "pair1" | "pair2" | "draw") => {
    let finalScore: { pair1Games: number; pair2Games: number }

    if (result === "draw") {
      finalScore = {
        pair1Games: 3,
        pair2Games: 4,
      }
    } else {
      finalScore = {
        pair1Games: pair1Games,
        pair2Games: 7 - pair1Games,
      }
    }

    onUpdateResult(result, finalScore)
    setShowScoreInput(false)
    setIsEditing(false)
    setPair1Games(0)
  }

  const getWinnerFromScore = () => {
    if (pair1Games > pair2Games) return "pair1"
    if (pair2Games > pair1Games) return "pair2"
    return "draw"
  }

  const startEditing = () => {
    if (match.score) {
      setPair1Games(match.score.pair1Games)
    } else {
      setPair1Games(0)
    }
    setIsEditing(true)
    setShowScoreInput(true)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setShowScoreInput(false)
    setPair1Games(0)
  }

  return (
    <Card className={`${match.completed ? "bg-green-50 border-green-200" : "bg-white"}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="outline">Cancha {match.court}</Badge>
          <div className="flex gap-2">
            {match.completed && (
              <Badge variant="default">
                <Trophy className="h-3 w-3 mr-1" />
                Completado
              </Badge>
            )}
            {match.completed && !isEditing && (
              <Button size="sm" variant="ghost" onClick={startEditing} className="h-6 px-2">
                <Edit className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 items-center">
          {/* Pareja 1 */}
          <div
            className={`text-center p-3 rounded-lg ${
              match.result === "pair1" ? "bg-green-100 border-2 border-green-300" : "bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center mb-2">
              <Users className="h-4 w-4 mr-1" />
              <span className="font-semibold">Pareja 1</span>
            </div>
            <div className="text-sm space-y-1 mb-2">
              <p className="font-medium">{match.pair1.player1.name}</p>
              <p className="font-medium">{match.pair1.player2.name}</p>
            </div>
            {/* Mostrar marcador si está completado */}
            {match.completed && match.score && !isEditing && (
              <div className="text-lg font-bold text-blue-600">{match.score.pair1Games}</div>
            )}
          </div>

          {/* VS y controles */}
          <div className="text-center">
            <div className="text-lg font-bold text-gray-500 mb-3">VS</div>

            {/* Marcador durante el juego o edición */}
            {showScoreInput && (
              <div className="space-y-3 mb-3">
                <div className="text-sm text-gray-600">{isEditing ? "Editar Marcador" : "Marcador"}</div>
                <div className="flex items-center justify-center gap-2">
                  <div className="text-center">
                    <Input
                      type="number"
                      min="0"
                      max="7"
                      value={pair1Games}
                      onChange={(e) => handleScoreChange(Number(e.target.value) || 0)}
                      className="w-12 h-8 text-center text-sm"
                    />
                    <div className="text-xs text-gray-500 mt-1">P1</div>
                  </div>
                  <div className="text-lg font-bold">-</div>
                  <div className="text-center">
                    <div className="w-12 h-8 flex items-center justify-center border rounded text-sm bg-gray-50">
                      {pair2Games}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">P2</div>
                  </div>
                </div>
                <div className="text-xs text-gray-400">Total: {pair1Games + pair2Games}/7 games</div>
              </div>
            )}

            {/* Controles para partido no completado */}
            {!match.completed && !showScoreInput && (
              <div className="space-y-2">
                <Button size="sm" onClick={() => setShowScoreInput(true)} variant="outline" className="w-full">
                  Ingresar Marcador
                </Button>
                <div className="text-xs text-gray-400">o resultado rápido:</div>
                <Button size="sm" onClick={() => onUpdateResult("pair1")} className="w-full">
                  Gana P1
                </Button>
                <Button size="sm" variant="outline" onClick={() => onUpdateResult("draw")} className="w-full">
                  <Minus className="h-3 w-3 mr-1" />
                  Empate
                </Button>
                <Button size="sm" onClick={() => onUpdateResult("pair2")} className="w-full">
                  Gana P2
                </Button>
              </div>
            )}

            {/* Controles para ingresar/editar marcador */}
            {showScoreInput && (
              <div className="space-y-2">
                <Button
                  size="sm"
                  onClick={() => handleResultWithScore(getWinnerFromScore())}
                  className="w-full"
                  disabled={pair1Games + pair2Games !== 7}
                >
                  <Check className="h-3 w-3 mr-1" />
                  {isEditing ? "Actualizar" : "Confirmar"} {pair1Games}-{pair2Games}
                </Button>
                <Button size="sm" variant="outline" onClick={cancelEdit} className="w-full bg-transparent">
                  <X className="h-3 w-3 mr-1" />
                  Cancelar
                </Button>
              </div>
            )}

            {/* Resultado del partido completado */}
            {match.completed && !isEditing && (
              <div className="space-y-2">
                <div className="text-sm font-medium">
                  {match.result === "pair1" && "Ganó Pareja 1"}
                  {match.result === "pair2" && "Ganó Pareja 2"}
                  {match.result === "draw" && "Empate"}
                </div>
                {match.score && (
                  <div className="text-lg font-bold text-blue-600">
                    {match.score.pair1Games} - {match.score.pair2Games}
                  </div>
                )}
                <div className="text-xs text-gray-400 mt-2">
                  <Edit className="h-3 w-3 inline mr-1" />
                  Clic en editar para corregir
                </div>
              </div>
            )}
          </div>

          {/* Pareja 2 */}
          <div
            className={`text-center p-3 rounded-lg ${
              match.result === "pair2" ? "bg-green-100 border-2 border-green-300" : "bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center mb-2">
              <Users className="h-4 w-4 mr-1" />
              <span className="font-semibold">Pareja 2</span>
            </div>
            <div className="text-sm space-y-1 mb-2">
              <p className="font-medium">{match.pair2.player1.name}</p>
              <p className="font-medium">{match.pair2.player2.name}</p>
            </div>
            {/* Mostrar marcador si está completado */}
            {match.completed && match.score && !isEditing && (
              <div className="text-lg font-bold text-blue-600">{match.score.pair2Games}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
