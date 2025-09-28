import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'

const COLORS = ['#F472B6', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16']

export function RevenueChart({ orders }) {
  // Agrupar faturamento por mês
  const monthlyRevenue = orders
    .filter(order => order.Status === 'Pago' && order['Data pagamento'])
    .reduce((acc, order) => {
      const month = order['Data pagamento'].toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: 'short' 
      })
      acc[month] = (acc[month] || 0) + (order.Valor || 0)
      return acc
    }, {})

  const revenueData = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
    month,
    revenue
  })).slice(-12) // Últimos 12 meses

  return (
    <Card className="border-accent-pink/20">
      <CardHeader>
        <CardTitle className="accent-pink">Faturamento Mensal</CardTitle>
        <CardDescription>Receita dos pedidos pagos por mês</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Faturamento']} />
            <Legend />
            <Bar dataKey="revenue" fill="#F472B6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function StatusChart({ orders }) {
  const statusData = [
    {
      name: 'Pagos',
      value: orders.filter(order => order.Status === 'Pago').length,
      color: '#10B981'
    },
    {
      name: 'Pendentes',
      value: orders.filter(order => order.Status === 'Pendente').length,
      color: '#F59E0B'
    }
  ]

  return (
    <Card className="border-accent-pink/20">
      <CardHeader>
        <CardTitle className="accent-pink">Status dos Pedidos</CardTitle>
        <CardDescription>Distribuição entre pedidos pagos e pendentes</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function BoleiraChart({ orders }) {
  // Agrupar pedidos por boleira
  const boleiraData = orders.reduce((acc, order) => {
    const boleira = order.Boleira || 'Sem boleira'
    acc[boleira] = (acc[boleira] || 0) + 1
    return acc
  }, {})

  const chartData = Object.entries(boleiraData)
    .map(([boleira, count]) => ({ boleira, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10) // Top 10 boleiras

  return (
    <Card className="border-accent-pink/20">
      <CardHeader>
        <CardTitle className="accent-pink">Pedidos por Boleira</CardTitle>
        <CardDescription>Top 10 boleiras com mais pedidos</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="boleira" type="category" width={80} />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#F472B6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function BoleiraRevenueChart({ orders }) {
  // Agrupar faturamento por boleira (apenas pedidos pagos)
  const boleiraRevenue = orders
    .filter(order => order.Status === 'Pago')
    .reduce((acc, order) => {
      const boleira = order.Boleira || 'Sem boleira'
      acc[boleira] = (acc[boleira] || 0) + (order.Valor || 0)
      return acc
    }, {})

  const chartData = Object.entries(boleiraRevenue)
    .map(([boleira, revenue]) => ({ boleira, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10) // Top 10 boleiras por faturamento

  return (
    <Card className="border-accent-pink/20">
      <CardHeader>
        <CardTitle className="accent-pink">Faturamento por Boleira</CardTitle>
        <CardDescription>Top 10 boleiras por faturamento (pedidos pagos)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="boleira" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Faturamento']} />
            <Legend />
            <Bar dataKey="revenue" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function TypeChart({ orders }) {
  // Agrupar pedidos por tipo
  const typeData = orders.reduce((acc, order) => {
    const type = order.Tipo || 'Não especificado'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {})

  const chartData = Object.entries(typeData).map(([type, count]) => ({
    type,
    count
  }))

  return (
    <Card className="border-accent-pink/20">
      <CardHeader>
        <CardTitle className="accent-pink">Pedidos por Tipo</CardTitle>
        <CardDescription>Distribuição dos tipos de bolo</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ type, count, percent }) => `${type}: ${count} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function OrdersOverTimeChart({ orders }) {
  // Agrupar pedidos por mês
  const monthlyOrders = orders.reduce((acc, order) => {
    if (order['Data pedido']) {
      const month = order['Data pedido'].toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: 'short' 
      })
      acc[month] = (acc[month] || 0) + 1
    }
    return acc
  }, {})

  const chartData = Object.entries(monthlyOrders)
    .map(([month, count]) => ({ month, count }))
    .slice(-12) // Últimos 12 meses

  return (
    <Card className="border-accent-pink/20">
      <CardHeader>
        <CardTitle className="accent-pink">Pedidos ao Longo do Tempo</CardTitle>
        <CardDescription>Número de pedidos por mês</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#F472B6" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function BoleiraComparisonChart({ orders }) {
  // Comparar pedidos pagos vs pendentes por boleira
  const boleiraComparison = orders.reduce((acc, order) => {
    const boleira = order.Boleira || 'Sem boleira'
    if (!acc[boleira]) {
      acc[boleira] = { boleira, pagos: 0, pendentes: 0 }
    }
    
    if (order.Status === 'Pago') {
      acc[boleira].pagos += 1
    } else {
      acc[boleira].pendentes += 1
    }
    
    return acc
  }, {})

  const chartData = Object.values(boleiraComparison)
    .sort((a, b) => (b.pagos + b.pendentes) - (a.pagos + a.pendentes))
    .slice(0, 8) // Top 8 boleiras

  return (
    <Card className="border-accent-pink/20">
      <CardHeader>
        <CardTitle className="accent-pink">Comparação de Status por Boleira</CardTitle>
        <CardDescription>Pedidos pagos vs pendentes por boleira</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="boleira" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="pagos" stackId="a" fill="#10B981" name="Pagos" />
            <Bar dataKey="pendentes" stackId="a" fill="#F59E0B" name="Pendentes" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

