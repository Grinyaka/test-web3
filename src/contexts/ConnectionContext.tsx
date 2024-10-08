import { ExternalProvider, Web3Provider } from '@ethersproject/providers'
import { createContext, useContext, useEffect, useState } from 'react'
import { Spinner } from 'src/components/Spinner'
import Web3 from 'web3'
import { ConnectWalletModal } from '../components/ConnectWalletModal'
import { ChainToNumber, ChainType, NumberToChain } from '../types/ChainType'

export type ConnectionData = {
  web3: Web3 | undefined
  currentAccount: string | undefined
  currentChain: ChainType | undefined
}

export interface ConnectionContextType extends ConnectionData {
  walletsMap: Map<WalletType, ExternalProvider>
  connect: (wallet?: WalletType) => Promise<void>
  disconnect: () => void
  changeNetwork: (chain: ChainType) => Promise<void>
  isReady: boolean
}

export enum WalletType {
  MetaMask = 'MetaMask',
  CoinbaseWallet = 'Coinbase',
  Zerion = 'Zerion',
}

const ConnectionContext = createContext<ConnectionContextType>({
  web3: undefined,
  currentAccount: undefined,
  currentChain: undefined,
  walletsMap: new Map(),
  connect: async () => {},
  disconnect: () => {},
  changeNetwork: async () => {},
  isReady: false,
})

export const LOCAL_STORAGE_KEY_LAST_CHAIN = 'lastSelectedChain'

const ConnectionProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentProvider, setCurrentProvider] = useState<Web3Provider | undefined>(undefined)
  const [connectionData, setConnectionData] = useState<ConnectionData>({
    web3: undefined,
    currentAccount: undefined,
    currentChain: undefined,
  })
  const [walletsMap, updateWalletsMap] = useState<Map<WalletType, ExternalProvider>>(new Map())
  const [isReady, setIsReady] = useState(false)

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setIsReady(false)
    }
    updateConnectionData({
      currentAccount: accounts.length > 0 ? accounts[0] : undefined,
    })
    setIsReady(true)
  }

  const connect = async (wallet: WalletType) => {
    const currentWallet = walletsMap.get(wallet) as any
    const newProvider = new Web3Provider(currentWallet)
    try {
      currentWallet.on('accountsChanged', (accounts: string[]) => handleAccountsChanged(accounts))
      currentWallet.on('chainChanged', (chainId: string) => {
        const chain = NumberToChain(parseInt(chainId))
        updateConnectionData({
          currentChain: chain,
        })
      })
      const accounts =
        (await newProvider.provider.request!({ method: 'eth_requestAccounts' }).catch((e) => console.warn(e))) || []
      const currentAddress = accounts.length > 0 ? accounts[0] : undefined
      const currentQueryChain = new URLSearchParams(window.location.search).get('chain') as ChainType | undefined
      const currentStorageChain = localStorage.getItem(LOCAL_STORAGE_KEY_LAST_CHAIN) as ChainType | undefined
      const currentChain = currentQueryChain || currentStorageChain || ChainType.ETHEREUM
      if (currentAddress) {
        updateConnectionData({
          currentAccount: currentAddress,
        })
      }
      if (currentChain) {
        updateConnectionData({
          currentChain: currentChain,
        })
      }
      setCurrentProvider(newProvider)
    } catch (e) {
      throw e
    }
  }

  const disconnect = () => {
    currentProvider?.removeAllListeners()
    setConnectionData({
      web3: undefined,
      currentAccount: undefined,
      currentChain: undefined,
    })
    setCurrentProvider(undefined)
  }

  const getLastProvider = (): ExternalProvider | undefined => {
    const ethereum = (window as any).ethereum
    if (ethereum) {
      if (ethereum.providers?.length && ethereum.providers.length > 1) {
        const lastProvider = [...ethereum.providerMap.values()].find((provider) => !!provider.selectedAddress)
        if (lastProvider) {
          return lastProvider
        } else {
          return ethereum
        }
      } else {
        return ethereum
      }
    } else {
      return undefined
    }
  }

  const updateConnectionData = (data: Partial<ConnectionData>): void => {
    setConnectionData((prev) => ({ ...prev, ...data }))
  }
  const changeNetwork = async (chain: ChainType) => {
    localStorage.setItem(LOCAL_STORAGE_KEY_LAST_CHAIN, chain)
    if (currentProvider) {
      try {
        await currentProvider.send('wallet_switchEthereumChain', [
          { chainId: `0x${ChainToNumber(chain).toString(16)}` },
        ])
      } catch (e) {
        throw new Error('User rejected chain change', e)
      }
    }
  }

  const initConnection = async () => {
    const ethereum = (window as any).ethereum

    if (ethereum !== undefined) {
      // try {
      //   const lastProvider = getLastProvider()
      //   const accounts = await ethereum.request({ method: 'eth_accounts' })
      //   if (accounts.length > 0) {
      //     await connect(
      //       lastProvider?.isMetaMask ?
      //         WalletType.MetaMask :
      //         // @ts-ignore
      //         lastProvider?.isZerion ?
      //         WalletType.Zerion :
      //         WalletType.CoinbaseWallet || undefined
      //       )
      //   }
      // } catch (error) {
      //   throw error
      // }
      if (ethereum.providers?.length && ethereum.providers.length > 1) {
        updateWalletsMap(new Map(ethereum.providerMap))
      } else {
        const coinbaseWallet = ((window as any).coinbaseWalletExtension as ExternalProvider) || undefined
        const allWallets = new Map<WalletType, ExternalProvider>()
        if (ethereum.isMetaMask) {
          allWallets.set(WalletType.MetaMask, ethereum)
        } else if (ethereum.isCoinbaseWallet) {
          allWallets.set(WalletType.CoinbaseWallet, ethereum)
        } else if (ethereum.isZerion) {
          allWallets.set(WalletType.Zerion, ethereum)
          if (coinbaseWallet) {
            allWallets.set(WalletType.CoinbaseWallet, coinbaseWallet)
          }
        }
        updateWalletsMap(allWallets)
      }
    }
    setTimeout(() => setIsReady(true))
  }

  useEffect(() => {
    if (walletsMap.size === 1 && !connectionData.currentAccount) {
      connect(Array.from(walletsMap.keys())[0])
    }
  }, [walletsMap.size])

  useEffect(() => {
    initConnection()
  }, [])

  return (
    <ConnectionContext.Provider
      value={{
        web3: connectionData.web3,
        currentAccount: connectionData.currentAccount,
        currentChain: connectionData.currentChain,
        walletsMap,
        connect,
        disconnect,
        changeNetwork,
        isReady,
      }}
    >
      {isReady ? connectionData.currentAccount ? children : <ConnectWalletModal /> : <Spinner />}
    </ConnectionContext.Provider>
  )
}

const useConnection = () => {
  const { web3, currentAccount, currentChain, walletsMap, connect, disconnect, changeNetwork, isReady } =
    useContext(ConnectionContext)
  return {
    web3,
    currentAccount,
    currentChain,
    walletsMap,
    disconnect,
    connect,
    changeNetwork,
    isReady,
  }
}

export { ConnectionContext, ConnectionProvider, useConnection }
