"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Trash2, Search, Phone, Mail, User, Edit } from "lucide-react"
import type { PlayerProfile } from "@/app/page"

interface PlayerCatalogProps {
  playerProfiles: PlayerProfile[]
  onUpdateProfiles: (profiles: PlayerProfile[]) => void
  onBack: () => void
}

export default function PlayerCatalog({ playerProfiles, onUpdateProfiles, onBack }: PlayerCatalogProps) {
  const [isAddingPlayer, setIsAddingPlayer] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<PlayerProfile | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    phone: "",
    email: "",
    idNumber: "",
    category: "",
  })

  const [validationErrors, setValidationErrors] = useState({
    email: false,
  })

  const validateEmail = (email: string): boolean => {
    if (!email || email.trim() === "") return true // Email es opcional
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email.trim())
  }

  const categories = [...new Set(playerProfiles.map((p) => p.category))].filter(Boolean).sort()

  const filteredPlayers = playerProfiles
    .filter((player) => {
      const matchesSearch =
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.phone.includes(searchTerm) ||
        player.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.idNumber.includes(searchTerm)
      const matchesCategory = !filterCategory || player.category === filterCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  const handleAddPlayer = () => {
    const emailValid = newPlayer.email.trim() === "" || validateEmail(newPlayer.email)

    setValidationErrors({
      email: !emailValid,
    })

    if (newPlayer.name.trim() && newPlayer.category.trim() && emailValid) {
      const playerProfile: PlayerProfile = {
        id: Date.now().toString(),
        name: newPlayer.name.trim(),
        phone: newPlayer.phone.trim(),
        email: newPlayer.email.trim(),
        idNumber: newPlayer.idNumber.trim(),
        category: newPlayer.category.trim(),
        createdAt: new Date(),
      }

      onUpdateProfiles([...playerProfiles, playerProfile])
      setNewPlayer({ name: "", phone: "", email: "", idNumber: "", category: "" })
      setValidationErrors({ email: false })
      setIsAddingPlayer(false)
    }
  }

  const handleEditPlayer = (player: PlayerProfile) => {
    setEditingPlayer(player)
    setNewPlayer({
      name: player.name,
      phone: player.phone,
      email: player.email,
      idNumber: player.idNumber,
      category: player.category,
    })
  }

  const handleUpdatePlayer = () => {
    const emailValid = newPlayer.email.trim() === "" || validateEmail(newPlayer.email)

    setValidationErrors({
      email: !emailValid,
    })

    if (editingPlayer && newPlayer.name.trim() && newPlayer.category.trim() && emailValid) {
      const updatedPlayer: PlayerProfile = {
        ...editingPlayer,
        name: newPlayer.name.trim(),
        phone: newPlayer.phone.trim(),
        email: newPlayer.email.trim(),
        idNumber: newPlayer.idNumber.trim(),
        category: newPlayer.category.trim(),
      }

      onUpdateProfiles(playerProfiles.map((p) => (p.id === editingPlayer.id ? updatedPlayer : p)))
      setEditingPlayer(null)
      setValidationErrors({ email: false })
      setNewPlayer({ name: "", phone: "", email: "", idNumber: "", category: "" })
    }
  }

  const handleDeletePlayer = (playerId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este jugador?")) {
      onUpdateProfiles(playerProfiles.filter((p) => p.id !== playerId))
    }
  }

  const handleCancelEdit = () => {
    setIsAddingPlayer(false)
    setEditingPlayer(null)
    setValidationErrors({ email: false })
    setNewPlayer({ name: "", phone: "", email: "", idNumber: "", category: "" })
  }

  const openWhatsApp = (phone: string, name: string) => {
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, "")
      const message = encodeURIComponent(`Hola ${name}, te contacto desde SIX-CRAZYS para el torneo de padel.`)
      window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank")
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Catálogo de Jugadores</h1>
            <Button onClick={() => setIsAddingPlayer(true)} disabled={isAddingPlayer || editingPlayer}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Jugador
            </Button>
          </div>
        </div>

        {/* Add/Edit Player Form */}
        {(isAddingPlayer || editingPlayer) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingPlayer ? "Editar Jugador" : "Agregar Nuevo Jugador"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="playerName">Nombre Completo *</Label>
                  <Input
                    id="playerName"
                    value={newPlayer.name}
                    onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                    placeholder="Nombre completo del jugador"
                  />
                </div>
                <div>
                  <Label htmlFor="playerCategory">Categoría *</Label>
                  <Input
                    id="playerCategory"
                    value={newPlayer.category}
                    onChange={(e) => setNewPlayer({ ...newPlayer, category: e.target.value })}
                    placeholder="Ej: Categoría 4, Categoría 3, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="playerPhone">Teléfono (WhatsApp)</Label>
                  <Input
                    id="playerPhone"
                    value={newPlayer.phone}
                    onChange={(e) => setNewPlayer({ ...newPlayer, phone: e.target.value })}
                    placeholder="+1234567890"
                  />
                </div>
                <div>
                  <Label htmlFor="playerEmail">Correo Electrónico</Label>
                  <Input
                    id="playerEmail"
                    type="email"
                    value={newPlayer.email}
                    onChange={(e) => {
                      const emailValue = e.target.value
                      setNewPlayer({ ...newPlayer, email: emailValue })
                      // Validar inmediatamente si hay contenido
                      if (emailValue.trim() !== "") {
                        setValidationErrors({ ...validationErrors, email: !validateEmail(emailValue) })
                      } else {
                        setValidationErrors({ ...validationErrors, email: false })
                      }
                    }}
                    placeholder="jugador@email.com"
                    className={validationErrors.email ? "border-red-500" : ""}
                  />
                  {validationErrors.email && (
                    <p className="text-sm text-red-500 mt-1">Por favor ingresa un correo electrónico válido</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="playerIdNumber">Número de ID</Label>
                  <Input
                    id="playerIdNumber"
                    value={newPlayer.idNumber}
                    onChange={(e) => setNewPlayer({ ...newPlayer, idNumber: e.target.value })}
                    placeholder="Cédula, DNI, etc."
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={editingPlayer ? handleUpdatePlayer : handleAddPlayer}>
                  {editingPlayer ? "Actualizar" : "Agregar"} Jugador
                </Button>
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="search">Buscar Jugadores</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre, teléfono, email o ID..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="categoryFilter">Filtrar por Categoría</Label>
                <select
                  id="categoryFilter"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Todas las categorías</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Players List */}
        <div className="grid gap-4">
          {filteredPlayers.map((player) => (
            <Card key={player.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{player.name}</h3>
                        <Badge variant="secondary">{player.category}</Badge>
                      </div>
                      <div className="grid md:grid-cols-3 gap-2 text-sm text-gray-600">
                        {player.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{player.phone}</span>
                          </div>
                        )}
                        {player.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            <span>{player.email}</span>
                          </div>
                        )}
                        {player.idNumber && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>ID: {player.idNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {player.phone && (
                      <Button size="sm" variant="outline" onClick={() => openWhatsApp(player.phone, player.name)}>
                        <Phone className="h-3 w-3 mr-1" />
                        WhatsApp
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditPlayer(player)}
                      disabled={isAddingPlayer || editingPlayer}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeletePlayer(player.id)}
                      disabled={isAddingPlayer || editingPlayer}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPlayers.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || filterCategory ? "No se encontraron jugadores" : "No hay jugadores registrados"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterCategory
                  ? "Intenta con otros términos de búsqueda"
                  : "Agrega tu primer jugador para comenzar"}
              </p>
              {!searchTerm && !filterCategory && (
                <Button onClick={() => setIsAddingPlayer(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Primer Jugador
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          Total: {filteredPlayers.length} jugador{filteredPlayers.length !== 1 ? "es" : ""}
          {filterCategory && ` en ${filterCategory}`}
        </div>
      </div>
    </div>
  )
}
