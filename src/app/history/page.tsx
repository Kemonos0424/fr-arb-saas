"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

interface TradeLog {
  id: number;
  action: string;
  type: string | null;
  base: string | null;
  exchange: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const [trades, setTrades] = useState<TradeLog[]>([]);

  useEffect(() => {
    if (!user) return;
    api.get<TradeLog[]>("/trade/history?limit=100").then(setTrades);
  }, [user]);

  if (loading || !user) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Trade History</h1>
        <a href="/dashboard" className="text-blue-400 hover:underline">Back to Dashboard</a>
      </div>

      <div className="bg-gray-900 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-gray-400">
            <tr>
              <th className="px-4 py-3 text-left">Time</th>
              <th className="px-4 py-3 text-left">Action</th>
              <th className="px-4 py-3 text-left">Base</th>
              <th className="px-4 py-3 text-left">Exchange</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Details</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((t) => (
              <tr key={t.id} className="border-t border-gray-800 hover:bg-gray-800/50">
                <td className="px-4 py-3 font-mono text-xs">{new Date(t.created_at).toLocaleString("ja-JP")}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${t.action === "entry" ? "bg-blue-900 text-blue-300" : t.action === "close" ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300"}`}>
                    {t.action}
                  </span>
                </td>
                <td className="px-4 py-3 font-bold">{t.base || "-"}</td>
                <td className="px-4 py-3">{t.exchange || "-"}</td>
                <td className="px-4 py-3 text-gray-400">{t.type || "-"}</td>
                <td className="px-4 py-3 text-xs text-gray-500 font-mono max-w-xs truncate">
                  {t.details ? JSON.stringify(t.details) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {trades.length === 0 && <p className="text-center text-gray-500 py-8">No trade history</p>}
      </div>
    </div>
  );
}
