export default function SuccessScreen() {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Thank you!</h2>
        <p className="text-gray-600">Your responses have been submitted successfully.</p>
      </div>
    </div>
  );
}