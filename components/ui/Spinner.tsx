export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size,
      border: '3px solid rgba(236,72,153,0.2)',
      borderTop: '3px solid #EC4899',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
      display: 'inline-block'
    }} />
  )
}
