type AlertProps = { type: 'success' | 'error' | 'info'; message: string }
export function Alert({ type, message }: AlertProps) {
  const colors = {
    success: { bg: '#F0FDF4', border: '#86EFAC', text: '#166534', icon: '✅' },
    error:   { bg: '#FEF2F2', border: '#FCA5A5', text: '#991B1B', icon: '❌' },
    info:    { bg: '#EFF6FF', border: '#93C5FD', text: '#1E40AF', icon: 'ℹ️' },
  }[type]
  return (
    <div style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 8, padding: '12px 16px', color: colors.text, fontSize: 14, fontWeight: 600 }}>
      {colors.icon} {message}
    </div>
  )
}
