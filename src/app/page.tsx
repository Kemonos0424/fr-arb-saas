"use client";
import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function LandingPage() {
  const { user, loading, login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const authRef = useRef<HTMLDivElement>(null);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    if (typeof window !== "undefined") window.location.href = "/dashboard";
    return null;
  }

  const scrollToAuth = () => authRef.current?.scrollIntoView({ behavior: "smooth" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, displayName, invitationCode);
      }
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed";
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        setError("Server unreachable. Please check if the backend is running.");
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent" />
        <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center relative">
          <div className="inline-block px-3 py-1 bg-blue-900/30 border border-blue-800/50 rounded-full text-blue-400 text-xs font-medium mb-6">
            Funding Rate Arbitrage Platform
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            取引所間の<span className="text-blue-400">金利差</span>で<br />安定的に利益を獲得
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            6つの取引所のFunding Rate（資金調達率）をリアルタイム監視。
            ヘッジポジションで価格リスクをゼロにし、FR差額のみを利益として獲得します。
          </p>
          <button onClick={scrollToAuth}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition text-lg">
            Start Free
          </button>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-12">仕組み</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
            <div className="w-12 h-12 bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4 text-2xl">1</div>
            <h3 className="font-semibold mb-2">FR差を検出</h3>
            <p className="text-gray-400 text-sm">
              BingX, Bitget, BitMart, Bybit, MEXC, Phemex の6取引所からFunding Rate（資金調達率）を一括取得。取引所間の差を自動分析します。
            </p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
            <div className="w-12 h-12 bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-4 text-2xl">2</div>
            <h3 className="font-semibold mb-2">ヘッジエントリー</h3>
            <p className="text-gray-400 text-sm">
              FR率が高い取引所でショート、低い取引所でロング。同じ銘柄を両建てするので価格変動リスクはほぼゼロです。
            </p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
            <div className="w-12 h-12 bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-4 text-2xl">3</div>
            <h3 className="font-semibold mb-2">FR決済で利益確定</h3>
            <p className="text-gray-400 text-sm">
              8時間ごとのFR決済タイミングで差額を受け取り。決済完了後に自動クローズし、利益を確定します。
            </p>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "6取引所対応", desc: "主要DEX/CEXをカバー" },
            { label: "自動スキャン", desc: "8h毎に全銘柄スキャン" },
            { label: "Telegram通知", desc: "エントリー/決済を通知" },
            { label: "リスク管理", desc: "日次損失上限・自動停止" },
          ].map((f) => (
            <div key={f.label} className="bg-gray-900/50 rounded-lg p-4 border border-gray-800/50">
              <div className="font-medium text-sm">{f.label}</div>
              <div className="text-gray-500 text-xs mt-1">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Plans ── */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-center mb-8">プラン</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="text-lg font-bold mb-1">Free</div>
            <div className="text-3xl font-bold mb-4">$0<span className="text-sm text-gray-500 font-normal">/mo</span></div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2"><span className="text-green-400">+</span> FRスキャン・分析</li>
              <li className="flex items-center gap-2"><span className="text-green-400">+</span> 取引所APIキー登録</li>
              <li className="flex items-center gap-2"><span className="text-green-400">+</span> 手動エントリー・決済</li>
              <li className="flex items-center gap-2"><span className="text-green-400">+</span> ポジション管理</li>
              <li className="flex items-center gap-2 text-gray-600"><span>-</span> Auto Trading</li>
              <li className="flex items-center gap-2 text-gray-600"><span>-</span> Telegram/Discord通知</li>
            </ul>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border-2 border-blue-600 relative">
            <div className="absolute -top-3 left-6 px-3 py-0.5 bg-blue-600 rounded-full text-xs font-medium">Recommended</div>
            <div className="text-lg font-bold mb-1">Pro</div>
            <div className="text-3xl font-bold mb-4">$29<span className="text-sm text-gray-500 font-normal">/mo</span></div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2"><span className="text-green-400">+</span> Freeの全機能</li>
              <li className="flex items-center gap-2"><span className="text-blue-400">+</span> Auto Trading（全自動運用）</li>
              <li className="flex items-center gap-2"><span className="text-blue-400">+</span> Telegram/Discord通知</li>
              <li className="flex items-center gap-2"><span className="text-blue-400">+</span> 優先サポート</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── Auth Form ── */}
      <section ref={authRef} className="max-w-md mx-auto px-4 py-16">
        <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden">
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-3 text-sm font-medium transition ${
                mode === "login"
                  ? "text-blue-400 border-b-2 border-blue-400 bg-gray-800/30"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setMode("register"); setError(""); }}
              className={`flex-1 py-3 text-sm font-medium transition ${
                mode === "register"
                  ? "text-blue-400 border-b-2 border-blue-400 bg-gray-800/30"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Register
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {mode === "register" && (
              <>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Display Name</label>
                  <input type="text" placeholder="Your name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Invitation Code</label>
                  <input type="text" placeholder="Enter invitation code" value={invitationCode} onChange={(e) => setInvitationCode(e.target.value)} required
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
                </div>
              </>
            )}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Email</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Password</label>
              <input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-sm" />
            </div>
            {error && (
              <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <button type="submit" disabled={submitting}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg font-medium transition text-sm">
              {submitting ? (mode === "login" ? "Logging in..." : "Creating account...") : (mode === "login" ? "Login" : "Create Account")}
            </button>
          </form>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-800 py-8 text-center text-gray-600 text-xs">
        FR Arbitrage - Cross-exchange funding rate arbitrage automation
      </footer>
    </div>
  );
}
