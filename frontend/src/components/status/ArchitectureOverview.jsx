import React from 'react';
import { 
  FolderTree, 
  Layers, 
  ShieldCheck, 
  Database, 
  Sparkles, 
  ArrowRight,
  Code,
  Workflow
} from 'lucide-react';

export default function ArchitectureOverview() {
  const tiers = [
    {
      title: 'Frontend Client',
      badge: 'React + Vite',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      description: 'Single-page application powered by React 18, Vite, Tailwind CSS, Lucide Icons, and Framer Motion for responsive, animated UI.',
      folders: [
        { path: 'frontend/src/components/', role: 'Reusable UI elements (Navbar, Cards, Buttons, Modals)' },
        { path: 'frontend/src/pages/', role: 'Top-level view containers (Home, Explore, Profile)' },
        { path: 'frontend/src/services/', role: 'Network clients (Axios API client, Supabase client)' },
      ],
    },
    {
      title: 'Backend API Server',
      badge: 'Node.js + Express',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: 'RESTful API following MVC architecture with separation of routing, business logic, validation, and middleware.',
      folders: [
        { path: 'backend/src/routes/', role: 'Endpoint definitions (e.g. /api/health, /api/skills)' },
        { path: 'backend/src/controllers/', role: 'HTTP request handling, input extraction, and responses' },
        { path: 'backend/src/services/', role: 'Core business logic and database query operations' },
        { path: 'backend/src/middleware/', role: 'Error handling, logging, auth token verification' },
      ],
    },
    {
      title: 'Data & Auth Layer',
      badge: 'Supabase PostgreSQL',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      description: 'Scalable PostgreSQL database with Row Level Security (RLS) and integrated Supabase JWT authentication.',
      folders: [
        { path: 'backend/src/config/db.js', role: 'Server-side Supabase client initialization' },
        { path: 'frontend/src/services/supabaseClient.js', role: 'Client-side Supabase client for auth session state' },
      ],
    },
  ];

  return (
    <div id="architecture" className="space-y-8 mt-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
            <FolderTree className="w-4 h-4" />
            System Blueprint
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">
            SkillSwap Architectural Foundation
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Engineered with strict separation of concerns to keep code modular, testable, and beginner-friendly.
          </p>
        </div>
      </div>

      {/* 3-Tier Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {tiers.map((tier, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-md transition shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900 text-lg">{tier.title}</h3>
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${tier.badgeColor}`}>
                  {tier.badge}
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                {tier.description}
              </p>

              <div className="space-y-2.5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Key Folders & Responsibilities
                </span>
                {tier.folders.map((item, itemIdx) => (
                  <div 
                    key={itemIdx} 
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1"
                  >
                    <code className="font-semibold text-indigo-700 font-mono block">
                      {item.path}
                    </code>
                    <p className="text-slate-600 text-[11px] leading-tight">
                      {item.role}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Data Flow Diagram Card */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex items-center space-x-3 mb-4">
          <Workflow className="w-6 h-6 text-indigo-400" />
          <h3 className="text-lg font-bold">How Data & Requests Flow in SkillSwap</h3>
        </div>
        <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mb-6">
          Every user interaction follows a clean path: the browser initiates the request via the service layer, Express routes it to a controller, the service executes business logic or DB calls, and a standardized JSON payload returns.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
            <span className="text-indigo-300 font-bold block mb-1">1. User Action</span>
            <span className="text-slate-200">React Component triggers action via <code>src/services/api.js</code></span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
            <span className="text-indigo-300 font-bold block mb-1">2. Express Routing</span>
            <span className="text-slate-200"><code>backend/src/routes</code> matches route & applies middleware</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
            <span className="text-indigo-300 font-bold block mb-1">3. Controller & Service</span>
            <span className="text-slate-200">Validates inputs and calls database via <code>src/config/db.js</code></span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
            <span className="text-indigo-300 font-bold block mb-1">4. Standardized JSON</span>
            <span className="text-slate-200"><code>apiResponse.js</code> sends consistent format back to UI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
