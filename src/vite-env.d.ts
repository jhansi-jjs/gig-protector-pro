/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_API_URL?: string;
  readonly VITE_PRICING_API_URL?: string;
  readonly VITE_RAZORPAY_KEY_ID?: string;
  readonly VITE_RAZORPAY_SECRET?: string;
  readonly VITE_PAYOUT_API_URL?: string;
  readonly VITE_HOODI_CHAIN_ID_HEX?: string;
  readonly VITE_HOODI_AUDIT_RECEIVER_ADDRESS?: string;
  readonly VITE_HOODI_EXPLORER_TX_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
