"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import type { UserSettings, ApiKeyStatus } from "@/lib/types";

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [keys, setKeys] = useState<ApiKeyStatus[]>([]);
  const [saving, setSaving] = useState(false);
  const [testingNotif, setTestingNotif] = useState(false);
  const [notifResult, setNotifResult] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    if (!user) return;
    api.get<UserSettings>("/settings/").then(setSettings);
    api.get<ApiKeyStatus[]>("/keys/").then(setKeys);
  }, [user]);

  if (loading || !user) return <div className="p-8">Loading...</div>;
  if (!settings) return <div className="p-8">Loading settings...</div>;

  const save = async () => {
    setSaving(true);
    try {
      const updated = await api.put<UserSettings>("/settings/", settings);
      setSettings(updated);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Settings</h1>
        <a href="/dashboard" className="text-blue-400 hover:underline">Back to Dashboard</a>
      </div>

      {/* API Keys */}
      <section className="bg-gray-900 rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Exchange API Keys</h2>
        <div className="space-y-3">
          {keys.map((k) => (
            <div key={k.exchange} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
              <div className="capitalize font-medium">{k.exchange}</div>
              <div className="flex items-center gap-3">
                <span className={`text-sm ${k.is_configured ? (k.is_valid ? "text-green-400" : "text-yellow-400") : "text-gray-500"}`}>
                  {k.is_configured ? (k.is_valid ? "Valid" : "Unverified") : "Not configured"}
                </span>
                <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm">
                  {k.is_configured ? "Update" : "Add"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Strategy Settings */}
      <section className="bg-gray-900 rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-semibold">Strategy Settings</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400">Total Capital ($)</label>
            <input type="number" value={settings.total_capital} onChange={e => setSettings({...settings, total_capital: +e.target.value})}
              className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg" />
          </div>
          <div>
            <label className="text-sm text-gray-400">Leverage</label>
            <input type="number" value={settings.leverage} onChange={e => setSettings({...settings, leverage: +e.target.value})}
              className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg" />
          </div>
        </div>

        {/* P1 */}
        <div className="border-t border-gray-800 pt-4">
          <div className="flex items-center gap-3 mb-3">
            <input type="checkbox" checked={settings.p1_enabled} onChange={e => setSettings({...settings, p1_enabled: e.target.checked})} />
            <span className="font-medium">P1: Intra-exchange USDT/USDC Cross</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-400">Min FR Diff (%)</label>
              <input type="number" step="0.01" value={settings.p1_min_fr_diff} onChange={e => setSettings({...settings, p1_min_fr_diff: +e.target.value})}
                className="w-full mt-1 px-3 py-1 bg-gray-800 border border-gray-700 rounded" />
            </div>
            <div>
              <label className="text-xs text-gray-400">Max Slots</label>
              <input type="number" value={settings.p1_max_slots} onChange={e => setSettings({...settings, p1_max_slots: +e.target.value})}
                className="w-full mt-1 px-3 py-1 bg-gray-800 border border-gray-700 rounded" />
            </div>
            <div>
              <label className="text-xs text-gray-400">Amount/Slot ($)</label>
              <input type="number" value={settings.p1_amount_per_slot} onChange={e => setSettings({...settings, p1_amount_per_slot: +e.target.value})}
                className="w-full mt-1 px-3 py-1 bg-gray-800 border border-gray-700 rounded" />
            </div>
          </div>
        </div>

        {/* P2 */}
        <div className="border-t border-gray-800 pt-4">
          <div className="flex items-center gap-3 mb-3">
            <input type="checkbox" checked={settings.p2_enabled} onChange={e => setSettings({...settings, p2_enabled: e.target.checked})} />
            <span className="font-medium">P2: Cross-exchange Hedge</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-400">Min FR Diff (%)</label>
              <input type="number" step="0.01" value={settings.p2_min_fr_diff} onChange={e => setSettings({...settings, p2_min_fr_diff: +e.target.value})}
                className="w-full mt-1 px-3 py-1 bg-gray-800 border border-gray-700 rounded" />
            </div>
            <div>
              <label className="text-xs text-gray-400">Max Slots</label>
              <input type="number" value={settings.p2_max_slots} onChange={e => setSettings({...settings, p2_max_slots: +e.target.value})}
                className="w-full mt-1 px-3 py-1 bg-gray-800 border border-gray-700 rounded" />
            </div>
            <div>
              <label className="text-xs text-gray-400">Amount/Slot ($)</label>
              <input type="number" value={settings.p2_amount_per_slot} onChange={e => setSettings({...settings, p2_amount_per_slot: +e.target.value})}
                className="w-full mt-1 px-3 py-1 bg-gray-800 border border-gray-700 rounded" />
            </div>
          </div>
        </div>

        {/* P3 */}
        <div className="border-t border-gray-800 pt-4">
          <div className="flex items-center gap-3 mb-3">
            <input type="checkbox" checked={settings.p3_enabled} onChange={e => setSettings({...settings, p3_enabled: e.target.checked})} />
            <span className="font-medium">P3: Single-leg FR</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-400">Min FR Rate (%)</label>
              <input type="number" step="0.01" value={settings.p3_min_fr_rate} onChange={e => setSettings({...settings, p3_min_fr_rate: +e.target.value})}
                className="w-full mt-1 px-3 py-1 bg-gray-800 border border-gray-700 rounded" />
            </div>
            <div>
              <label className="text-xs text-gray-400">Max Slots</label>
              <input type="number" value={settings.p3_max_slots} onChange={e => setSettings({...settings, p3_max_slots: +e.target.value})}
                className="w-full mt-1 px-3 py-1 bg-gray-800 border border-gray-700 rounded" />
            </div>
            <div>
              <label className="text-xs text-gray-400">Amount/Slot ($)</label>
              <input type="number" value={settings.p3_amount_per_slot} onChange={e => setSettings({...settings, p3_amount_per_slot: +e.target.value})}
                className="w-full mt-1 px-3 py-1 bg-gray-800 border border-gray-700 rounded" />
            </div>
          </div>
        </div>

        {/* Auto trading */}
        <div className="border-t border-gray-800 pt-4">
          <div className="flex items-center gap-3 mb-3">
            <input type="checkbox" checked={settings.auto_enabled}
              onChange={e => {
                const val = e.target.checked;
                api.post(val ? "/settings/auto/on" : "/settings/auto/off");
                setSettings({...settings, auto_enabled: val});
              }} />
            <span className="font-medium">Auto Trading</span>
          </div>
        </div>

        <button onClick={save} disabled={saving}
          className="w-full py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg font-medium transition">
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </section>

      {/* Notifications */}
      <section className="bg-gray-900 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Notifications</h2>

        <div>
          <label className="text-sm text-gray-400">Telegram Bot Token</label>
          <input type="text" value={settings.telegram_bot_token || ""} placeholder="123456:ABC..."
            onChange={e => setSettings({...settings, telegram_bot_token: e.target.value || null})}
            className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg font-mono text-sm" />
        </div>
        <div>
          <label className="text-sm text-gray-400">Telegram Chat ID</label>
          <input type="text" value={settings.telegram_chat_id || ""} placeholder="1234567890"
            onChange={e => setSettings({...settings, telegram_chat_id: e.target.value || null})}
            className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg font-mono text-sm" />
        </div>
        <div>
          <label className="text-sm text-gray-400">Discord Webhook URL</label>
          <input type="text" value={settings.discord_webhook || ""} placeholder="https://discord.com/api/webhooks/..."
            onChange={e => setSettings({...settings, discord_webhook: e.target.value || null})}
            className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg font-mono text-sm" />
        </div>

        <div className="flex items-center gap-4">
          <button onClick={async () => {
            setTestingNotif(true);
            setNotifResult(null);
            try {
              await save();
              const r = await api.post<Record<string, string>>("/settings/test-notification");
              setNotifResult(r);
            } finally {
              setTestingNotif(false);
            }
          }} disabled={testingNotif}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-sm">
            {testingNotif ? "Sending..." : "Test Notification"}
          </button>
          {notifResult && (
            <div className="text-sm">
              {Object.entries(notifResult).map(([k, v]) => (
                <span key={k} className={`mr-3 ${v === "sent" ? "text-green-400" : v === "failed" ? "text-red-400" : "text-gray-500"}`}>
                  {k}: {v}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
