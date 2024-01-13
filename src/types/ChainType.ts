export enum ChainType {
  BINANCE = 'BINANCE',
  ETHEREUM = 'ETHEREUM',
  POLYGON = 'POLYGON',
  ARBITRUM = 'ARBITRUM',
  FANTOM = 'FANTOM',
  AVAX = 'AVAX',
  SOLANA = 'SOLANA',
  ROPSTEN = 'ROPSTEN',
  MOONRIVER = 'MOONRIVER',
  OPTIMISM = 'OPTIMISM',
  BASE = 'BASE',

  UNDEFINED = 'UNDEFINED',
}

export enum ChainSupportType {
  BINANCE = 56,
  ETHEREUM = 1,
  POLYGON = 137,
  ARBITRUM = 42161,
  FANTOM = 250,
  AVAX = 43114,
  SOLANA = 34234234,
  ROPSTEN = 3,
  MOONRIVER = 1285,
  OPTIMISM = 10,
  BASE = 8453,
  UNDEFINED = -1,
}

export const NumberToChain = (value: number) => ChainType[ChainSupportType[value] || ChainSupportType.UNDEFINED]

export const ChainToNumber = (value: ChainType) => ChainSupportType[value]

export const StringToChain = (value: string | undefined, def?: ChainType) => ChainType[value || ''] || def

export const DoesChainExist = (value: ChainType) => ChainSupportType[value] !== -1
