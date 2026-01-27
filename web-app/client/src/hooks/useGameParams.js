import { useParams } from "react-router-dom";

export const useGameParams = ({ stake, players, winAmount, voiceOption }) => {
  const params = useParams();
  
  return {
    stake: stake || params.stake || "",
    players: players || params.players || "",
    winAmount: winAmount || params.winAmount || "0",
    voiceOption: voiceOption,
  };
};