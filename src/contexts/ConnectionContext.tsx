import { ExternalProvider, Web3Provider } from '@ethersproject/providers'
import { createContext, useContext, useEffect, useState } from 'react'
import { Spinner } from 'src/components/Spinner'
import Web3 from 'web3'
import { ConnectWalletModal } from '../components/ConnectWalletModal'
import { ChainToNumber, ChainType } from '../types/ChainType'

export type ConnectionData = {
  web3: Web3 | undefined
  currentAccount: string | undefined
  currentChain: ChainType | undefined
}

export interface ConnectionContextType extends ConnectionData {
  walletsMap: Map<WalletType, ExternalProvider>
  connect: (wallet?: WalletType) => Promise<void>
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

  const getWalletByType = (type?: WalletType): any | undefined => {
    const ethereum = (window as any).ethereum
    if (ethereum.providers?.length) {
      return ethereum.providerMap.get(type)
    } else {
      if (!type) return ethereum
      if (ethereum.isMetaMask && type === WalletType.MetaMask) {
        return ethereum
      }
      if (ethereum.isCoinbaseWallet && type === WalletType.CoinbaseWallet) {
        return ethereum
      } else return ethereum
    }
  }

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
      const accounts = (await newProvider.provider.request!({ method: 'eth_requestAccounts' })) || []
      const currentAddress = accounts.length > 0 ? accounts[0] : undefined
      const currentQueryChain = new URLSearchParams(window.location.search).get('chain') as ChainType | undefined
      const currentStorageChain = localStorage.getItem(LOCAL_STORAGE_KEY_LAST_CHAIN) as ChainType | undefined
      const currentChain = currentQueryChain || currentStorageChain || ChainType.ETHEREUM
      if (currentAddress) {
        updateConnectionData({
          currentAccount: currentAddress,
        })
        setCurrentProvider(newProvider)
      }
      await changeNetwork(currentChain)
    } catch (e) {
      throw e
    }
  }

  const getLastProvider = (): ExternalProvider | undefined => {
    const ethereum = (window as any).ethereum
    if (ethereum) {
      if (ethereum.providers?.length) {
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
    setConnectionData({ ...connectionData, ...data })
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
      // Autoconnect disabled

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
      if (ethereum.providers?.length) {
        updateWalletsMap(new Map(ethereum.providerMap))
      } else {
        const coinbaseWallet = ((window as any).coinbaseWalletExtension as Web3Provider) || undefined
        if (ethereum.isMetaMask) {
          updateWalletsMap(new Map([[WalletType.MetaMask, ethereum]]))
        } else if (ethereum.isCoinbaseWallet) {
          updateWalletsMap(new Map([[WalletType.CoinbaseWallet, ethereum]]))
        } else if (ethereum.isZerion) {
          const newMap = new Map([[WalletType.Zerion, ethereum]])
          if (coinbaseWallet) {
            newMap.set(WalletType.CoinbaseWallet, coinbaseWallet)
          }
          updateWalletsMap(newMap)
        }
      }
    }
    setTimeout(() => setIsReady(true), 1000)
  }

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
        changeNetwork,
        isReady,
      }}
    >
      {isReady ? connectionData.currentAccount ? children : <ConnectWalletModal /> : <Spinner />}
    </ConnectionContext.Provider>
  )
}

const useConnection = () => {
  const { web3, currentAccount, currentChain, walletsMap, connect, changeNetwork, isReady } =
    useContext(ConnectionContext)
  return {
    web3,
    currentAccount,
    currentChain,
    walletsMap,
    connect,
    changeNetwork,
    isReady,
  }
}

export { ConnectionContext, ConnectionProvider, useConnection }
