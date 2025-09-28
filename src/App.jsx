import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Calendar, Package, TrendingUp, Clock, Plus, Edit, Trash2, Heart, Check } from 'lucide-react'
import { Calendar as CalendarComponent } from './components/Calendar.jsx'
import { RevenueChart, StatusChart, BoleiraChart, TypeChart, OrdersOverTimeChart, BoleiraRevenueChart, BoleiraComparisonChart } from './components/Charts.jsx'
import { PedidoForm } from './components/PedidoForm.jsx'
import { apiService } from './services/api.js'
import './App.css'

// Função para formatar a data, lidando com datas inválidas ou nulas
const formatDate = (dateInput) => {
    if (!dateInput) return 'N/A';
    
    // Converte a entrada para objeto Date. O GAS deve enviar em formato ISO (YYYY-MM-DD)
    const date = new Date(dateInput);
    
    // Verifica se a data é inválida
    if (isNaN(date.getTime())) {
        return 'N/A';
    }

    // Formata para DD/MM/AAAA
    return date.toLocaleDateString('pt-BR');
}

function App() {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [stats, setStats] = useState({
    total_pedidos: 0,
    pedidos_pagos: 0,
    pedidos_pendentes: 0,
    faturamento_total: 0
  })
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPedido, setEditingPedido] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (statusFilter === 'Todos') {
      setFilteredOrders(orders)
    } else {
      setFilteredOrders(orders.filter(order => order.Status === statusFilter))
    }
  }, [statusFilter, orders])

  const loadData = async () => {
    try {
      setLoading(true)
      const [pedidosResponse, statsResponse] = await Promise.all([
        apiService.getPedidos(),
        apiService.getStats()
      ])

      const pedidosData = pedidosResponse.data || pedidosResponse;
      const statsData = statsResponse.data || statsResponse;

      if (pedidosData) {
        const processedOrders = pedidosData.map(order => ({
          ...order,
          // Garante que as propriedades de data sejam objetos Date ou null
          'Data pedido': new Date(order.data_pedido),
          'Data entrega': order.data_entrega ? new Date(order.data_entrega) : null,
          'Data pagamento': order.data_pagamento ? new Date(order.data_pagamento) : null,
          'Boleira': order.boleira,
          'Tema': order.tema,
          'Aro': order.aro,
          'Tipo': order.tipo,
          'Valor': parseFloat(order.valor), 
          'Aniversariante': order.aniversariante,
          'Status': order.status // O status vem calculado do GAS
        }))
        setOrders(processedOrders)
        setFilteredOrders(processedOrders)
      }

      if (statsData) {
        setStats(statsData)
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSavePedido = async (pedidoData) => {
    try {
      if (editingPedido) {
        await apiService.updatePedido(editingPedido.id, pedidoData)
      } else {
        await apiService.createPedido(pedidoData)
      }
      
      await loadData()
      setShowForm(false)
      setEditingPedido(null)
    } catch (error) {
      console.error('Erro ao salvar pedido:', error)
      alert(`Erro ao salvar pedido: ${error.message || 'Verifique o console.'}`) 
      throw error
    }
  }

  const handleMarkAsPaid = async (pedido) => {
    if (!window.confirm(`Marcar o pedido "${pedido.Tema || 'Sem tema'}" como PAGO na data de hoje (${formatDate(new Date())})?`)) {
        return;
    }
    
    // Obtém a data atual no formato YYYY-MM-DD, que o GAS espera.
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const currentDateISO = `${year}-${month}-${day}`;

    // O payload deve conter a chave que o GAS usa: data_pagamento
    const updatePayload = {
        data_pagamento: currentDateISO,
        // O GAS cuidará do campo 'Status'
    };

    try {
        setLoading(true);
        const result = await apiService.updatePedido(pedido.id, updatePayload);
        
        if (result.success) {
            await loadData(); // Recarrega os dados para atualizar os cards e a lista
        } else {
            alert("Erro ao marcar pedido como PAGO: " + (result.error || 'Tente novamente.'));
        }
    } catch (error) {
        console.error('Erro ao marcar como pago:', error);
        alert('Erro ao processar pagamento. Verifique o console.');
    } finally {
        setLoading(false);
    }
  };

  const handleEditPedido = (pedido) => {
    setEditingPedido({
      ...pedido,
      data_pedido: pedido.data_pedido,
      data_entrega: pedido.data_entrega,
      data_pagamento: pedido.data_pagamento
    })
    setShowForm(true)
  }

  const handleDeletePedido = async (pedido) => {
    if (window.confirm(`Tem certeza que deseja deletar o pedido "${pedido.Tema || 'Sem tema'}"?`)) {
      try {
        await apiService.deletePedido(pedido.id)
        await loadData()
      } catch (error) {
        console.error('Erro ao deletar pedido:', error)
        alert('Erro ao deletar pedido. Tente novamente.')
      }
    }
  }

  // Renomeado formatDisplayDate para formatCurrency para evitar confusão de nomes
  const formatCurrency = (value) => {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numericValue)) return 'R$ 0,00';
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numericValue)
  }

  if (loading) {
    return (
      <div className="min-h-screen brand-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen brand-gradient p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg">
              <Heart className="h-8 w-8 accent-pink fill-current" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 logo-style">
                Personalizados da Rô
              </h1>
              <p className="text-gray-600 italic">
                Peças feitas com carinho, do seu jeito.
              </p>
            </div>
          </div>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-accent-pink/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold accent-pink">{stats.total_pedidos}</div>
            </CardContent>
          </Card>

          <Card className="border-accent-pink/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Pagos</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.pedidos_pagos}</div>
            </CardContent>
          </Card>

          <Card className="border-accent-pink/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pedidos_pendentes}</div>
            </CardContent>
          </Card>

          <Card className="border-accent-pink/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
              <TrendingUp className="h-4 w-4 accent-pink" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold accent-pink">{formatCurrency(stats.faturamento_total)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs para diferentes seções */}
        <Tabs defaultValue="pedidos" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
            <TabsTrigger value="calendario">Calendário</TabsTrigger>
            <TabsTrigger value="graficos">Gráficos</TabsTrigger>
          </TabsList>

          <TabsContent value="pedidos" className="space-y-4">
            {/* Filtros e botão de adicionar */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {['Todos', 'Pago', 'Pendente'].map(status => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    onClick={() => setStatusFilter(status)}
                    className={statusFilter === status ? 'bg-accent-pink hover:bg-accent-pink/90' : ''}
                  >
                    {status}
                  </Button>
                ))}
              </div>
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-accent-pink hover:bg-accent-pink/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Pedido
              </Button>
            </div>

            {/* Lista de pedidos */}
            <Card className="border-accent-pink/20">
              <CardHeader>
                <CardTitle>Lista de Pedidos</CardTitle>
                <CardDescription>
                  {filteredOrders.length} pedidos encontrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredOrders.slice(0, 20).map((order, index) => (
                    <div key={order.id || index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{order.Tema || 'Sem tema'}</h3>
                          <Badge variant={order.Status === 'Pago' ? 'default' : 'secondary'}>
                            {order.Status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Boleira: {order.Boleira}</p>
                          <p>Aniversariante: {order.Aniversariante || 'N/A'}</p>
                          <p>Tipo: {order.Tipo} | Aro: {order.Aro}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold accent-pink">
                          {formatCurrency(order.Valor || 0)}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {/* USO DO NOVO FORMATADOR DE DATA */}
                          <p>Pedido: {formatDate(order['Data pedido'])}</p>
                          <p>Entrega: {formatDate(order['Data entrega'])}</p>
                          {order['Data pagamento'] && (
                            <p>Pagamento: {formatDate(order['Data pagamento'])}</p>
                          )}
                        </div>
                        <div className="flex gap-2 justify-end">
                            {/* BOTÃO MARCAR COMO PAGO - Aparece apenas para pedidos Pendentes */}
                            {order.Status === 'Pendente' && (
                                <Button
                                    size="sm"
                                    onClick={() => handleMarkAsPaid(order)}
                                    className="bg-green-500 hover:bg-green-600 text-white"
                                >
                                    <Check className="h-3 w-3 mr-1" /> Pago
                                </Button>
                            )}

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditPedido(order)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeletePedido(order)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendario">
            <CalendarComponent orders={orders} />
          </TabsContent>

          <TabsContent value="graficos" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueChart orders={orders} />
              <StatusChart orders={orders} />
              <BoleiraChart orders={orders} />
              <BoleiraRevenueChart orders={orders} />
              <TypeChart orders={orders} />
              <BoleiraComparisonChart orders={orders} />
            </div>
            <OrdersOverTimeChart orders={orders} />
          </TabsContent>
        </Tabs>

        {/* Modal do formulário */}
        <PedidoForm
          pedido={editingPedido}
          onSave={handleSavePedido}
          onCancel={() => {
            setShowForm(false)
            setEditingPedido(null)
          }}
          isOpen={showForm}
        />
      </div>
    </div>
  )
}

export default App
