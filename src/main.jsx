import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App.jsx"
import { AppProvider } from "./contexts/AppContext.jsx"
import { AudioProvider } from "./contexts/AudioProvider.jsx"
import { PinRequestProvider } from "./contexts/PinRequestContext.jsx"
import { NavigationProvider } from "./contexts/NavigationContext.jsx"
import "./styles/global.css"
import { ConfigProvider } from "./contexts/ConfigContext.jsx"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ConfigProvider>
      <BrowserRouter>
        <AppProvider>
          <AudioProvider>
            <PinRequestProvider>
              <NavigationProvider>
                <App />
              </NavigationProvider>
            </PinRequestProvider>
          </AudioProvider>
        </AppProvider>
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>,
)
