import styled from 'styled-components'

export const Spinner = styled.div`
  @keyframes spinner {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  width: 25px;
  height: 25px;
  border: 5px solid ${({ theme }) => theme.colors.grey};
  border-top: 5px solid ${({ theme }) => theme.colors.greenLight};
  border-radius: 100%;
  animation: spinner 0.75s linear infinite;
  margin: auto;
`
