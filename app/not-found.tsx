import Link from 'next/link';
import { Radar, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Radar size={28} className="text-safe" />
          <span className="font-bold text-xl">
            Token<span className="text-gradient-brand">Radar</span>
          </span>
        </div>
        <h1 className="text-6xl font-bold font-mono text-gradient-brand mb-4">404</h1>
        <p className="text-lg text-muted mb-8">This page doesn't exist.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-safe/10 text-safe font-semibold hover:bg-safe/20 transition-all"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
