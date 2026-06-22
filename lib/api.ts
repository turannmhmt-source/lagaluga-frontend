const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://lagaluga-backend-production.up.railway.app'

export async function callApi<T = any>(endpoint: string, options?: RequestInit, timeoutMs = 120000): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(BASE + endpoint, { ...options, signal: controller.signal })
    const data = await res.json()
    if (data.status === 'failed') throw new Error(data.message || 'İşlem başarısız')
    if (!res.ok) throw new Error(data.detail || data.message || `HTTP ${res.status}`)
    return data as T
  } catch (err: any) {
    if (err.name === 'AbortError') throw new Error('İstek zaman aşımına uğradı. Lütfen tekrar deneyin.')
    throw err
  } finally {
    clearTimeout(timer)
  }
}

export async function uploadFile(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  const data = await callApi<{result_url: string}>('/tools/upload', { method: 'POST', body: form })
  if (!data.result_url) throw new Error('URL alınamadı')
  return data.result_url
}
