export default function RoadmapPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      padding: '2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '1.5rem',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        padding: '3rem',
        maxWidth: '48rem',
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 style={{
          fontSize: '2.25rem',
          fontWeight: 'bold',
          marginBottom: '1rem'
        }}>Roadmap</h1>
        <p style={{
          fontSize: '1.125rem',
          color: '#cbd5e1'
        }}>Your roadmap content goes here</p>
      </div>
    </div>
  );
}