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
  const currentQuestion = questions[currentIndex];
  const currentResponse = responses[currentQuestion.name || currentIndex] || '';
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-600">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentIndex + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {currentQuestion.text || currentQuestion}
        </h2>

        {/* Response input */}
        <textarea
          value={currentResponse}
          onChange={onResponseChange}
          placeholder="Enter your response..."
          className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 resize-none"
          rows="5"
        ></textarea>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            disabled={currentIndex === 0}
            className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition"
          >
            Back
          </button>

          <div className="flex gap-4">
            {isLastQuestion ? (
              <button
                onClick={onSubmit}
                disabled={submitting}
                className="px-8 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            ) : (
              <button
                onClick={onNext}
                className="px-8 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}