import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { AppPageContainer } from './components/AppPageContainer'
import { ConnectionProvider } from './contexts/ConnectionContext'
import { MainPage } from './main-page'
import { OtherPage } from './other-page'
import { DarkTheme } from './theme/DarkTheme'

function App() {
  return (
    <ThemeProvider theme={DarkTheme}>
      <AppPageContainer id="main-container">
        <ConnectionProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/other" element={<OtherPage />} />
            </Routes>
          </BrowserRouter>
        </ConnectionProvider>
      </AppPageContainer>
    </ThemeProvider>
  )
}

export default App
