/**
 * Form Screen Component
 * Displays the questionnaire form with progress tracking
 */

import { ChevronRight, ChevronLeft, CheckCircle2, Loader2 } from 'lucide-react';
import Button from '../common/Button';

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
    <div className="min-h-screen bg-gradient-to-br from-secondary-800 to-secondary-900 p-4 flex items-center justify-center relative">
      {/* Decorative blur */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-500/10 rounded-full filter blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl">
        <div className="glass rounded-2xl p-8 border border-white/20">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-blue-300">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-sm text-secondary-400">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden border border-white/20">
              <div 
                className="bg-gradient-to-r from-primary-500 to-purple-500 h-full transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">
  {currentQuestion.text}
</h2>
          </div>

          {/* Textarea */}
          <div className="mb-8">
            <textarea
              value={currentResponse}
              onChange={onResponseChange}
              placeholder="Share your thoughts..."
              rows={6}
              className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white text-base backdrop-blur-md outline-none font-inherit resize-none transition-all duration-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center gap-4">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={currentIndex === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft size={16} />
              Back
            </Button>

            {isLastQuestion ? (
              <Button
                variant="primary"
                onClick={onSubmit}
                disabled={submitting}
                loading={submitting}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Submit
                  </>
                )}
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={onNext}
                className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600"
              >
                Next
                <ChevronRight size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
