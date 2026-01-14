import { useLocation } from "react-router-dom";
import { RevealPhase } from "./revealPhase";
import { DiscussPhase } from "./discussPhase";
import type { GameRouteState } from "../GameLogistic/types";

export function OfflineImpostorGame() {
  const location = useLocation();
  const state: GameRouteState = location.state;

  switch (state.phase) {
    case "reveal":
      return <RevealPhase data={state} />;
    case "discussion":
      return <DiscussPhase data={state} />;
    default:
      break;
  }
}
