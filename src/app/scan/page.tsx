"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import type { FRScanResult, Opportunity } from "@/lib/types";

export default function ScanPage() {
  const { user, loading, logout } = useAuth();
  const [scanResults, setScanResults] = useState<FRScanResult[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [scanning, setScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<string | null>(null);
  const [entryLoading, setEntryLoading] = useState<string | null>(null);
  const [confirmEntry, setConfirmEntry] = useState<Opportunity | null>(null);

  const loadData = async () => {
    const [scan, opps] = await Promise.all([
      api.get<FRScanResult[]>("/scan/latest").catch(() => []),
      api.get<Opportunity[]>("/scan/opportunities").catch(() => []),
    ]);
    setScanResults(scan);
    setOpportunities(opps);
    if (scan.length > 0) {
      setLastScanTime(scan[0].scan_time);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const triggerScan = async () => {
    setScanning(true);
    try {
      await api.post("/scan/trigger");
      await loadData();
    } finally {
      setScanning(false);
    }
  };

  const executeEntry = async (opp: Opportunity) => {
    setEntryLoading(opp.base);
    try {
      const side = opp.direction.includes("LONG") ? "BUY" : "SELL";
      const exchange = opp.exchanges[0];
      await api.post("/trade/entry", {
        type: opp.type,
        base: opp.base,
        side,
        exchange,
        amount_usdt: 250,
        leverage: 20,
      });
      setConfirmEntry(null);
      await loadData();
    } catch (e: unknown) {
      alert(`Entry failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setEntryLoading(null);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) {
    if (typeof window !== "undefined") window.location.href = "/";
    return null;
  }

  const frColor = (rate: number) =>
    rate > 0 ? "text-green-400" : rate < 0 ? "text-red-400" : "text-gray-400";

  const typeBadge = (type: string) => {
    if (type.includes("p2") || type.includes("cross"))
      return <span className="px-2 py-0.5 bg-blue-900 text-blue-300 rounded text-xs">P2</span>;
    if (type.includes("p3") || type.includes("single"))
      return <span className="px-2 py-0.5 bg-purple-900 text-purple-300 rounded text-xs">P3</span>;
    if (type.includes("p1") || type.includes("intra"))
      return <span className="px-2 py-0.5 bg-cyan-900 text-cyan-300 rounded text-xs">P1</span>;
    return <span className="px-2 py-0.5 bg-gray-700 rounded text-xs">{type}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">FR Scan</h1>
        <div className="flex items-center gap-4">
          <a href="/dashboard" className="text-blue-400 hover:underline">Dashboard</a>
          <a href="/settings" className="text-blue-400 hover:underline">Settings</a>
          <a href="/history" className="text-blue-400 hover:underline">History</a>
          <button onClick={logout} className="text-gray-500 hover:text-red-400">Logout</button>
        </div>
      </div>

      {/* Scan Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={triggerScan}
          disabled={scanning}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-lg font-medium"
        >
          {scanning ? "Scanning..." : "Scan Now"}
        </button>
        {lastScanTime && (
          <span className="text-gray-400 text-sm">
            Last scan: {new Date(lastScanTime).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}
          </span>
        )}
        <span className="text-gray-500 text-sm">{scanResults.length} results</span>
      </div>

      {/* Entry Confirmation Dialog */}
      {confirmEntry && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold">Confirm Entry</h3>
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-400">Base:</span> {confirmEntry.base}</div>
              <div><span className="text-gray-400">Type:</span> {confirmEntry.type}</div>
              <div><span className="text-gray-400">Direction:</span> {confirmEntry.direction}</div>
              <div><span className="text-gray-400">FR Diff:</span> {confirmEntry.fr_diff}%</div>
              <div><span className="text-gray-400">Est. Income:</span> ${confirmEntry.net_income}</div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => executeEntry(confirmEntry)}
                disabled={entryLoading !== null}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 rounded-lg"
              >
                {entryLoading ? "Placing..." : "Execute Entry"}
              </button>
              <button
                onClick={() => setConfirmEntry(null)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Opportunities */}
      <div>
        <h2 className="text-lg font-semibold mb-3">
          Opportunities ({opportunities.length})
        </h2>
        {opportunities.length === 0 ? (
          <p className="text-gray-500">No opportunities found. Try scanning.</p>
        ) : (
          <div className="space-y-2">
            {opportunities.map((opp, i) => (
              <div key={i} className="bg-gray-900 rounded-lg p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {typeBadge(opp.type)}
                  <span className="font-bold text-lg">{opp.base}</span>
                  <span className="text-gray-400">{opp.direction}</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-green-400 font-mono">
                      {opp.fr_diff}%
                    </div>
                    <div className="text-gray-400 text-sm">
                      Est. ${opp.net_income} / {opp.hold_settles} settle
                    </div>
                  </div>
                  <button
                    onClick={() => setConfirmEntry(opp)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium"
                  >
                    Entry
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scan Results Table */}
      <div>
        <h2 className="text-lg font-semibold mb-3">FR Rates</h2>
        {scanResults.length === 0 ? (
          <p className="text-gray-500">No scan data. Click Scan Now.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800">
                  <th className="text-left py-2 px-3">Base</th>
                  <th className="text-left py-2 px-3">Exchange</th>
                  <th className="text-right py-2 px-3">FR Rate</th>
                  <th className="text-right py-2 px-3">|FR|</th>
                  <th className="text-right py-2 px-3">Volume 24h</th>
                  <th className="text-right py-2 px-3">Mark Price</th>
                  <th className="text-right py-2 px-3">Next Funding</th>
                </tr>
              </thead>
              <tbody>
                {scanResults.map((r, i) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                    <td className="py-2 px-3 font-bold">{r.base}</td>
                    <td className="py-2 px-3 text-gray-300 capitalize">{r.exchange}</td>
                    <td className={`py-2 px-3 text-right font-mono ${frColor(r.fr_rate)}`}>
                      {(r.fr_rate * 100).toFixed(4)}%
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-gray-300">
                      {(r.abs_fr * 100).toFixed(4)}%
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-gray-400">
                      {r.vol_24h >= 1_000_000
                        ? `$${(r.vol_24h / 1_000_000).toFixed(1)}M`
                        : `$${(r.vol_24h / 1_000).toFixed(0)}K`}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-gray-400">
                      ${r.mark_price < 1 ? r.mark_price.toPrecision(4) : r.mark_price.toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-right text-gray-500 text-xs">
                      {r.next_funding_time
                        ? new Date(r.next_funding_time).toLocaleTimeString("ja-JP", { timeZone: "Asia/Tokyo" })
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
