/**
 * Form Page Component
 * Handles the questionnaire form flow
 */

import { useState, useEffect } from 'react';
import FormScreen from '../components/forms/FormScreen';
import SuccessScreen from '../components/forms/SuccessScreen';
import { fetchQuestions, submitResponses, checkUserSubmission } from '../services/firebaseService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';

export default function FormPage({ username, onSubmit }) {
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
      <div className="min-h-screen bg-gradient-to-br from-secondary-800 to-secondary-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-white text-lg">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (hasSubmitted && !makingNewSubmission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-800 to-secondary-900 p-8 flex items-center justify-center">
        <div className="glass rounded-2xl p-12 max-w-3xl text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Form Already Submitted</h2>
          <p className="text-lg text-secondary-300 mb-8">
            You have already completed the form.
          </p>
          
          <Button
            variant="primary"
            onClick={() => setMakingNewSubmission(true)}
            className="bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600"
          >
            Make a New Submission
          </Button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-800 to-secondary-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">No questions found</p>
        </div>
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