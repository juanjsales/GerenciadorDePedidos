import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Button } from '@/components/ui/button.jsx'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'

export function Calendar({ orders }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Gerar dias do mês atual
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  
  const days = []
  
  // Dias vazios no início
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }
  
  // Dias do mês
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  // Filtrar pedidos do mês atual
  const monthOrders = useMemo(() => {
    return orders.filter(order => {
      const orderDate = order['Data pedido']
      const deliveryDate = order['Data entrega']
      
      return (orderDate && orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) ||
             (deliveryDate && deliveryDate.getMonth() === currentMonth && deliveryDate.getFullYear() === currentYear)
    })
  }, [orders, currentMonth, currentYear])

  // Agrupar pedidos por dia
  const ordersByDay = useMemo(() => {
    const grouped = {}
    
    monthOrders.forEach(order => {
      // Pedidos
      if (order['Data pedido']) {
        const day = order['Data pedido'].getDate()
        if (!grouped[day]) grouped[day] = { orders: [], deliveries: [] }
        grouped[day].orders.push(order)
      }
      
      // Entregas
      if (order['Data entrega']) {
        const day = order['Data entrega'].getDate()
        if (!grouped[day]) grouped[day] = { orders: [], deliveries: [] }
        grouped[day].deliveries.push(order)
      }
    })
    
    return grouped
  }, [monthOrders])

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendário de Pedidos
            </CardTitle>
            <CardDescription>
              {monthNames[currentMonth]} {currentYear}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 mb-4">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-sm font-semibold text-gray-600">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div key={index} className="min-h-[100px] border rounded p-1">
              {day && (
                <>
                  <div className="text-sm font-semibold mb-1">{day}</div>
                  {ordersByDay[day] && (
                    <div className="space-y-1">
                      {ordersByDay[day].orders.map((order, orderIndex) => (
                        <div key={`order-${orderIndex}`} className="text-xs">
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                            Pedido: {order.Tema || 'S/tema'}
                          </Badge>
                        </div>
                      ))}
                      {ordersByDay[day].deliveries.map((order, deliveryIndex) => (
                        <div key={`delivery-${deliveryIndex}`} className="text-xs">
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                            Entrega: {order.Tema || 'S/tema'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">Pedido</Badge>
            <span>Data do pedido</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700">Entrega</Badge>
            <span>Data de entrega</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

