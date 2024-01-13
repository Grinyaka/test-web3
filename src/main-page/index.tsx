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
  align-items: center;
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
const StyledButton = styled.button`
  border: unset;
  border-radius: 10px;
  padding: 10px 15px;
  font-size: 16px;
  background-color: ${({ theme }) => theme.colors.greenLight};
  color: ${({ theme }) => theme.colors.white};
  transition: all 0.2s ease-in-out;
  &:hover {
    opacity: 0.8;
    background-color: ${({ theme }) => theme.colors.greenLight};
  }
`

export const MainPage = () => {
  const {disconnect} = useConnection()
  return (
    <Wrapper>
      <Title>Main page</Title>
      <Content>
        <StyledLink to="/other">Go to other page</StyledLink>
        <StyledButton onClick={disconnect}>Disconnect</StyledButton>
      </Content>
    </Wrapper>
  )
}
