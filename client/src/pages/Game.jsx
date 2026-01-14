

import { useState } from "react";

import { useParams, useNavigate } from "react-router-dom";

import { Box, IconButton, Button } from "@mui/material";

import GameStartModal from "../components/game/GameStartModal";

import GameTopSection from "../components/game/GameTopSection";

import GameControlsBar from "../components/game/GameControlsBar";

import BingoGrid from "../components/game/BingoGrid";

import WinnerDialog from "../components/game/WinnerDialog";



import { pulseAnimation } from "../components/game/GameStyles";

import useGameLogic from "../hooks/useGameLogic";

import useGameStore from "../stores/gameStore";

import {

backgroundOptions,

voiceOptions,

BINGO_PATTERNS,

} from "../constants/constants";

import "../styles/game-redesign.css";



const Game = () => {

const { stake, players, winAmount } = useParams();

const navigate = useNavigate();

const { gameData } = useGameStore();

const [showStartModal, setShowStartModal] = useState(false);



const {

calledNumbers,

recentCalls,

currentNumber,

callCount,

isPlaying,

isShuffling,

cardIdInput,

setCardIdInput,

openModal,

cardNumbers,

cartelaData,

bingoState,

patternTypes,

lockedCards,

drawSpeed,

setDrawSpeed,

voiceOption,

patternAnimationIndex,

isGameEnded,

selectedBackground,

hasGameStarted,

checkWinner,

handleVoiceChange,

possiblePatterns,

handleEndGame,

handleShuffleClick,

handleCloseModal,

clearLockedCards,

togglePlayPause,

bonusAwarded,

bonusAmountGiven,

dynamicBonusAmount,

enableDynamicBonus,

primaryPattern,

setLockedCards,

bonusAmount,

bonusPattern,

} = useGameLogic({ stake, players, winAmount });



const backgroundStyle = backgroundOptions.find(

(bg) => bg.value === selectedBackground

)?.style || { backgroundColor: "#111827" };



const handleBack = () => {

navigate("/dashboard", { state: { gameId: gameData?.game.gameId } });

};



const handleStartGame = () => {

setShowStartModal(false);

togglePlayPause();

};



// Check if there's a reservation (cards selected)

const hasReservation = gameData?.cartela?.length > 0;



return (

<Box

sx={{

minHeight: "100vh",

color: "#fff",

display: "flex",

flexDirection: "column",

...backgroundStyle,

}}

>

<style>{pulseAnimation}</style>



{/* Game Start Modal - shows over the game background */}

<GameStartModal

isOpen={showStartModal && !hasGameStarted}

onClose={() => setShowStartModal(false)}

onStart={handleStartGame}

hasReservation={hasReservation}

roundNumber={1}

/>



{/* Main game content */}

<Box sx={{ flex: 1, p: { xs: 1, sm: 2 } }}>

{/* Top Section: Comprehensive Header */}

<GameTopSection

calledNumbers={calledNumbers}

currentNumber={currentNumber}

recentCalls={recentCalls}

callCount={callCount}

gameDetails={gameData?.game}

patterns={possiblePatterns}

patternAnimationIndex={patternAnimationIndex}

enableDynamicBonus={enableDynamicBonus}

dynamicBonusAmount={dynamicBonusAmount}

bonusAmount={bonusAmount}

bonusPattern={bonusPattern}

winAmount={winAmount}

/>





{/* BINGO Grid */}

<Box sx={{ mb: 2 }}>

<BingoGrid calledNumbers={calledNumbers} shuffling={isShuffling} />

</Box>



{/* Bottom Controls Bar */}

<GameControlsBar

isPlaying={isPlaying}

isShuffling={isShuffling}

togglePlayPause={togglePlayPause}

handleShuffleClick={handleShuffleClick}

voiceOptions={voiceOptions}

voiceOption={voiceOption}

handleVoiceChange={handleVoiceChange}

drawSpeed={drawSpeed}

setDrawSpeed={setDrawSpeed}

cardIdInput={cardIdInput}

setCardIdInput={setCardIdInput}

checkWinner={checkWinner}

handleBack={handleBack}

isGameEnded={isGameEnded}

hasGameStarted={hasGameStarted}

handleEndGame={handleEndGame}

/>

</Box>



{/* Winner Dialog */}

<WinnerDialog

openModal={openModal}

handleCloseModal={handleCloseModal}

cardIdInput={cardIdInput}

cardNumbers={cardNumbers}

calledNumbers={calledNumbers}

cartelaData={cartelaData}

bingoState={bingoState}

patternTypes={patternTypes}

selectedPattern={primaryPattern}

lockedCards={lockedCards}

setLockedCards={setLockedCards}

clearLockedCards={clearLockedCards}

BINGO_PATTERNS={BINGO_PATTERNS}

isGameEnded={isGameEnded}

bonusAwarded={bonusAwarded}

bonusAmount={bonusAmountGiven.toFixed(0)}

handleEndGame={handleEndGame}

/>

</Box>

);

};



export default Game;