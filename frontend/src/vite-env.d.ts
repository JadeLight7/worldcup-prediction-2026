/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MOCK_USDC_ADDRESS: string
  readonly VITE_CONDITIONAL_TOKENS_ADDRESS: string
  readonly VITE_FACTORY_ADDRESS: string
  readonly VITE_CHAIN_ID: string
  readonly VITE_RPC_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
