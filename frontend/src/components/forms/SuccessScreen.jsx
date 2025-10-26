/**
 * Success Screen Component
 * Displays confirmation after form submission
 */

import { CheckCircle2 } from 'lucide-react';

export default function SuccessScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-800 to-secondary-900 flex items-center justify-center p-4 relative">
      {/* Decorative blur */}
      <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-green-500/20 rounded-full filter blur-3xl pointer-events-none" />

      <div className="relative z-10 text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/50 rounded-full filter blur-xl animate-pulse" />
            <CheckCircle2
              size={96}
              className="text-green-400 relative"
              strokeWidth={1.5}
            />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-white mb-3">
          Thank you!
        </h2>
        <p className="text-secondary-300 text-lg mb-8">
          Your responses have been submitted successfully.
        </p>

        <div className="glass rounded-xl p-4 border border-white/20">
          <p className="text-secondary-400 text-sm">
            We appreciate your time and feedback
          </p>
        </div>
      </div>
    </div>
  );
}
