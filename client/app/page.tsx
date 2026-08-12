"use client";

import { useEffect, useState } from "react";
import {
  RotateCw,
  Loader2,
  AlertCircle,
  Clock,
  Server,
  Database,
  Activity,
} from "lucide-react";

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
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const fetchHealth = () => {
    setLoading(true);
    setError(null);
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
  };

  useEffect(() => {
    fetchHealth();
  }, [refreshKey]);

  return (
    <div className="min-h-screen bg-off-white text-text-main flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <main className="w-full max-w-xl bg-white rounded-xl shadow-xl border border-maroon-100 overflow-hidden transition-all">
        <div className="bg-maroon-900 p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center space-x-2 bg-maroon-800 border border-maroon-700 px-3 py-1 rounded-sm text-xs font-medium text-cream tracking-wide mb-3">
                <span className="w-2 h-2 rounded-full bg-cream animate-pulse" />
                <span className="font-poppins uppercase tracking-wider text-[10px]">CommerceCore API</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-white leading-tight">
                System Status
              </h1>
              <p className="text-sm font-sans font-normal text-maroon-200 mt-1">
                Real-time backend server &amp; database telemetry
              </p>
            </div>

            <button
              onClick={() => setRefreshKey((prev) => prev + 1)}
              disabled={loading}
              title="Refresh Health Status"
              className="p-3 bg-maroon-800 hover:bg-maroon-700 border border-maroon-700 rounded-md text-cream hover:text-white transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              <RotateCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6 bg-white font-sans">
          {loading && !health && (
            <div className="flex flex-col items-center justify-center py-10 space-y-3 text-maroon-700">
              <Loader2 className="w-8 h-8 animate-spin text-maroon-700" />
              <span className="text-sm font-medium">Checking backend status...</span>
            </div>
          )}

          {error && (
            <div className="p-5 bg-maroon-100/60 border border-maroon-200 rounded-lg text-maroon-900 space-y-2">
              <div className="flex items-center space-x-2 font-semibold text-maroon-800">
                <AlertCircle className="w-5 h-5 text-maroon-600 shrink-0" />
                <span className="font-serif">Unable to reach CommerceCore server</span>
              </div>
              <p className="text-sm text-maroon-700 font-sans">{error}</p>
              <div className="pt-2 text-xs text-maroon-600 font-mono bg-white/70 p-2.5 rounded-sm border border-maroon-200/80">
                Target Endpoint: {API_BASE_URL}/health
              </div>
            </div>
          )}

          {health && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-off-white rounded-lg border border-maroon-100/80 hover:border-maroon-200 transition-colors">
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-maroon-600 uppercase tracking-wider mb-1">
                    <Server className="w-3.5 h-3.5" />
                    <span>Server Status</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-semibold font-serif text-maroon-900">Operational</span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mr-1.5 animate-ping" />
                      Healthy
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-off-white rounded-lg border border-maroon-100/80 hover:border-maroon-200 transition-colors">
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-maroon-600 uppercase tracking-wider mb-1">
                    <Database className="w-3.5 h-3.5" />
                    <span>Database Connection</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-semibold font-serif text-maroon-900">MongoDB</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-semibold border ${
                        health.data?.dbConnected
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : "bg-amber-100 text-amber-800 border-amber-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          health.data?.dbConnected ? "bg-emerald-600" : "bg-amber-600"
                        }`}
                      />
                      {health.data?.dbConnected ? "Connected" : "Disconnected"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-4 bg-off-white rounded-lg border border-maroon-100/60">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-maroon-100 rounded-md text-maroon-700">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold font-serif text-maroon-900">Uptime</div>
                      <div className="text-xs text-maroon-500 font-sans">Continuous runtime duration</div>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-bold text-maroon-800 bg-white px-3 py-1 rounded-sm border border-maroon-100">
                    {health.data?.uptime?.toFixed(2)}s
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-off-white rounded-lg border border-maroon-100/60">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-maroon-100 rounded-md text-maroon-700">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold font-serif text-maroon-900">Last Checked</div>
                      <div className="text-xs text-maroon-500 font-sans">Timestamp of latest ping</div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-maroon-700 bg-white px-3 py-1 rounded-sm border border-maroon-100 font-sans">
                    {new Date(health.data?.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-maroon-900 text-center border-t border-maroon-800 font-sans">
          <p className="text-xs text-maroon-200 font-medium tracking-wide">
            CommerceCore v1.0 &bull; Powered by Next.js &amp; Express
          </p>
        </div>
      </main>
    </div>
  );
}
