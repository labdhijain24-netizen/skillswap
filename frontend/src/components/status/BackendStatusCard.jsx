import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Server, 
  Database, 
  Globe, 
  Clock, 
  Cpu,
  AlertTriangle
} from 'lucide-react';
import { checkBackendHealth } from '../../services/healthService';

export default function BackendStatusCard() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await checkBackendHealth();
      setHealth(response.data || response);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message || 'Unable to connect to backend server');
      setHealth(null);
      setLastChecked(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div id="health-status" className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-indigo-50/30 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-sm">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Backend Communication Status</h3>
            <p className="text-xs text-slate-500">Live health verification between React and Express</p>
          </div>
        </div>

        <button
          onClick={fetchHealth}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 active:scale-95 transition shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          {loading ? 'Pinging...' : 'Ping Backend'}
        </button>
      </div>

      {/* Body */}
      <div className="p-6">
        {loading && !health && !error ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-sm">Connecting to backend at http://localhost:5000/api/health...</p>
          </div>
        ) : error ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 space-y-3"
          >
            <div className="flex items-start space-x-3">
              <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-red-900">Communication Failed</h4>
                <p className="text-xs text-red-700 mt-1">{error}</p>
              </div>
            </div>
            <div className="text-xs bg-white/70 p-3 rounded-lg border border-red-200 font-mono text-slate-700">
              💡 Ensure the backend server is running with <code className="bg-red-100 px-1 py-0.5 rounded font-semibold text-red-800">npm run dev</code> or <code className="bg-red-100 px-1 py-0.5 rounded font-semibold text-red-800">npm run dev:backend</code>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Status Banner */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">
                    Connection Established Successfully
                  </h4>
                  <p className="text-xs text-emerald-700">
                    Frontend & Backend are talking seamlessly over HTTP REST!
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Last checked: {lastChecked}
              </span>
            </div>

            {/* Diagnostic Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">Service</span>
                  <Server className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="text-base font-semibold text-slate-900">
                  {health?.application || 'SkillSwap API'}
                </div>
                <span className="inline-block mt-1 text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                  Status: {health?.status || 'online'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">Environment</span>
                  <Globe className="w-4 h-4 text-violet-500" />
                </div>
                <div className="text-base font-semibold text-slate-900 capitalize">
                  {health?.environment || 'development'}
                </div>
                <span className="inline-block mt-1 text-xs text-slate-500">
                  Port: 5000 (Express)
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">Server Uptime</span>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-base font-semibold text-slate-900">
                  {health?.uptimeSeconds !== undefined ? `${health.uptimeSeconds}s` : 'Just started'}
                </div>
                <span className="inline-block mt-1 text-xs text-slate-500">
                  Real-time Node process
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">Supabase DB</span>
                  <Database className="w-4 h-4 text-teal-500" />
                </div>
                <div className="text-base font-semibold text-slate-900">
                  {health?.database?.connected ? 'Connected' : 'Config Ready'}
                </div>
                <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded font-medium ${
                  health?.database?.connected 
                    ? 'text-teal-700 bg-teal-50' 
                    : 'text-amber-700 bg-amber-50'
                }`}>
                  {health?.database?.connected ? 'Active PostgreSQL' : 'Credentials pending in .env'}
                </span>
              </div>
            </div>

            {/* Note about Supabase */}
            {!health?.database?.connected && (
              <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200/80 flex items-start space-x-3 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Database Note: </span>
                  The Supabase client configuration and error handlers are active in <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-950 font-mono">backend/src/config/db.js</code> and <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-950 font-mono">frontend/src/services/supabaseClient.js</code>. When you add your real Supabase project URL and anon key to <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-950 font-mono">.env</code>, database queries will execute seamlessly!
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
