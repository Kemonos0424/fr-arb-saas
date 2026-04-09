"use client";
import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { api } from "@/lib/api";
import type { User, UserSettings, ApiKeyStatus } from "@/lib/types";

const EXCHANGES = ["bingx", "bitget", "bitmart"] as const;

function SettingsContent({ user }: { user: User }) {
  const isPro = user.plan === "pro";
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [keys, setKeys] = useState<ApiKeyStatus[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testingNotif, setTestingNotif] = useState(false);
  const [notifResult, setNotifResult] = useState<Record<string, string> | null>(null);
  const [keyModal, setKeyModal] = useState<string | null>(null);
  const [keyForm, setKeyForm] = useState({ api_key: "", secret_key: "", passphrase: "", memo: "" });
  const [keySaving, setKeySaving] = useState(false);

  useEffect(() => {
    api.get<UserSettings>("/settings").then(setSettings).catch(() => {});
    api.get<ApiKeyStatus[]>("/keys").then(setKeys).catch(() => {});
  }, []);

  if (!settings) {
    return (
      <div className="py-6 text-center text-gray-500">
        Loading settings... (Backend may be offline)
      </div>
    );
  }

  const save = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const updated = await api.put<UserSettings>("/settings", settings);
      setSettings(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const saveKey = async () => {
    if (!keyModal) return;
    setKeySaving(true);
    try {
      await api.post(`/keys/${keyModal}`, keyForm);
      const updated = await api.get<ApiKeyStatus[]>("/keys");
      setKeys(updated);
      setKeyModal(null);
      setKeyForm({ api_key: "", secret_key: "", passphrase: "", memo: "" });
    } finally {
      setKeySaving(false);
    }
  };

  const verifyKey = async (exchange: string) => {
    try {
      await api.post(`/keys/${exchange}/verify`);
      const updated = await api.get<ApiKeyStatus[]>("/keys");
      setKeys(updated);
    } catch { /* ignore */ }
  };

  const deleteKey = async (exchange: string) => {
    await api.delete(`/keys/${exchange}`);
    const updated = await api.get<ApiKeyStatus[]>("/keys");
    setKeys(updated);
  };

  const testNotification = async () => {
    setTestingNotif(true);
    setNotifResult(null);
    try {
      await save();
      const r = await api.post<Record<string, string>>("/settings/test-notification");
      setNotifResult(r);
    } finally {
      setTestingNotif(false);
    }
  };

  const inputCls = "w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-sm";
  const labelCls = "block text-xs text-gray-400 mb-1";

  return (
    <div className="space-y-6 py-6 max-w-3xl mx-auto">
      {/* API Keys */}
      <section className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h2 className="text-lg font-semibold mb-2">Exchange API Keys</h2>
        <p className="text-xs text-gray-500 mb-4">取引所のAPI Key/Secretを登録すると、残高確認・自動発注が可能になります。読み取り専用権限でもスキャン機能は使えます。</p>
        <div className="space-y-3">
          {EXCHANGES.map((ex) => {
            const k = keys.find(k => k.exchange === ex);
            return (
              <div key={ex} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="capitalize font-medium w-20">{ex}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    k?.is_configured
                      ? k.is_valid
                        ? "bg-green-900/50 text-green-400"
                        : "bg-yellow-900/50 text-yellow-400"
                      : "bg-gray-700 text-gray-500"
                  }`}>
                    {k?.is_configured ? (k.is_valid ? "Valid" : "Unverified") : "Not set"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {k?.is_configured && (
                    <>
                      <button onClick={() => verifyKey(ex)} className="px-2 py-1 text-xs text-blue-400 hover:bg-blue-900/30 rounded">
                        Verify
                      </button>
                      <button onClick={() => deleteKey(ex)} className="px-2 py-1 text-xs text-red-400 hover:bg-red-900/30 rounded">
                        Delete
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => { setKeyModal(ex); setKeyForm({ api_key: "", secret_key: "", passphrase: "", memo: "" }); }}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                  >
                    {k?.is_configured ? "Update" : "Add"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* API Key Modal */}
      {keyModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold capitalize">{keyModal} API Key</h3>
            <div>
              <label className={labelCls}>API Key</label>
              <input type="text" value={keyForm.api_key} onChange={e => setKeyForm({...keyForm, api_key: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Secret Key</label>
              <input type="password" value={keyForm.secret_key} onChange={e => setKeyForm({...keyForm, secret_key: e.target.value})} className={inputCls} />
            </div>
            {keyModal === "bitget" && (
              <div>
                <label className={labelCls}>Passphrase</label>
                <input type="text" value={keyForm.passphrase} onChange={e => setKeyForm({...keyForm, passphrase: e.target.value})} className={inputCls} />
              </div>
            )}
            {keyModal === "bitmart" && (
              <div>
                <label className={labelCls}>Memo</label>
                <input type="text" value={keyForm.memo} onChange={e => setKeyForm({...keyForm, memo: e.target.value})} className={inputCls} />
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button onClick={saveKey} disabled={keySaving} className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 rounded-lg text-sm">
                {keySaving ? "Saving..." : "Save Key"}
              </button>
              <button onClick={() => setKeyModal(null)} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Capital & Common */}
      <section className="bg-gray-900 rounded-xl p-6 border border-gray-800 space-y-5">
        <h2 className="text-lg font-semibold">Strategy Settings</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Total Capital ($)</label>
            <p className="text-xs text-gray-600 mb-1">運用に使う総資金額。ポジションサイズの上限計算に使用。</p>
            <input type="number" value={settings.total_capital} onChange={e => setSettings({...settings, total_capital: +e.target.value})} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Leverage</label>
            <p className="text-xs text-gray-600 mb-1">全取引に適用されるレバレッジ倍率。</p>
            <input type="number" value={settings.leverage} onChange={e => setSettings({...settings, leverage: +e.target.value})} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Min Volume 24h ($)</label>
            <input type="number" value={settings.min_volume_24h} onChange={e => setSettings({...settings, min_volume_24h: +e.target.value})} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Max Daily Loss ($)</label>
            <input type="number" value={settings.max_daily_loss} onChange={e => setSettings({...settings, max_daily_loss: +e.target.value})} className={inputCls} />
          </div>
        </div>

        {/* P1 */}
        <StrategySection
          title="P1: Intra-exchange USDT/USDC Cross"
          description="同一取引所内のUSDT建てとUSDC建てのFR差を利用。価格変動リスクが最も低い戦略です。"
          enabled={settings.p1_enabled}
          onToggle={(v) => setSettings({...settings, p1_enabled: v})}
          fields={[
            { label: "Min FR Diff (%)", value: settings.p1_min_fr_diff, onChange: (v: number) => setSettings({...settings, p1_min_fr_diff: v}) },
            { label: "Max Slots", value: settings.p1_max_slots, onChange: (v: number) => setSettings({...settings, p1_max_slots: v}) },
            { label: "Amount/Slot ($)", value: settings.p1_amount_per_slot, onChange: (v: number) => setSettings({...settings, p1_amount_per_slot: v}) },
          ]}
        />

        {/* P2 */}
        <StrategySection
          title="P2: Cross-exchange Hedge"
          description="異なる取引所間のFR差を利用。片方でロング、もう片方でショートでヘッジ。"
          enabled={settings.p2_enabled}
          onToggle={(v) => setSettings({...settings, p2_enabled: v})}
          fields={[
            { label: "Min FR Diff (%)", value: settings.p2_min_fr_diff, onChange: (v: number) => setSettings({...settings, p2_min_fr_diff: v}) },
            { label: "Max Slots", value: settings.p2_max_slots, onChange: (v: number) => setSettings({...settings, p2_max_slots: v}) },
            { label: "Amount/Slot ($)", value: settings.p2_amount_per_slot, onChange: (v: number) => setSettings({...settings, p2_amount_per_slot: v}) },
          ]}
        />

        {/* P3 */}
        <StrategySection
          title="P3: Single-leg FR"
          description="FR率が高い銘柄で片足エントリー。利益率は高いが価格変動リスクあり。"
          enabled={settings.p3_enabled}
          onToggle={(v) => setSettings({...settings, p3_enabled: v})}
          fields={[
            { label: "Min FR Rate (%)", value: settings.p3_min_fr_rate, onChange: (v: number) => setSettings({...settings, p3_min_fr_rate: v}) },
            { label: "Max Slots", value: settings.p3_max_slots, onChange: (v: number) => setSettings({...settings, p3_max_slots: v}) },
            { label: "Amount/Slot ($)", value: settings.p3_amount_per_slot, onChange: (v: number) => setSettings({...settings, p3_amount_per_slot: v}) },
          ]}
        />

        {/* Auto Trading */}
        <div className="border-t border-gray-800 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">Auto Trading</span>
              {!isPro && <span className="ml-2 px-2 py-0.5 bg-yellow-900/30 text-yellow-400 rounded text-xs">Pro</span>}
              <p className="text-xs text-gray-500 mt-0.5">FR決済30分前に自動スキャン → 条件合致で自動エントリー → 決済後に自動クローズ。</p>
            </div>
            {isPro ? (
              <button
                onClick={() => {
                  const val = !settings.auto_enabled;
                  api.post(val ? "/settings/auto/on" : "/settings/auto/off").catch(() => {});
                  setSettings({...settings, auto_enabled: val});
                }}
                className={`relative w-12 h-6 rounded-full transition ${settings.auto_enabled ? "bg-green-600" : "bg-gray-700"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.auto_enabled ? "translate-x-6" : "translate-x-0.5"}`} />
              </button>
            ) : (
              <div className="relative w-12 h-6 rounded-full bg-gray-800 opacity-50 cursor-not-allowed">
                <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-gray-600 rounded-full" />
              </div>
            )}
          </div>
          {!isPro && (
            <div className="mt-3 p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-800/30 rounded-lg">
              <p className="text-sm text-gray-300 mb-2">Auto Tradingは<strong className="text-blue-400">Proプラン</strong>で利用可能です。</p>
              <p className="text-xs text-gray-500 mb-3">月額$29で全自動運用・通知機能が解放されます。</p>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition">
                Upgrade to Pro
              </button>
            </div>
          )}
          {isPro && settings.auto_enabled && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className={labelCls}>Max Per Trade ($)</label>
                <input type="number" value={settings.max_per_trade} onChange={e => setSettings({...settings, max_per_trade: +e.target.value})} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Max Open Positions</label>
                <input type="number" value={settings.max_open_positions} onChange={e => setSettings({...settings, max_open_positions: +e.target.value})} className={inputCls} />
              </div>
            </div>
          )}
        </div>

        <button onClick={save} disabled={saving}
          className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 rounded-lg font-medium transition text-sm">
          {saving ? "Saving..." : saved ? "Saved!" : "Save Settings"}
        </button>
      </section>

      {/* Notifications */}
      <section className="bg-gray-900 rounded-xl p-6 border border-gray-800 space-y-4">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <p className="text-xs text-gray-500">Receive alerts when positions are opened or closed automatically.</p>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className={labelCls}>Telegram Bot Token</label>
            <input type="text" value={settings.telegram_bot_token || ""} placeholder="123456:ABC-DEF..."
              onChange={e => setSettings({...settings, telegram_bot_token: e.target.value || null})} className={`${inputCls} font-mono`} />
          </div>
          <div>
            <label className={labelCls}>Telegram Chat ID</label>
            <input type="text" value={settings.telegram_chat_id || ""} placeholder="1234567890"
              onChange={e => setSettings({...settings, telegram_chat_id: e.target.value || null})} className={`${inputCls} font-mono`} />
          </div>
          <div>
            <label className={labelCls}>Discord Webhook URL</label>
            <input type="text" value={settings.discord_webhook || ""} placeholder="https://discord.com/api/webhooks/..."
              onChange={e => setSettings({...settings, discord_webhook: e.target.value || null})} className={`${inputCls} font-mono`} />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={testNotification} disabled={testingNotif}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-lg text-sm transition">
            {testingNotif ? "Sending..." : "Test Notification"}
          </button>
          {notifResult && (
            <div className="flex gap-3 text-sm">
              {Object.entries(notifResult).map(([k, v]) => (
                <span key={k} className={`${v === "sent" ? "text-green-400" : v === "failed" ? "text-red-400" : "text-gray-500"}`}>
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

function StrategySection({ title, description, enabled, onToggle, fields }: {
  title: string;
  description?: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  fields: { label: string; value: number; onChange: (v: number) => void }[];
}) {
  return (
    <div className="border-t border-gray-800 pt-4">
      <label className="flex items-center gap-3 mb-1 cursor-pointer">
        <input type="checkbox" checked={enabled} onChange={e => onToggle(e.target.checked)}
          className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500" />
        <span className="font-medium">{title}</span>
      </label>
      {description && <p className="text-xs text-gray-500 pl-7 mb-3">{description}</p>}
      {enabled && (
        <div className="grid grid-cols-3 gap-3 pl-7">
          {fields.map((f) => (
            <div key={f.label}>
              <label className="block text-xs text-gray-400 mb-1">{f.label}</label>
              <input type="number" step="0.01" value={f.value} onChange={e => f.onChange(+e.target.value)}
                className="w-full px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm focus:outline-none focus:border-blue-500" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AuthGuard>
      {(user: User) => <SettingsContent user={user} />}
    </AuthGuard>
  );
}
