import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/home";
import { Impostor } from "../pages/games/impostor";
import { OfflineImpostorGame } from "../pages/games/impostor/OffLineImpostor";
import { OnlineImpostorGame } from "../pages/games/impostor/OnlineImpostor";
import { RevealPhase } from "../pages/games/impostor/OffLineImpostor/revealPhase";
import { DiscussPhase } from "../pages/games/impostor/OffLineImpostor/discussPhase";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<h1>404 - Not Found</h1>} />
        <Route path="/games/impostor/lobby" element={<Impostor />} />
        <Route
          path="/games/impostor/offline"
          element={<OfflineImpostorGame />}
        />
        <Route path="/games/impostor/online" element={<OnlineImpostorGame />} />
        <Route path="/games/impostor/revealPhase" element={<RevealPhase />} />
        <Route path="/games/impostor/discussPhase" element={<DiscussPhase />} />
      </Routes>
    </BrowserRouter>
  );
}
