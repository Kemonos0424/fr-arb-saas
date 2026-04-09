"use client";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { api } from "@/lib/api";
import type { Position, PnLSummary, Opportunity } from "@/lib/types";

function DashboardContent() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [pnl, setPnl] = useState<PnLSummary | null>(null);
  const [balances, setBalances] = useState<Record<string, unknown>>({});
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [closing, setClosing] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<Position[]>("/dashboard/positions").then(setPositions).catch(() => {}),
      api.get<PnLSummary>("/dashboard/pnl?period=daily").then(setPnl).catch(() => {}),
      api.get<Record<string, unknown>>("/dashboard/balances").then(setBalances).catch(() => {}),
      api.get<Opportunity[]>("/scan/opportunities").then(setOpportunities).catch(() => {}),
    ]).catch(() => setLoadError(true));
  }, []);

  const triggerScan = async () => {
    setScanning(true);
    try {
      await api.post("/scan/trigger");
      const opps = await api.get<Opportunity[]>("/scan/opportunities");
      setOpportunities(opps);
    } catch { /* ignore */ }
    setScanning(false);
  };

  const closePosition = async (id: string) => {
    setClosing(id);
    try {
      await api.post(`/trade/close/${id}`);
      setPositions(p => p.filter(x => x.id !== id));
    } catch { /* ignore */ }
    setClosing(null);
  };

  return (
    <div className="space-y-8 py-6">
      {loadError && (
        <div className="p-4 bg-yellow-900/20 border border-yellow-800/50 rounded-xl text-yellow-400 text-sm">
          Some data could not be loaded. The backend may be offline.
        </div>
      )}

      {/* P&L Summary */}
      <p className="text-xs text-gray-500">本日のFR裁定による損益とトレード回数、オープンポジション数を表示します。</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Today P&L</div>
          <div className={`text-2xl font-bold mt-1 ${(pnl?.total_pnl ?? 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
            ${(pnl?.total_pnl ?? 0).toFixed(2)}
          </div>
        </div>
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Trades Today</div>
          <div className="text-2xl font-bold mt-1">{pnl?.trades ?? 0}</div>
        </div>
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Open Positions</div>
          <div className="text-2xl font-bold mt-1">{positions.length}</div>
        </div>
      </div>

      {/* Exchange Balances */}
      {Object.keys(balances).length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Exchange Balances</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(balances).map(([name, bal]) => (
              <div key={name} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                <div className="text-xs text-gray-500 capitalize">{name}</div>
                <div className="text-lg font-mono mt-1">
                  {typeof bal === "object" && bal !== null && "equity" in bal
                    ? `$${(bal as { equity: number }).equity.toFixed(2)}`
                    : "N/A"}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Open Positions */}
      <section>
        <h2 className="text-lg font-semibold mb-1">Open Positions</h2>
        <p className="text-xs text-gray-500 mb-3">現在保有中のヘッジポジション。FR決済後に自動またはCloseボタンでクローズできます。</p>
        {positions.length === 0 ? (
          <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center text-gray-500">
            No open positions
          </div>
        ) : (
          <div className="space-y-2">
            {positions.map((pos) => (
              <div key={pos.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg">{pos.base}</span>
                  <span className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-400">{pos.type}</span>
                  <span className="text-gray-500 text-sm">{pos.legs?.exchange as string}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm">${pos.amount_usd} x{pos.leverage}</span>
                  <button
                    onClick={() => closePosition(pos.id)}
                    disabled={closing === pos.id}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 rounded-lg text-xs font-medium transition"
                  >
                    {closing === pos.id ? "Closing..." : "Close"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Opportunities */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold">Opportunities</h2>
            <p className="text-xs text-gray-500">FR差が閾値を超えた銘柄。Scan NowでFRを再取得。</p>
          </div>
          <button
            onClick={triggerScan}
            disabled={scanning}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-lg text-xs font-medium transition"
          >
            {scanning ? "Scanning..." : "Scan Now"}
          </button>
        </div>
        {opportunities.length === 0 ? (
          <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center text-gray-500">
            No opportunities found. Click Scan Now to check.
          </div>
        ) : (
          <div className="space-y-2">
            {opportunities.map((opp, i) => (
              <div key={i} className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg">{opp.base}</span>
                  <span className="px-2 py-0.5 bg-blue-900/50 text-blue-300 rounded text-xs">{opp.type.replace(/_/g, " ")}</span>
                  <span className="text-gray-400 text-sm">{opp.direction}</span>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-mono text-sm">FR: {opp.fr_diff}%</div>
                  <div className="text-gray-500 text-xs">Est. ${opp.net_income} / {opp.hold_settles}x settle</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
