"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import type { Position, PnLSummary, Opportunity } from "@/lib/types";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const [positions, setPositions] = useState<Position[]>([]);
  const [pnl, setPnl] = useState<PnLSummary | null>(null);
  const [balances, setBalances] = useState<Record<string, unknown>>({});
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  useEffect(() => {
    if (!user) return;
    api.get<Position[]>("/dashboard/positions").then(setPositions);
    api.get<PnLSummary>("/dashboard/pnl?period=daily").then(setPnl);
    api.get<Record<string, unknown>>("/dashboard/balances").then(setBalances);
    api.get<Opportunity[]>("/scan/opportunities").then(setOpportunities).catch(() => {});
  }, [user]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) {
    if (typeof window !== "undefined") window.location.href = "/";
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400">{user.display_name || user.email}</span>
          <a href="/scan" className="text-blue-400 hover:underline">Scan</a>
          <a href="/settings" className="text-blue-400 hover:underline">Settings</a>
          <a href="/history" className="text-blue-400 hover:underline">History</a>
          <button onClick={logout} className="text-gray-500 hover:text-red-400">Logout</button>
        </div>
      </div>

      {/* P&L Summary */}
      {pnl && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="text-gray-400 text-sm">Today P&L</div>
            <div className={`text-2xl font-bold ${pnl.total_pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
              ${pnl.total_pnl.toFixed(2)}
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="text-gray-400 text-sm">Trades Today</div>
            <div className="text-2xl font-bold">{pnl.trades}</div>
          </div>
        </div>
      )}

      {/* Balances */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Exchange Balances</h2>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(balances).map(([name, bal]) => (
            <div key={name} className="bg-gray-900 rounded-lg p-4">
              <div className="text-gray-400 text-sm capitalize">{name}</div>
              <div className="text-lg font-mono">
                {typeof bal === "object" && bal !== null && "equity" in bal
                  ? `$${(bal as { equity: number }).equity.toFixed(2)}`
                  : "N/A"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Open Positions */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Open Positions ({positions.length})</h2>
        {positions.length === 0 ? (
          <p className="text-gray-500">No open positions</p>
        ) : (
          <div className="space-y-2">
            {positions.map((pos) => (
              <div key={pos.id} className="bg-gray-900 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <span className="font-bold">{pos.base}</span>
                  <span className="text-gray-400 ml-2">{pos.type}</span>
                  <span className="text-gray-500 ml-2">{pos.legs?.exchange as string}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono">${pos.amount_usd} x{pos.leverage}</span>
                  <button
                    onClick={() => api.post(`/trade/close/${pos.id}`).then(() => setPositions(p => p.filter(x => x.id !== pos.id)))}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Opportunities */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Opportunities</h2>
        <button
          onClick={() => api.post("/scan/trigger").then(() => api.get<Opportunity[]>("/scan/opportunities").then(setOpportunities))}
          className="mb-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
        >
          Scan Now
        </button>
        {opportunities.length === 0 ? (
          <p className="text-gray-500">No opportunities found</p>
        ) : (
          <div className="space-y-2">
            {opportunities.map((opp, i) => (
              <div key={i} className="bg-gray-900 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <span className="font-bold">{opp.base}</span>
                  <span className="text-yellow-400 ml-2">{opp.type.replace("_", " ")}</span>
                  <span className="text-gray-400 ml-2">{opp.direction}</span>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-mono">FR diff: {opp.fr_diff}%</div>
                  <div className="text-gray-400 text-sm">Est. ${opp.net_income}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
