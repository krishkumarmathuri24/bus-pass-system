import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col items-center text-center gap-6 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
        Your bus pass, always in your pocket.
      </h1>
      <p className="text-gray-600 max-w-xl">
        Book tickets online, get a secure QR-code pass that can't be lost or
        faked, and track your bus in real time — all from one place.
      </p>
      <div className="flex gap-4">
        <Link to="/book" className="bg-brand text-white px-5 py-2 rounded-lg hover:bg-brand-dark">
          Book a ticket
        </Link>
        <Link to="/tracker" className="border border-brand text-brand px-5 py-2 rounded-lg hover:bg-blue-50">
          Track a bus
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mt-10 w-full">
        {[
          { title: 'Secure QR passes', desc: 'Signed, tamper-proof tickets that can\u2019t be duplicated or stolen.' },
          { title: 'Fair, consistent pricing', desc: 'Every fare comes from one central pricing service, not the app you\u2019re using.' },
          { title: 'Built to handle rush hour', desc: 'Auto-scaling backend keeps booking fast even during peak traffic.' },
        ].map((f) => (
          <div key={f.title} className="bg-white rounded-xl shadow p-5 text-left">
            <h3 className="font-semibold mb-1">{f.title}</h3>
            <p className="text-sm text-gray-600">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
