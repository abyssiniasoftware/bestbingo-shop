import React from "react";
import ControlsSection from "./ControlsSection";
import CardGrid from "./CardGrid";
import useNewGameLogic from "../hooks/useNewGameLogic";
import useWallet from "../hooks/useWallet";
import useCardIds from "../hooks/useCardIds";
import useUserStore from "../stores/userStore";
import useGameStore from "../stores/gameStore";
import { backgroundOptions } from "../constants/constants";
import { Box } from "@mui/material";

const NewGame = () => {
  const { userId, setWalletData, setError } = useUserStore();
  const {
    cartela,
    setCartela,
    cardIds,
    setCardIds,
    setGameData,
    setTotalBet,
    setTotalWin,
    setTotalHouseProfit,
  } = useGameStore();

  const {
    betAmount,
    setBetAmount,
    useDropdown,
    setUseDropdown,
    cutAmount,
    setCutAmount,
    cartelaInput,
    setCartelaInput,
    isLoading,
    setIsLoading,
    winAmount,
    // houseProfit,
    // showHouseProfitInfo,
    // setShowHouseProfitInfo,
    // showTotalStakeInfo,
    // setShowTotalStakeInfo,
    showSensitiveInfo,
    // setShowSensitiveInfo,
    showCutAmount,
    // setShowCutAmount,
    // isSummaryExpanded,
    // setIsSummaryExpanded,
    showCardCount,
    // setShowCardCount,
    handleCardIdClick,
    handleCartelaInput,
    handleCartelaKeyDown,
    isCartelaInputValid,
    handleStartGame,
    handleClearSelections,
    toggleSensitiveInfo,
    toggleCutAmount,
    toggleCardCount,
    selectedBackground,
    handleBackgroundChange,
    handleRefreshCards,
    handleRefreshCutAmount,
    bonusAmount,
    setBonusAmount,
    bonusPattern,
    setBonusPattern,
  } = useNewGameLogic({
    cartela,
    setCartela,
    setTotalBet,
    setTotalWin,
    setTotalHouseProfit,
    setGameData,
    setCardIds,
  });

  useWallet({ userId, setWalletData, setError, setIsLoading });
  useCardIds({ userId, cardIds, setCardIds, setError, setIsLoading });
  const backgroundStyle = backgroundOptions.find(
    (bg) => bg.value === selectedBackground
  )?.style || { backgroundColor: "#111827" };
  return (
    <Box
      className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-0 sm:p-4"
      sx={{ ...backgroundStyle }}
    >
      <div className="w-full max-w-8xl">
        <ControlsSection
          betAmount={betAmount}
          setBetAmount={setBetAmount}
          useDropdown={useDropdown}
          setUseDropdown={setUseDropdown}
          cutAmount={cutAmount}
          setCutAmount={setCutAmount}
          cartelaInput={cartelaInput}
          setCartelaInput={setCartelaInput}
          showCutAmount={showCutAmount}
          toggleCutAmount={toggleCutAmount}
          showCardCount={showCardCount}
          toggleCardCount={toggleCardCount}
          cartela={cartela}
          cardIds={cardIds}
          handleCartelaInput={handleCartelaInput}
          handleCartelaKeyDown={handleCartelaKeyDown}
          isCartelaInputValid={isCartelaInputValid}
          showSensitiveInfo={showSensitiveInfo}
          toggleSensitiveInfo={toggleSensitiveInfo}
          winAmount={winAmount}
          handleStartGame={handleStartGame}
          handleClearSelections={handleClearSelections}
          isLoading={isLoading}
          backgroundOptions={backgroundOptions}
          selectedBackground={selectedBackground}
          handleBackgroundChange={handleBackgroundChange}
          handleRefreshCards={handleRefreshCards}
          handleRefreshCutAmount={handleRefreshCutAmount}
          bonusAmount={bonusAmount}
          setBonusAmount={setBonusAmount}
          bonusPattern={bonusPattern}
          setBonusPattern={setBonusPattern}
        />
        <CardGrid
          cardIds={cardIds}
          cartela={cartela}
          handleCardIdClick={handleCardIdClick}
          isLoading={isLoading}
          selectedBackground={selectedBackground}
        />
      </div>
    </Box>
  );
};

export default NewGame;
