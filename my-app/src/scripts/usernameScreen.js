export default function UsernameScreen({ username, setUsername, onSubmit }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Welcome</h1>
        <p className="text-gray-600 mb-6">Please enter your username to begin</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 mb-6"
            autoFocus
          />
          <button
            type="submit"
            disabled={!username.trim()}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start
          </button>
        </form>
      </div>
    </div>
  );
}