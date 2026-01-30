import { PlayerContextProvider } from "./contexts/playersProvider";
import { AppRoutes } from "./routes";
import "./styles/theme.css";
import "./styles/global.css";
import { SocketProvider } from "./contexts/socketContext";

function App() {
  return (
    <SocketProvider>
      <PlayerContextProvider>
        <AppRoutes />
      </PlayerContextProvider>
    </SocketProvider>
  );
}

export default App;
