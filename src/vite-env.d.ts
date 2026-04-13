/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PRICING_API_URL?: string;
  readonly VITE_RAZORPAY_KEY_ID?: string;
  readonly VITE_RAZORPAY_SECRET?: string;
  readonly VITE_PAYOUT_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
