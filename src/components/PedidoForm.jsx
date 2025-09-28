import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { X, Save, Plus } from 'lucide-react'

export function PedidoForm({ pedido, onSave, onCancel, isOpen }) {
  const [formData, setFormData] = useState({
    boleira: '',
    data_pedido: '',
    tema: '',
    aro: '',
    tipo: '',
    valor: '',
    data_entrega: '',
    data_pagamento: '',
    aniversariante: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (pedido) {
      setFormData({
        boleira: pedido.boleira || '',
        data_pedido: pedido.data_pedido || '',
        tema: pedido.tema || '',
        aro: pedido.aro || '',
        tipo: pedido.tipo || '',
        valor: pedido.valor || '',
        data_entrega: pedido.data_entrega || '',
        data_pagamento: pedido.data_pagamento || '',
        aniversariante: pedido.aniversariante || ''
      })
    } else {
      setFormData({
        boleira: '',
        data_pedido: '',
        tema: '',
        aro: '',
        tipo: '',
        valor: '',
        data_entrega: '',
        data_pagamento: '',
        aniversariante: ''
      })
    }
  }, [pedido])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validações básicas
      if (!formData.boleira || !formData.data_pedido || !formData.valor) {
        alert('Por favor, preencha os campos obrigatórios: Boleira, Data do Pedido e Valor')
        return
      }

      await onSave(formData)
    } catch (error) {
      console.error('Erro ao salvar pedido:', error)
      alert('Erro ao salvar pedido. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {pedido ? 'Editar Pedido' : 'Novo Pedido'}
              {pedido ? <Save className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </CardTitle>
            <CardDescription>
              {pedido ? 'Edite as informações do pedido' : 'Adicione um novo pedido ao sistema'}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="boleira">Boleira *</Label>
                <Input
                  id="boleira"
                  value={formData.boleira}
                  onChange={(e) => handleInputChange('boleira', e.target.value)}
                  placeholder="Nome da boleira"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_pedido">Data do Pedido *</Label>
                <Input
                  id="data_pedido"
                  type="date"
                  value={formData.data_pedido}
                  onChange={(e) => handleInputChange('data_pedido', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tema">Tema</Label>
                <Input
                  id="tema"
                  value={formData.tema}
                  onChange={(e) => handleInputChange('tema', e.target.value)}
                  placeholder="Tema do bolo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aniversariante">Aniversariante</Label>
                <Input
                  id="aniversariante"
                  value={formData.aniversariante}
                  onChange={(e) => handleInputChange('aniversariante', e.target.value)}
                  placeholder="Nome do aniversariante"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select value={formData.tipo} onValueChange={(value) => handleInputChange('tipo', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3D">3D</SelectItem>
                    <SelectItem value="Simples">Simples</SelectItem>
                    <SelectItem value="Adesivo">Adesivo</SelectItem>
                    <SelectItem value="Papel">Papel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aro">Aro (cm)</Label>
                <Input
                  id="aro"
                  value={formData.aro}
                  onChange={(e) => handleInputChange('aro', e.target.value)}
                  placeholder="Tamanho do aro"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor">Valor *</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor}
                  onChange={(e) => handleInputChange('valor', parseFloat(e.target.value) || '')}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_entrega">Data de Entrega</Label>
                <Input
                  id="data_entrega"
                  type="date"
                  value={formData.data_entrega}
                  onChange={(e) => handleInputChange('data_entrega', e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="data_pagamento">Data de Pagamento</Label>
                <Input
                  id="data_pagamento"
                  type="date"
                  value={formData.data_pagamento}
                  onChange={(e) => handleInputChange('data_pagamento', e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Deixe em branco se ainda não foi pago
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : (pedido ? 'Atualizar' : 'Criar')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

