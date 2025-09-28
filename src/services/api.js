// services/api.js

// SUBSTITUA ESTE ENDPOINT PELA URL DO SEU GOOGLE APPS SCRIPT DEPLOYMENT!
const API_BASE_URL = 'SUA_URL_DO_GAS_AQUI' 

class ApiService {
  async request(endpoint, options = {}) {
    // 1. Transforma o endpoint (ex: /pedidos/stats) em um parâmetro de consulta para o GAS.
    const path = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint
    
    // 2. Constrói a URL final: [GAS_URL]?path=[endpoint]
    const url = `${API_BASE_URL}?path=${path}`
    
    // 3. Configuração da requisição
    const config = {
      // Remove o Content-Type: application/json por padrão, pois o GAS não o espera
      // para requisições GET/DELETE e pode causar erros.
      // Ele só será adicionado automaticamente para POST/PUT por conter o body.
      ...options,
    }

    // Se a requisição for POST ou PUT, o corpo precisa ser stringificado
    if (config.body && typeof config.body !== 'string') {
        config.body = JSON.stringify(config.body)
        config.headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        }
    }
    
    try {
      const response = await fetch(url, config)
      
      // O App Script retorna status 200 para todos os casos (sucesso/erro),
      // então precisamos verificar o corpo da resposta para erros.
      const data = await response.json()

      // Assumimos que o GAS sempre retorna um objeto com { success: boolean, ... }
      if (data.error || data.success === false) {
        throw new Error(data.error || 'Erro na requisição do Google Planilhas')
      }

      return data // Retorna { success: true, data: [...] } ou { success: true, message: '...' }
      
    } catch (error) {
      console.error('Erro na API:', error)
      // Se for um erro de rede/JSON (e não erro lógico do GAS), tratamos aqui
      const errorMessage = error.message || 'Erro de rede ou JSON. Verifique a URL do App Script.'
      throw new Error(errorMessage)
    }
  }

  // Pedidos
  // O filtro é ignorado aqui, mas deve ser implementado no script GAS para funcionar
  async getPedidos(filters = {}) {
    const params = new URLSearchParams()
    
    // Passa os filtros como parâmetros de consulta para o script GAS
    if (filters.status && filters.status !== 'Todos') {
      params.append('status', filters.status)
    }
    if (filters.boleira) {
      params.append('boleira', filters.boleira)
    }

    const queryString = params.toString()
    let endpoint = `/pedidos`
    
    // Se o GAS receber filtros, ele deve aplicar a lógica
    if (queryString) {
        endpoint += `?${queryString}`
    }
    
    return this.request(endpoint)
  }

  async getPedido(id) {
    return this.request(`/pedidos/${id}`)
  }

  async createPedido(pedidoData) {
    return this.request('/pedidos', {
      method: 'POST',
      body: pedidoData, // Não precisa de JSON.stringify() aqui, a função request faz isso
    })
  }

  async updatePedido(id, pedidoData) {
    return this.request(`/pedidos/${id}`, {
      method: 'PUT',
      body: pedidoData, // A função request vai stringificar
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
