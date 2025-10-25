import { ChevronRight } from 'lucide-react';

export default function UsernameScreen({ username, setUsername, onSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onSubmit();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative blur */}
      <div style={{
        position: 'absolute',
        top: '5rem',
        right: '5rem',
        width: '18rem',
        height: '18rem',
        background: 'rgba(59, 130, 246, 0.2)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        pointerEvents: 'none'
      }}></div>

      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '28rem'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          padding: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{
              fontSize: '2.25rem',
              fontWeight: 'bold',
              color: 'white',
              marginBottom: '0.5rem'
            }}>Welcome</h1>
            <p style={{
              color: '#cbd5e1',
              fontSize: '1rem'
            }}>Enter your name to get started</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your name"
              autoFocus
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '0.75rem',
                color: 'white',
                fontSize: '1rem',
                backdropFilter: 'blur(10px)',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(59, 130, 246, 0.8)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
            />

            <button
              onClick={handleSubmit}
              disabled={!username.trim()}
              style={{
                width: '100%',
                padding: '0.75rem 1.5rem',
                background: username.trim() 
                  ? 'linear-gradient(90deg, #2563eb 0%, #9333ea 100%)'
                  : '#4b5563',
                color: 'white',
                borderRadius: '0.75rem',
                fontWeight: '600',
                fontSize: '1rem',
                border: 'none',
                cursor: username.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
                opacity: username.trim() ? 1 : 0.5
              }}
              onMouseEnter={(e) => {
                if (username.trim()) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 10px 20px rgba(59, 130, 246, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Start
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <p style={{
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: '0.875rem',
          marginTop: '1.5rem'
        }}>Your responses are secure and private</p>
      </div>
    </div>
  );
}