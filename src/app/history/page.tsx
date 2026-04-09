"use client";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
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

function HistoryContent() {
  const [logs, setLogs] = useState<TradeLog[]>([]);

  useEffect(() => {
    api.get<TradeLog[]>("/trade/history?limit=100").then(setLogs).catch(() => {});
  }, []);

  const actionBadge = (action: string) => {
    const map: Record<string, string> = {
      entry: "bg-green-900/50 text-green-400",
      close: "bg-blue-900/50 text-blue-400",
      error: "bg-red-900/50 text-red-400",
    };
    return map[action] || "bg-gray-700 text-gray-400";
  };

  return (
    <div className="space-y-6 py-6">
      <h1 className="text-xl font-bold">Trade History</h1>
      {logs.length === 0 ? (
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 text-center text-gray-500">
          No trade history yet.
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-800 bg-gray-800/30">
                  <th className="text-left py-2.5 px-3 font-medium">Time</th>
                  <th className="text-left py-2.5 px-3 font-medium">Action</th>
                  <th className="text-left py-2.5 px-3 font-medium">Base</th>
                  <th className="text-left py-2.5 px-3 font-medium">Exchange</th>
                  <th className="text-left py-2.5 px-3 font-medium">Type</th>
                  <th className="text-left py-2.5 px-3 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-800/30 hover:bg-gray-800/20">
                    <td className="py-2 px-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${actionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-bold">{log.base || "-"}</td>
                    <td className="py-2 px-3 text-gray-300 capitalize">{log.exchange || "-"}</td>
                    <td className="py-2 px-3 text-gray-400">{log.type || "-"}</td>
                    <td className="py-2 px-3 text-gray-500 text-xs max-w-xs truncate">
                      {log.details ? Object.entries(log.details).map(([k, v]) => `${k}: ${v}`).join(", ") : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  return (
    <AuthGuard>
      <HistoryContent />
    </AuthGuard>
  );
}
