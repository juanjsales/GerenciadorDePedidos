const API_BASE_URL = 'https://0vhlizcg8ldl.manus.space/api'

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro na requisição')
      }

      return data
    } catch (error) {
      console.error('Erro na API:', error)
      throw error
    }
  }

  // Pedidos
  async getPedidos(filters = {}) {
    const params = new URLSearchParams()
    
    if (filters.status && filters.status !== 'Todos') {
      params.append('status', filters.status)
    }
    
    if (filters.boleira) {
      params.append('boleira', filters.boleira)
    }

    const queryString = params.toString()
    const endpoint = `/pedidos${queryString ? `?${queryString}` : ''}`
    
    return this.request(endpoint)
  }

  async getPedido(id) {
    return this.request(`/pedidos/${id}`)
  }

  async createPedido(pedidoData) {
    return this.request('/pedidos', {
      method: 'POST',
      body: JSON.stringify(pedidoData),
    })
  }

  async updatePedido(id, pedidoData) {
    return this.request(`/pedidos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pedidoData),
    })
  }

  async deletePedido(id) {
    return this.request(`/pedidos/${id}`, {
      method: 'DELETE',
    })
  }

  async getStats() {
    return this.request('/pedidos/stats')
  }
}

export const apiService = new ApiService()

