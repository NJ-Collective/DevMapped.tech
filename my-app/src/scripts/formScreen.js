import { ChevronRight, ChevronLeft, CheckCircle2, Loader2 } from 'lucide-react';

export default function FormScreen({
  questions,
  currentIndex,
  responses,
  onResponseChange,
  onNext,
  onBack,
  onSubmit,
  submitting
}) {
  const currentQuestion = questions[currentIndex] || {};
  const currentResponse = responses[currentQuestion.name || currentIndex] || '';
  const isLastQuestion = currentIndex === questions.length - 1;
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      padding: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      {/* Decorative blur */}
      <div style={{
        position: 'absolute',
        top: '25%',
        right: '25%',
        width: '24rem',
        height: '24rem',
        background: 'rgba(59, 130, 246, 0.1)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        pointerEvents: 'none'
      }}></div>

      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '48rem'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '1.5rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          padding: '2rem',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          {/* Progress */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem'
            }}>
              <span style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#93c5fd'
              }}>
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span style={{
                fontSize: '0.875rem',
                color: '#94a3b8'
              }}>
                {Math.round(progress)}%
              </span>
            </div>
            <div style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '9999px',
              height: '0.5rem',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{
                background: 'linear-gradient(90deg, #3b82f6 0%, #a855f7 100%)',
                height: '100%',
                width: `${progress}%`,
                transition: 'width 0.5s ease',
                borderRadius: '9999px'
              }}></div>
            </div>
          </div>

          {/* Question */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'white'
            }}>
              {currentQuestion.question}
            </h2>
          </div>

          {/* Textarea */}
          <div style={{ marginBottom: '2rem' }}>
            <textarea
              value={currentResponse}
              onChange={onResponseChange}
              placeholder="Share your thoughts..."
              rows="6"
              style={{
                width: '100%',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '0.75rem',
                color: 'white',
                fontSize: '1rem',
                backdropFilter: 'blur(10px)',
                outline: 'none',
                fontFamily: 'inherit',
                resize: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(59, 130, 246, 0.8)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
            ></textarea>
          </div>

          {/* Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <button
              onClick={onBack}
              disabled={currentIndex === 0}
              style={{
                padding: '0.5rem 1.5rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#cbd5e1',
                borderRadius: '0.5rem',
                fontWeight: '600',
                cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: currentIndex === 0 ? 0.3 : 1,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (currentIndex > 0) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.color = '#cbd5e1';
              }}
            >
              <ChevronLeft size={16} />
              Back
            </button>

            {isLastQuestion ? (
              <button
                onClick={onSubmit}
                disabled={submitting}
                style={{
                  padding: '0.5rem 2rem',
                  background: submitting
                    ? '#6b7280'
                    : 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  border: 'none',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: submitting ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!submitting) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 10px 20px rgba(16, 185, 129, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Submit
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={onNext}
                style={{
                  padding: '0.5rem 2rem',
                  background: 'linear-gradient(90deg, #2563eb 0%, #9333ea 100%)',
                  color: 'white',
                  borderRadius: '0.5rem',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 10px 20px rgba(59, 130, 246, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Next
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
