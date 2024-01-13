import { Link } from 'react-router-dom'
import { useConnection } from 'src/contexts/ConnectionContext'
import styled from 'styled-components'

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
`
const Title = styled.h1`
  font-size: 28px;
  width: 100%;
  text-align: center;
`
const Content = styled.div`
  margin: auto;
  padding: 20px;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.colors.grey};

  max-width: 900px;
  max-height: 600px;
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: center;
`
const StyledLink = styled(Link)`
  font-size: 20px;
  margin: 10px;
  text-decoration: none;
  color: lightblue;
  transition: opacity 0.2s ease-in-out;
  align-self: center;
  &:hover {
    opacity: 0.8;
  }
`
const FieldValue = styled.div`
  font-size: 20px;
  margin: 10px;
  color: ${({ theme }) => theme.colors.white};
`

export const OtherPage = () => {
  const { currentAccount, currentChain } = useConnection()
  return (
    <Wrapper>
      <Title>Other page</Title>
      <Content>
        <StyledLink to="/">Go to main page</StyledLink>
        <FieldValue>Current account: {currentAccount}</FieldValue>
        <FieldValue>Current chain: {currentChain}</FieldValue>
      </Content>
    </Wrapper>
  )
}
