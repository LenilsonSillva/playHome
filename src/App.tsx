import { PlayerContextProvider } from "./contexts/playersProvider";
import { AppRoutes } from "./routes";

function App() {
  return (
    <PlayerContextProvider>
      <AppRoutes />
    </PlayerContextProvider>
  );
}

export default App;
