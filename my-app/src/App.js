import { useState, useEffect } from 'react';
import UsernameScreen from './scripts/usernameScreen';
import FormScreen from './scripts/formScreen';
import SuccessScreen from './scripts/successScreen';
import { fetchQuestions, submitResponses } from './config/firebaseUtils';

export default function FormApp() {
  const [username, setUsername] = useState('');
  const [usernameSubmitted, setUsernameSubmitted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!usernameSubmitted) return;

    const loadQuestions = async () => {
      try {
        const q = await fetchQuestions();
        setQuestions(q);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [usernameSubmitted]);

  const handleUsernameSubmit = () => {
    setUsernameSubmitted(true);
    setLoading(true);
  };

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
    } catch (error) {
      alert('Error submitting responses');
    } finally {
      setSubmitting(false);
    }
  };

  if (!usernameSubmitted) {
    return (
      <UsernameScreen
        username={username}
        setUsername={setUsername}
        onSubmit={handleUsernameSubmit}
      />
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen text-lg">Loading questions...</div>;
  }

  if (questions.length === 0) {
    return <div className="flex items-center justify-center h-screen text-lg">No questions found</div>;
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