const BASE = 'https://lagaluga-backend-production.up.railway.app'

export async function callApi<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(BASE + endpoint, options)
  const data = await res.json()
  console.log('[API]', endpoint, data)
  if (data.status === 'failed') throw new Error(data.message || 'İşlem başarısız')
  if (!res.ok) throw new Error(data.detail || data.message || `HTTP ${res.status}`)
  return data as T
}

export async function uploadFile(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  const data = await callApi<{result_url: string}>('/tools/upload', { method: 'POST', body: form })
  if (!data.result_url) throw new Error('URL alınamadı')
  return data.result_url
}
