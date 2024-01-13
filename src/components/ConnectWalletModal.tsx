import { WalletType, useConnection } from 'src/contexts/ConnectionContext'
import styled from 'styled-components'

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  // smooth-black color
  background-color: rgb(17, 17, 17);
`
const Title = styled.h1`
  font-size: 28px;
  width: 100%;
  text-align: center;
`
const WalletsSelect = styled.div`
  margin: auto;
  padding: 20px;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.colors.grey};

  max-width: 900px;
  max-height: 600px;
  width: 100%;
  height: 100%;
`
const WarningMsg = styled.p`
  color: yellow;
  font-size: 14px;
`

export const ConnectWalletModal = () => {
  const { connect, changeNetwork, walletsMap } = useConnection()
  return (
    <Wrapper>
      <Title>Please, connect your wallet</Title>
      <WalletsSelect>
        {walletsMap.has(WalletType.Zerion) && (
          <WarningMsg>If you need to use Metamask wallet, disable Zerion wallet in your browser extensions.</WarningMsg>
        )}
        {Array.from(walletsMap.keys()).map((walletType) => (
          <button
            key={walletType}
            onClick={async () => {
              await connect(walletType)
            }}
          >
            {walletType}
          </button>
        ))}
      </WalletsSelect>
    </Wrapper>
  )
}
