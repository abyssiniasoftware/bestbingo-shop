export const getGameState = (gameData, callCount) => {
  return {
    hasReservation: gameData?.cartela?.length > 0,
    showCurrentBall: callCount > 0,
  };
};