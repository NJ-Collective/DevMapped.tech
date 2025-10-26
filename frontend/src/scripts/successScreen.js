import { CheckCircle2 } from 'lucide-react';

export default function SuccessScreen() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      position: 'relative'
    }}>
      {/* Decorative blur */}
      <div style={{
        position: 'absolute',
        top: '25%',
        right: '33%',
        width: '24rem',
        height: '24rem',
        background: 'rgba(16, 185, 129, 0.2)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        pointerEvents: 'none'
      }}></div>

      <div style={{
        position: 'relative',
        zIndex: 10,
        textAlign: 'center',
        maxWidth: '28rem'
      }}>
        <div style={{
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(16, 185, 129, 0.5)',
              borderRadius: '50%',
              filter: 'blur(20px)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}></div>
            <CheckCircle2
              size={96}
              color="#4ade80"
              strokeWidth={1.5}
              style={{ position: 'relative' }}
            />
          </div>
        </div>

        <h2 style={{
          fontSize: '1.875rem',
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '0.75rem'
        }}>Thank you!</h2>
        <p style={{
          color: '#cbd5e1',
          fontSize: '1.125rem',
          marginBottom: '2rem'
        }}>Your responses have been submitted successfully.</p>

        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '0.75rem',
          padding: '1rem',
          backdropFilter: 'blur(10px)'
        }}>
          <p style={{
            color: '#94a3b8',
            fontSize: '0.875rem'
          }}>We appreciate your time and feedback</p>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}