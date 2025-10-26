import { useState, useEffect } from 'react';
import FormScreen from '../scripts/formScreen';
import SuccessScreen from '../scripts/successScreen';
import { fetchQuestions, submitResponses, checkUserSubmission } from '../config/firebaseUtils';

export default function FormPage({ onSubmit }) {
  const username = localStorage.getItem('username') || 'User';
  
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [makingNewSubmission, setMakingNewSubmission] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
  console.log('Username from localStorage:', username);
  const loadData = async () => {
    try {
      // Check if user has already submitted
      const userHasSubmitted = await checkUserSubmission(username);
      console.log('User has submitted:', userHasSubmitted);
      setHasSubmitted(userHasSubmitted);

      // Load questions
      const q = await fetchQuestions();
      setQuestions(q);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, [username]);

  const handleResponseChange = (e) => {
    const currentQuestion = questions[currentIndex];
    setResponses({
      ...responses,
      [currentQuestion.name || currentIndex]: e.target.value
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
  setSubmitting(true);
  try {
    await submitResponses(username, responses);
    setSubmitted(true);
    onSubmit?.();
  } catch (error) {
    console.error('Submission error:', error);
    alert('Error submitting responses: ' + error.message);
  } finally {
    setSubmitting(false);
  }
};

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: 'white',
        fontSize: '1.125rem'
      }}>
        Loading questions...
      </div>
    );
  }

  if (hasSubmitted && !makingNewSubmission) {
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
          <h2 style={{
            fontSize: '2.25rem',
            fontWeight: 'bold',
            marginBottom: '1rem'
          }}>Form Already Submitted</h2>
          <p style={{
            fontSize: '1.125rem',
            color: '#cbd5e1',
            marginBottom: '2rem'
          }}>You have already completed the form.</p>
          
          <button
            onClick={() => setMakingNewSubmission(true)}
            style={{
              padding: '0.75rem 2rem',
              background: 'linear-gradient(90deg, #2563eb 0%, #9333ea 100%)',
              color: 'white',
              borderRadius: '0.75rem',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
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
            Make a New Submission
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: 'white',
        fontSize: '1.125rem'
      }}>
        No questions found
      </div>
    );
  }

  if (submitted) {
    return <SuccessScreen />;
  }

  return (
    <FormScreen
      questions={questions}
      currentIndex={currentIndex}
      responses={responses}
      onResponseChange={handleResponseChange}
      onNext={handleNext}
      onBack={handleBack}
      onSubmit={handleSubmit}
      submitting={submitting}
    />
  );
}