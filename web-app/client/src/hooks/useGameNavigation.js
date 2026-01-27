import { useNavigate } from "react-router-dom";

export const useGameNavigation = (handleReset) => {
  const navigate = useNavigate();

  const handleBack = (gameId) => {
    navigate("/new-game", { state: { gameId } });
  };

  const handleNewGameClick = () => {
    handleReset?.();
    navigate("/new-game");
  };

  return {
    handleBack,
    handleNewGameClick,
  };
};