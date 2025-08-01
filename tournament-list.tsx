"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Users, Calendar, Trophy } from "lucide-react"
import type { Tournament } from "@/app/page"

interface TournamentListProps {
  tournaments: Tournament[]
  onSelectTournament: (tournament: Tournament) => void
  onBack: () => void
  onNewTournament: () => void
}

export default function TournamentList({
  tournaments,
  onSelectTournament,
  onBack,
  onNewTournament,
}: TournamentListProps) {
  const getStatusColor = (status: Tournament["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const getStatusText = (status: Tournament["status"]) => {
    switch (status) {
      case "active":
        return "Activo"
      case "completed":
        return "Completado"
      default:
        return "Configuración"
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Inicio
          </Button>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Torneos Activos</h1>
            <Button onClick={onNewTournament}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Torneo
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {tournaments.map((tournament) => (
            <Card
              key={tournament.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onSelectTournament(tournament)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    {tournament.name}
                  </CardTitle>
                  <Badge className={getStatusColor(tournament.status)}>{getStatusText(tournament.status)}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-semibold text-gray-700">Categoría</p>
                    <p className="text-gray-600">{tournament.category}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700">Modalidad</p>
                    <p className="text-gray-600">{tournament.mode === "6-loco" ? "6 LOCO" : "Parejas Fijas"}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold text-gray-700">{tournament.players.length} jugadores</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600 text-xs">{formatDate(tournament.createdAt)}</span>
                  </div>
                </div>

                {tournament.rounds.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-gray-600">
                      Ronda {tournament.currentRound + 1} • {tournament.courts} canchas •
                      {tournament.rounds.filter((r) => r.completed).length} rondas completadas
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {tournaments.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay torneos activos</h3>
              <p className="text-gray-600 mb-4">Crea tu primer torneo para comenzar</p>
              <Button onClick={onNewTournament}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Torneo
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
