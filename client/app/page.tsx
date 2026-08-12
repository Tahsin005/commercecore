"use client";

import { useEffect, useState } from "react";

interface HealthData {
  uptime: number;
  dbConnected: boolean;
  timestamp: string;
}

interface ApiResponse {
  statusCode: number;
  data: HealthData;
  message: string;
  success: boolean;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export default function Home() {
  const [health, setHealth] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/health`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.json();
      })
      .then((data: ApiResponse) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to fetch health status");
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-6">
      <main className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            CommerceCore Health
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Backend server & database status
          </p>
        </div>

        {loading && (
          <div className="flex items-center space-x-3 text-slate-600">
            <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
            <span>Fetching backend status...</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            <p className="font-semibold">Unable to connect to backend</p>
            <p className="mt-1 text-red-600">{error}</p>
            <p className="mt-2 text-xs text-red-500">
              Target endpoint: <code className="bg-red-100 px-1 py-0.5 rounded">{API_BASE_URL}/health</code>
            </p>
          </div>
        )}

        {health && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-sm font-medium text-slate-600">Server Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                {health.message}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-sm font-medium text-slate-600">Database Connection</span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  health.data?.dbConnected
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {health.data?.dbConnected ? "Connected" : "Disconnected"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-sm font-medium text-slate-600">Uptime</span>
              <span className="font-mono text-sm font-semibold text-slate-800">
                {health.data?.uptime?.toFixed(2)}s
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-sm font-medium text-slate-600">Last Checked</span>
              <span className="text-xs text-slate-500">
                {new Date(health.data?.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
