export interface User {
  id: string;
  email: string;
  display_name: string | null;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface ApiKeyStatus {
  exchange: string;
  is_configured: boolean;
  is_valid: boolean;
  last_verified: string | null;
}

export interface UserSettings {
  total_capital: number;
  position_ratio: number;
  p1_enabled: boolean;
  p1_min_fr_diff: number;
  p1_max_slots: number;
  p1_amount_per_slot: number;
  p2_enabled: boolean;
  p2_min_fr_diff: number;
  p2_max_slots: number;
  p2_amount_per_slot: number;
  p3_enabled: boolean;
  p3_min_fr_rate: number;
  p3_max_slots: number;
  p3_amount_per_slot: number;
  leverage: number;
  min_volume_24h: number;
  order_type: string;
  auto_enabled: boolean;
  max_per_trade: number;
  max_daily_loss: number;
  max_open_positions: number;
  telegram_bot_token: string | null;
  telegram_chat_id: string | null;
  discord_webhook: string | null;
}

export interface Position {
  id: string;
  type: string;
  base: string;
  legs: Record<string, unknown>;
  amount_usd: number | null;
  leverage: number | null;
  fr_rate: number | null;
  status: string;
  opened_at: string;
  closed_at: string | null;
  actual_pnl: number | null;
}

export interface Opportunity {
  type: string;
  base: string;
  direction: string;
  exchanges: string[];
  fr_diff: number;
  net_income: number;
  hold_settles: number;
}

export interface PnLSummary {
  period: string;
  trades: number;
  total_pnl: number;
}

export interface FRScanResult {
  exchange: string;
  base: string;
  quote: string;
  fr_rate: number;
  abs_fr: number;
  vol_24h: number;
  mark_price: number;
  next_funding_time: number;
  scan_time: string;
}
