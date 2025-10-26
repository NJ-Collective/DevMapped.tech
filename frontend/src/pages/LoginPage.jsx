/**
 * Login Page Component
 * User authentication page
 */

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export default function LoginPage({ onLogin, error, loading }) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-800 to-secondary-900 flex items-center justify-center p-4 relative">
      {/* Decorative blur */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-500/10 rounded-full filter blur-3xl pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="glass rounded-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome to DevMapped.tech
            </h1>
            <p className="text-secondary-300">
              Get your personalized learning path for tech careers
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Enter your username
              </label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Type your username..."
                required
                className="text-black placeholder-secondary-400"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={!username.trim() || loading}
              loading={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600"
            >
              {loading ? 'Signing in...' : 'Get Started'}
              {!loading && <ChevronRight size={16} />}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-secondary-400 text-sm">
              Your personalized career journey starts here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}