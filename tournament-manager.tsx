"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Trophy, Target } from "lucide-react"
import type { Tournament, Round, Match, Pair, Player } from "@/app/page"
import MatchCard from "@/components/match-card"
import Leaderboard from "@/components/leaderboard"

interface TournamentManagerProps {
  tournament: Tournament
  setTournament: (tournament: Tournament) => void
  onBack: () => void
}

export default function TournamentManager({ tournament, setTournament, onBack }: TournamentManagerProps) {
  const [activeTab, setActiveTab] = useState<"matches" | "leaderboard">("matches")

  const generateRandomPairs = (players: Player[]): Pair[] => {
    const shuffled = [...players].sort(() => Math.random() - 0.5)
    const pairs: Pair[] = []

    for (let i = 0; i < shuffled.length; i += 2) {
      pairs.push({
        id: `pair-${Date.now()}-${i}`,
        player1: shuffled[i],
        player2: shuffled[i + 1],
        points: 0,
      })
    }

    return pairs
  }

  const hasPlayedTogether = (p1: Player, p2: Player, rounds: Round[]): boolean => {
    return rounds.some((round) =>
      round.matches.some(
        (match) =>
          (match.pair1.player1.id === p1.id && match.pair1.player2.id === p2.id) ||
          (match.pair1.player1.id === p2.id && match.pair1.player2.id === p1.id) ||
          (match.pair2.player1.id === p1.id && match.pair2.player2.id === p2.id) ||
          (match.pair2.player1.id === p2.id && match.pair2.player2.id === p1.id),
      ),
    )
  }

  const havePlayedAgainst = (pair1: Pair, pair2: Pair, rounds: Round[]): boolean => {
    return rounds.some((round) =>
      round.matches.some(
        (match) =>
          (match.pair1.id === pair1.id && match.pair2.id === pair2.id) ||
          (match.pair1.id === pair2.id && match.pair2.id === pair1.id),
      ),
    )
  }

  const generateMatches = (): Match[] => {
    const matches: Match[] = []

    if (tournament.mode === "6-loco") {
      // Generate random pairs avoiding previous combinations
      let attempts = 0
      let validPairs: Pair[] = []

      while (attempts < 100 && validPairs.length < tournament.players.length / 2) {
        const candidatePairs = generateRandomPairs(tournament.players)
        let isValid = true

        // Check if any pair has played together before
        for (const pair of candidatePairs) {
          if (hasPlayedTogether(pair.player1, pair.player2, tournament.rounds)) {
            isValid = false
            break
          }
        }

        if (isValid) {
          validPairs = candidatePairs
          break
        }
        attempts++
      }

      if (validPairs.length === 0) {
        validPairs = generateRandomPairs(tournament.players)
      }

      // Create matches
      for (let i = 0; i < validPairs.length; i += 2) {
        if (i + 1 < validPairs.length) {
          matches.push({
            id: `match-${Date.now()}-${i}`,
            court: Math.floor(i / 2) + 1,
            pair1: validPairs[i],
            pair2: validPairs[i + 1],
            completed: false,
          })
        }
      }
    } else {
      // Fixed pairs mode
      const availablePairs = [...(tournament.pairs || [])]

      // First, try to create matches without repetitions
      const matches: Match[] = []
      const usedPairs: Pair[] = []

      while (availablePairs.length >= 2) {
        const pair1 = availablePairs.shift()!
        let pair2: Pair | undefined

        // Find a pair that hasn't played against pair1
        const validOpponents = availablePairs.filter((p) => !havePlayedAgainst(pair1, p, tournament.rounds))

        if (validOpponents.length > 0) {
          pair2 = validOpponents[Math.floor(Math.random() * validOpponents.length)]
          availablePairs.splice(availablePairs.indexOf(pair2), 1)
        } else if (availablePairs.length > 0) {
          pair2 = availablePairs.shift()!
        }

        if (pair2) {
          matches.push({
            id: `match-${Date.now()}-${matches.length}`,
            court: matches.length + 1,
            pair1,
            pair2,
            completed: false,
          })
        }
      }

      // If we couldn't create enough matches (some pairs left without opponents)
      // and we have previous rounds, repeat matches in chronological order
      if (matches.length < (tournament.pairs?.length || 0) / 2 && tournament.rounds.length > 0) {
        // Calculate which round to repeat based on current round number
        const roundsCompleted = tournament.rounds.filter((r) => r.completed).length
        const roundToRepeat = tournament.rounds[roundsCompleted % tournament.rounds.length]

        // Clear current matches and use the pattern from the round to repeat
        matches.length = 0

        roundToRepeat.matches.forEach((originalMatch, index) => {
          matches.push({
            id: `match-${Date.now()}-${index}`,
            court: index + 1,
            pair1: originalMatch.pair1,
            pair2: originalMatch.pair2,
            completed: false,
          })
        })
      }
    }

    return matches
  }

  const startNewRound = () => {
    const matches = generateMatches()
    const newRound: Round = {
      id: `round-${tournament.rounds.length + 1}`,
      number: tournament.rounds.length + 1,
      matches,
      completed: false,
    }

    setTournament({
      ...tournament,
      rounds: [...tournament.rounds, newRound],
      currentRound: tournament.rounds.length,
    })
  }

  const updateMatch = (
    matchId: string,
    result: "pair1" | "pair2" | "draw",
    score?: { pair1Games: number; pair2Games: number },
  ) => {
    const updatedRounds = tournament.rounds.map((round) => {
      if (round.number === tournament.currentRound + 1) {
        const updatedMatches = round.matches.map((match) => {
          if (match.id === matchId) {
            return { ...match, result, completed: true, score }
          }
          return match
        })

        const allCompleted = updatedMatches.every((match) => match.completed)
        return { ...round, matches: updatedMatches, completed: allCompleted }
      }
      return round
    })

    // Update player points
    const updatedPlayers = tournament.players.map((player) => {
      let newPoints = 0
      let newWins = 0
      let newDraws = 0
      let newLosses = 0

      updatedRounds.forEach((round) => {
        round.matches.forEach((match) => {
          if (match.completed && match.result) {
            const isInPair1 = match.pair1.player1.id === player.id || match.pair1.player2.id === player.id
            const isInPair2 = match.pair2.player1.id === player.id || match.pair2.player2.id === player.id

            if (isInPair1 || isInPair2) {
              if (match.result === "draw") {
                newPoints += 1 // 1 punto por empate
                newDraws += 1
              } else if ((match.result === "pair1" && isInPair1) || (match.result === "pair2" && isInPair2)) {
                newPoints += 2 // 2 puntos por victoria (por jugador)
                newWins += 1
              } else {
                newLosses += 1 // 0 puntos por derrota
              }
            }
          }
        })
      })

      return { ...player, points: newPoints, wins: newWins, draws: newDraws, losses: newLosses }
    })

    setTournament({
      ...tournament,
      rounds: updatedRounds,
      players: updatedPlayers,
    })
  }

  const getCurrentRound = () => {
    return tournament.rounds[tournament.currentRound]
  }

  const canStartNewRound = () => {
    const currentRound = getCurrentRound()
    return !currentRound || currentRound.completed
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Inicio
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                SIX-CRAZYS - {tournament.mode === "6-loco" ? "6 LOCO" : "Parejas Fijas"}
              </h1>
              <p className="text-gray-600">
                Ronda {tournament.currentRound + 1} • {tournament.players.length} jugadores • {tournament.courts}{" "}
                canchas
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant={activeTab === "matches" ? "default" : "outline"} onClick={() => setActiveTab("matches")}>
                <Target className="h-4 w-4 mr-2" />
                Partidos
              </Button>
              <Button
                variant={activeTab === "leaderboard" ? "default" : "outline"}
                onClick={() => setActiveTab("leaderboard")}
              >
                <Trophy className="h-4 w-4 mr-2" />
                Posiciones
              </Button>
            </div>
          </div>
        </div>

        {activeTab === "matches" && (
          <div className="space-y-6">
            {canStartNewRound() && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Button onClick={startNewRound} size="lg">
                      {tournament.rounds.length === 0 ? "Iniciar Primera Ronda" : "Iniciar Nueva Ronda"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {getCurrentRound() && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Ronda {getCurrentRound().number}</span>
                    <Badge variant={getCurrentRound().completed ? "default" : "secondary"}>
                      {getCurrentRound().completed ? "Completada" : "En Progreso"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {getCurrentRound().matches.map((match) => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        onUpdateResult={(result, score) => updateMatch(match.id, result, score)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "leaderboard" && (
          <Leaderboard players={tournament.players} pairs={tournament.pairs} mode={tournament.mode} />
        )}
      </div>
    </div>
  )
}
