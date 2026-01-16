import { PlayerContextProvider } from "./contexts/playersProvider";
import { AppRoutes } from "./routes";
import "./styles/theme.css";
import "./styles/global.css";

function App() {
  return (
    <PlayerContextProvider>
      <AppRoutes />
    </PlayerContextProvider>
  );
}

export default App;
