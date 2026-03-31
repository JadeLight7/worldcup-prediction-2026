import { createConfig, configureChains } from 'wagmi'
import { hardhat, localhost } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { getDefaultWallets } from '@rainbow-me/rainbowkit'

const { chains, publicClient } = configureChains(
  [hardhat, localhost],
  [publicProvider()]
)

const { connectors } = getDefaultWallets({
  appName: 'World Cup Prediction Market',
  projectId: 'YOUR_PROJECT_ID',
  chains,
})

export const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
})

export { chains }
