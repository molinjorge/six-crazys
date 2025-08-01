"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award } from "lucide-react"
import type { Player, Pair, TournamentMode } from "@/app/page"

interface LeaderboardProps {
  players: Player[]
  pairs?: Pair[]
  mode: TournamentMode
}

export default function Leaderboard({ players, pairs, mode }: LeaderboardProps) {
  const sortedPlayers = [...players].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.wins !== a.wins) return b.wins - a.wins
    return a.losses - b.losses
  })

  const sortedPairs = pairs
    ? [...pairs]
        .map((pair) => ({
          ...pair,
          totalPoints: pair.player1.points + pair.player2.points,
          totalWins: pair.player1.wins + pair.player2.wins,
          totalLosses: pair.player1.losses + pair.player2.losses,
        }))
        .sort((a, b) => {
          if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints
          if (b.totalWins !== a.totalWins) return b.totalWins - a.totalWins
          return a.totalLosses - b.totalLosses
        })
    : []

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold">{position}</span>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tabla de Posiciones - Jugadores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedPlayers.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  index < 3 ? "bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  {getPositionIcon(index + 1)}
                  <div>
                    <p className="font-semibold">{player.name}</p>
                    <div className="flex gap-2 text-xs text-gray-600">
                      <span>G: {player.wins}</span>
                      <span>E: {player.draws}</span>
                      <span>P: {player.losses}</span>
                    </div>
                  </div>
                </div>
                <Badge variant={index < 3 ? "default" : "secondary"} className="text-lg px-3 py-1">
                  {player.points} pts
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {mode === "fixed-pairs" && sortedPairs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tabla de Posiciones - Parejas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedPairs.map((pair, index) => (
                <div
                  key={pair.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    index < 3 ? "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {getPositionIcon(index + 1)}
                    <div>
                      <p className="font-semibold">
                        {pair.player1.name} & {pair.player2.name}
                      </p>
                      <div className="flex gap-2 text-xs text-gray-600">
                        <span>G: {pair.totalWins}</span>
                        <span>P: {pair.totalLosses}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={index < 3 ? "default" : "secondary"} className="text-lg px-3 py-1">
                    {pair.totalPoints} pts
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
