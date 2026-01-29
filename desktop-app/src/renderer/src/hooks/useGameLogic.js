import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { debounce } from "lodash";
import useGameStore from "../stores/gameStore";
import useUserStore from "../stores/userStore";
import apiService from "../api/apiService";
import useWallet from "./useWallet";
import {
  voiceOptions,
  BINGO_PATTERNS,
  META_PATTERNS,
} from "../constants/constants";
import { cellToGridIndex, formatPatternName } from "../utils/gameUtils";
import { shuffle, finished } from "../voice/utilVoice";

// Precompute pattern indices for faster win checking
const PRECOMPUTED_PATTERNS = Object.keys(BINGO_PATTERNS).reduce(
  (acc, pattern) => {
    acc[pattern] = BINGO_PATTERNS[pattern].map((variation) =>
      variation.map((cell) => cellToGridIndex(cell)),
    );
    return acc;
  },
  {},
);

const useGameLogic = (stake, players, winAmount, passedVoiceOption) => {

  // State declarations
  const validPatterns = Object.keys(BINGO_PATTERNS).concat(
    Object.keys(META_PATTERNS),
  );
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [recentCalls, setRecentCalls] = useState([]);
  const [currentNumber, setCurrentNumber] = useState("00");
  const [previousNumber, setPreviousNumber] = useState("00");
  const [callCount, setCallCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [cardIdInput, setCardIdInput] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [cardNumbers, setCardNumbers] = useState([]);
  const [cartelaData, setCartelaData] = useState(null);
  const [bingoState, setBingoState] = useState({});
  const [patternTypes, setPatternTypes] = useState([]);
  const [enableDynamicBonus, setEnableDynamicBonus] = useState(false);
  const [dynamicBonus, setDynamicBonus] = useState(0);
  const [lockedCards, setLockedCards] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("lockedCards")) || [];
    } catch {
      return [];
    }
  });
  const [allCardNumbers, setAllCardNumbers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("allCardNumbers")) || {};
    } catch {
      return {};
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [drawSpeed, setDrawSpeed] = useState(
    () => parseInt(localStorage.getItem("drawSpeed")) || 3000,
  );
  const [patternAnchorEl, setPatternAnchorEl] = useState(null);
  const [voiceOption, setVoiceOption] = useState(
    () => passedVoiceOption || localStorage.getItem("selectedVoice") || "a",
  );

  // Sync with passedVoiceOption
  useEffect(() => {
    if (passedVoiceOption && passedVoiceOption !== voiceOption) {
      setVoiceOption(passedVoiceOption);
    }
  }, [passedVoiceOption]);

  const [showCentralBall, setShowCentralBall] = useState(false);
  const [isCentralBallMoving, setIsCentralBallMoving] = useState(false);
  const [blowerZoomBall, setBlowerZoomBall] = useState(null);
  const [prefixedNumber, setPrefixedNumber] = useState(null);
  const [patternAnimationIndex, setPatternAnimationIndex] = useState(0);
  const [gameDetails, setGameDetails] = useState(null);
  const [isGameEnded, setIsGameEnded] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState(
    () => localStorage.getItem("selectedBackground") || "default",
  );
  const [primaryPattern, setPrimaryPattern] = useState(() => {
    const stored = localStorage.getItem("primaryPattern");
    return stored && validPatterns.includes(stored) ? stored : "oneLine";
  });
  const [bonusAwarded, setBonusAwarded] = useState(false);
  const [bonusAmountGiven, setBonusAmountGiven] = useState(0);
  const [isStartAudioFinished, setIsStartAudioFinished] = useState(true);
  const [hasGameStarted, setHasGameStarted] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("hasGameStarted")) || false;
    } catch {
      return false;
    }
  });
  const [isBonusGloballyActive, setIsBonusGloballyActive] = useState(() => {
    const storedValue = localStorage.getItem("isBonusGloballyActive");
    return storedValue === "true";
  });
  const [bonusAmount, setBonusAmount] = useState(() => {
    const stored = localStorage.getItem("bonusAmount");
    return stored ? parseInt(stored) : 0;
  });
  const [bonusPattern, setBonusPattern] = useState(() => {
    const stored = localStorage.getItem("bonusPattern");
    return stored && validPatterns.includes(stored) ? stored : "";
  });
  // Local toggle for Bad Bingo (zero-match win)
  const [isBadBingoActive, setIsBadBingoActive] = useState(() => {
    const stored = localStorage.getItem("isBadBingoActive");
    return stored === "true";
  });
  // Manual mode for win checking - when true, user must manually declare winners

  // Hooks and refs
  const { userId } = useUserStore();
  const { gameData, resetGame } = useGameStore();
  const { refreshWallet } = useWallet();
  const navigate = useNavigate();
  const drawIntervalRef = useRef(null);
  const shuffleIntervalRef = useRef(null);
  const shuffleTimeoutRef = useRef(null);
  const voiceOptionRef = useRef(voiceOption);
  const cardDataCache = useRef({});
  const currentAudioRef = useRef(null);

  // Debounced setters
  const debouncedSetPrimaryPattern = useCallback(
    debounce((pattern) => {
      if (validPatterns.includes(pattern) || pattern === "") {
        setPrimaryPattern(pattern);
        localStorage.setItem("primaryPattern", pattern);
      } else {
        console.warn(`Invalid primary pattern: ${pattern}`);
        // toast.error(`Invalid pattern: ${pattern}`);
      }
    }, 300),
    [],
  );

  const debouncedSetBonusPattern = useCallback(
    debounce((pattern) => {
      if (validPatterns.includes(pattern) || pattern === "") {
        setBonusPattern(pattern);
        localStorage.setItem("bonusPattern", pattern);
      } else {
        console.warn(`Invalid bonus pattern: ${pattern}`);
      }
    }, 300),
    [],
  );

  const debouncedSetBonusAmount = useCallback(
    debounce((amount) => {
      setBonusAmount(amount);
      localStorage.setItem("bonusAmount", amount.toString());
    }, 300),
    [],
  );

  // Memoized called numbers set
  const calledNumbersSet = useMemo(
    () => new Set(calledNumbers.map((num) => parseInt(num, 10))),
    [calledNumbers],
  );

  // Update hasGameStarted when isPlaying becomes true
  useEffect(() => {
    if (isPlaying && !hasGameStarted) {
      setHasGameStarted(true);
      localStorage.setItem("hasGameStarted", JSON.stringify(true));
    }
  }, [isPlaying, hasGameStarted]);

  // Update voiceOptionRef
  useEffect(() => {
    voiceOptionRef.current = voiceOption;
    localStorage.setItem("selectedVoice", voiceOption);
    if (currentNumber !== "00" && isPlaying && isStartAudioFinished) {
      playAudio(parseInt(currentNumber));
    }
  }, [voiceOption, currentNumber, isPlaying]);

  // Clear game state
  useEffect(() => {
    const resetGameState = () => {
      setCalledNumbers([]);
      setRecentCalls([]);
      setCurrentNumber("00");
      setPreviousNumber("00");
      setCallCount(0);
      localStorage.removeItem("calledNumbers");
      localStorage.removeItem("recentCalls");
      localStorage.removeItem("currentNumber");
      localStorage.removeItem("previousNumber");
      localStorage.removeItem("callCount");
    };
    resetGameState();
  }, []);

  useEffect(() => {
    // Only reset if it's a brand new game
    const hasGameStarted = JSON.parse(
      localStorage.getItem("hasGameStarted") || "false",
    );
    if (!hasGameStarted) {
      setCalledNumbers([]);
      setRecentCalls([]);
      setCurrentNumber("00");
      setPreviousNumber("00");
      setCallCount(0);
      localStorage.removeItem("calledNumbers");
      localStorage.removeItem("recentCalls");
      localStorage.removeItem("currentNumber");
      localStorage.removeItem("previousNumber");
      localStorage.removeItem("callCount");
    } else {
      // Restore previous game state
      const savedCalled = JSON.parse(
        localStorage.getItem("calledNumbers") || "[]",
      );
      const savedRecent = JSON.parse(
        localStorage.getItem("recentCalls") || "[]",
      );
      const savedCurrent = localStorage.getItem("currentNumber") || "00";
      const savedPrevious = localStorage.getItem("previousNumber") || "00";
      const savedCount = parseInt(localStorage.getItem("callCount")) || 0;

      setCalledNumbers(savedCalled);
      setRecentCalls(savedRecent);
      setCurrentNumber(savedCurrent);
      setPreviousNumber(savedPrevious);
      setCallCount(savedCount);
    }
  }, []);

  // Fetch game details
  useEffect(() => {
    const fetchGameDetails = async () => {
      if (!userId) {
        // toast.error('Authentication user ID missing');
        navigate("/login");
        return;
      }
      try {
        const details = await apiService.fetchGameDetails(userId);
        setGameDetails(details);
        // Also update the store so Game.jsx can access it via gameData
        useGameStore.getState().setGameData({ ...useGameStore.getState().gameData, game: details });
      } catch (error) {
        // toast.error(error.message);
        navigate("/dashboard");
      }
    };
    fetchGameDetails();
  }, [userId, navigate]);

  useEffect(() => {
    const fetchCashierSettings = async () => {
      try {
        const response = await apiService.fetchUserDetails(userId);

        setEnableDynamicBonus(response.enableDynamicBonus || false);
      } catch (error) { }
    };
    fetchCashierSettings();
  }, [userId]);

  useEffect(() => {
    const fetchDynamicBonus = async () => {
      if (!gameDetails?.houseId) return;
      try {
        const response = await apiService.fetchActiveDynamicBonus();
        setDynamicBonus(Number(response.bonusAmount) || 0);
      } catch (error) { }
    };
    fetchDynamicBonus();
  }, [gameDetails]);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("allCardNumbers", JSON.stringify(allCardNumbers));
    localStorage.setItem("drawSpeed", drawSpeed.toString());
    localStorage.setItem("selectedVoice", voiceOption);
    localStorage.setItem("lockedCards", JSON.stringify(lockedCards));
    localStorage.setItem("selectedBackground", selectedBackground);
    localStorage.setItem("primaryPattern", primaryPattern);
    localStorage.setItem("hasGameStarted", JSON.stringify(hasGameStarted));
    localStorage.setItem("bonusAmount", bonusAmount.toString());
    localStorage.setItem("bonusPattern", bonusPattern);
    localStorage.setItem("calledNumbers", JSON.stringify(calledNumbers));
    localStorage.setItem("recentCalls", JSON.stringify(recentCalls));
    localStorage.setItem("currentNumber", currentNumber);
    localStorage.setItem("previousNumber", previousNumber);
    localStorage.setItem("callCount", callCount.toString());
  }, [
    allCardNumbers,
    drawSpeed,
    voiceOption,
    lockedCards,
    selectedBackground,
    primaryPattern,
    hasGameStarted,
    bonusAmount,
    bonusPattern,
    calledNumbers,
    recentCalls,
    currentNumber,
    previousNumber,
    callCount,
  ]);

  // Fetch card numbers
  useEffect(() => {
    const fetchAllCardNumbers = async () => {
      if (!gameData || !gameData.cartela || !userId) {
        setIsLoading(false);
        navigate("/dashboard");
        return;
      }

      try {
        const cardNumbersMap = {};
        const fetchPromises = gameData.cartela.map(async (cardId) => {
          const numbers = await apiService.fetchCardNumbers(
            cardId,
            userId,
          );
          cardNumbersMap[cardId] = numbers;
          cardDataCache.current[cardId] = { numbers };
        });
        await Promise.all(fetchPromises);
        setAllCardNumbers(cardNumbersMap);
      } catch (error) {
        // toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllCardNumbers();
  }, [gameData, userId, navigate]);

  // Audio playback
  const playAudio = useCallback(
    (audioKey) => {
      return new Promise(async (resolve, reject) => {
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
          currentAudioRef.current.currentTime = 0;
          currentAudioRef.current = null;
        }

        try {
          // Always import utilVoice for special keys and structure
          const utilVoiceModule = await import(`../voice/utilVoice.js`);

          const specialAudioBaseKeys = [
            "start",
            "stop",
            "winner",
            "lose",
            "blocked",
            "notRegistered",
          ];

          const isSpecialAudio = specialAudioBaseKeys.some(
            (baseKey) => audioKey === baseKey,
          );

          let audioFile;
          let finalAudioKey;

          if (isSpecialAudio) {
            audioFile = utilVoiceModule[audioKey];
          } else {
            // Load specific voice module for numbered calls
            let prefix = "";
            const speakNumber = parseInt(audioKey, 10);
            if (speakNumber >= 1 && speakNumber <= 15) prefix = "b";
            else if (speakNumber >= 16 && speakNumber <= 30) prefix = "i";
            else if (speakNumber >= 31 && speakNumber <= 45) prefix = "n";
            else if (speakNumber >= 46 && speakNumber <= 60) prefix = "g";
            else if (speakNumber >= 61 && speakNumber <= 75) prefix = "o";

            const prefixedNumber = prefix + speakNumber;
            finalAudioKey = voiceOption + prefixedNumber;
            setPrefixedNumber(prefixedNumber);

            // Dynamically load the voice-specific module
            try {
              const voiceModule = await import(
                `../voice/${voiceOption}Voice.js`
              );
              audioFile = voiceModule[finalAudioKey];
            } catch (err) {
              console.warn(
                `Voice file for ${voiceOption} not found, falling back to utilVoice`,
              );
              audioFile = utilVoiceModule[finalAudioKey];
            }
          }

          if (!audioFile) {
            throw new Error(
              `Audio file not found for ${finalAudioKey || audioKey}`,
            );
          }

          const audio = new Audio(audioFile);
          currentAudioRef.current = audio;

          if (finalAudioKey === `${voiceOption}start`) {
            setIsStartAudioFinished(false);
            audio.onended = () => {
              setIsStartAudioFinished(true);
              currentAudioRef.current = null;
              resolve();
            };
          } else {
            audio.onended = () => {
              currentAudioRef.current = null;
              resolve();
            };
          }

          audio.play().catch((error) => {
            if (error.name === "AbortError") {
              resolve();
              return;
            }
            setIsStartAudioFinished(true);
            currentAudioRef.current = null;
            reject(error);
          });
        } catch (error) {
          setIsStartAudioFinished(true);
          console.error("Audio playback failed:", error);
          reject(error);
        }
      });
    },
    [voiceOption],
  );

  const playWinnerAudio = useCallback(async () => {
    await playAudio("winner");
  }, [playAudio]);

  const playStartAudio = useCallback(() => {
    return new Promise((resolve, reject) => {
      playAudio("start")
        .then(() => {
          resolve();
        })
        .catch((error) => {
          setIsStartAudioFinished(true);
          reject(error);
        });
    });
  }, [playAudio]);

  const playStopAudio = useCallback(async () => {
    await playAudio("stop");
  }, [playAudio]);

  const playLoseAudio = useCallback(async () => {
    await playAudio("lose");
  }, [playAudio]);

  const playBlockedAudio = useCallback(async () => {
    await playAudio("blocked");
  }, [playAudio]);

  const playNotRegisteredAudio = useCallback(async () => {
    await playAudio("notRegistered");
  }, [playAudio]);

  const playShuffleSound = async () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }

    try {
      const audio = new Audio(shuffle);
      currentAudioRef.current = audio;
      audio.play().catch((error) => {
        if (error.name === "AbortError") return;
        // toast.error(`Error playing shuffle sound: ${error.message}`);
        currentAudioRef.current = null;
      });
    } catch (error) {
      // toast.error(`Error playing shuffle sound: ${error.message}`);
    }
  };

  // Draw number
  const drawNumber = useCallback(() => {
    if (!isStartAudioFinished) {
      return;
    }
    if (calledNumbers.length >= 75) {
      setIsPlaying(false);
      setIsGameEnded(true);
      return;
    }

    const availableNumbers = Array.from({ length: 75 }, (_, i) =>
      (i + 1).toString(),
    ).filter((num) => !calledNumbers.includes(num));

    if (availableNumbers.length === 0) {
      setIsPlaying(false);
      setIsGameEnded(true);
      return;
    }

    const newNumber =
      availableNumbers[Math.floor(Math.random() * availableNumbers.length)];

    // Calculate durations based on drawSpeed
    const speedRatio = drawSpeed / 3000;
    const phase1Duration = Math.max(300, Math.floor(500 * speedRatio)); // Zoom in duration
    const phase2Duration = Math.max(800, Math.floor(1200 * speedRatio)); // Show at center duration
    const moveDuration = Math.max(400, Math.floor(600 * speedRatio)); // Move to grid duration
    const fadeOutDuration = Math.max(200, Math.floor(300 * speedRatio)); // Fade out at end

    // PHASE 1: Zoom in Blower
    setBlowerZoomBall(newNumber);

    setTimeout(() => {
      // PHASE 2: Show at Center
      setPreviousNumber(currentNumber);
      setCurrentNumber(newNumber.padStart(2, "0"));
      setCalledNumbers((prev) => [...prev, newNumber]);
      setRecentCalls((prev) => [newNumber, ...prev].slice(0, 5));
      setCallCount((prev) => prev + 1);

      setShowCentralBall(true);
      setIsCentralBallMoving(false);
      setBlowerZoomBall(null); // Remove from blower zoom

      // PHASE 3: After showing at center, move to grid
      setTimeout(() => {
        setIsCentralBallMoving(true);

        // PHASE 4: After moving, fade out and hide
        setTimeout(() => {
          setShowCentralBall(false);
          setIsCentralBallMoving(false);
        }, moveDuration + fadeOutDuration); // Wait for move + fade to complete

      }, phase2Duration);

    }, phase1Duration);
  }, [calledNumbers, currentNumber, isStartAudioFinished, drawSpeed]);

  // Play/Pause interval
  useEffect(() => {
    if (isPlaying && isStartAudioFinished && calledNumbers.length < 75) {
      drawIntervalRef.current = setInterval(() => {
        drawNumber();
      }, drawSpeed);
    } else {
      clearInterval(drawIntervalRef.current);
    }
    return () => {
      clearInterval(drawIntervalRef.current);
      clearInterval(shuffleIntervalRef.current);
      clearTimeout(shuffleTimeoutRef.current);
    };
  }, [
    isPlaying,
    isStartAudioFinished,
    drawSpeed,
    calledNumbers.length,
    drawNumber,
  ]);

  // Handle voice change
  const handleVoiceChange = (event) => {
    const selectedVoice = voiceOptions.find(
      (option) => option.label === event.target.value,
    );
    if (selectedVoice) {
      setVoiceOption(selectedVoice.value);
    }
  };

  // Handle background change
  const handleBackgroundChange = (event) => {
    setSelectedBackground(event.target.value);
    localStorage.setItem("selectedBackground", event.target.value);
  };

  // Inside checkWinner, replace the userId and bonus awarding logic
  const checkWinner = useCallback(async () => {
    // Prevent checking if game is already ended
    if (isGameEnded) {
      try {
        const audio = new Audio(finished);
        audio.play();
      } catch (e) {
        console.error("Failed to play finished audio", e);
      }
      return;
    }

    if (!cardIdInput) {
      toast.error("Please enter a card ID");
      return;
    }

    if (lockedCards.includes(cardIdInput)) {
      playBlockedAudio();
      toast.error(`Card ${cardIdInput} is locked and cannot be checked again.`);
      return;
    }

    if (!userId) {
      toast.error("User ID  missing");
      return;
    }

    if (!gameDetails || !gameDetails.houseId || !gameDetails.gameId) {
      toast.error("Game details not loaded");
      return;
    }

    if (!gameDetails.cartela.includes(cardIdInput)) {
      playNotRegisteredAudio();
      toast.error(`ካርቴላ ቁጥር ${cardIdInput}፣ ይህ ካርቴላ አልተመዘገበም `);
      return;
    }

    try {
      let data = cardDataCache.current[cardIdInput]?.cartelaData;
      let numbers = cardDataCache.current[cardIdInput]?.numbers;

      if (!data || !numbers) {
        [data, numbers] = await Promise.all([
          apiService.fetchCartelaData(cardIdInput, userId),
          apiService.fetchCardNumbers(cardIdInput, userId),
        ]);
        cardDataCache.current[cardIdInput] = { cartelaData: data, numbers };
      }

      const cellKeys = Object.keys(data).flatMap((row) =>
        Object.keys(data[row]),
      );
      const markedCells = new Set();
      for (const row of Object.keys(data)) {
        for (const cell of Object.keys(data[row])) {
          if (
            cell === "n3" ||
            calledNumbersSet.has(parseInt(data[row][cell], 10))
          ) {
            markedCells.add(cell);
          }
        }
      }

      const patterns = new Set();
      let matchedVariation = null;
      let isBonusEligible = false;
      let isBadBingo = false;
      if (isBadBingoActive && calledNumbers.length === 15) {
        const hasAny = numbers.some((num) =>
          calledNumbersSet.has(parseInt(num, 10)),
        );
        if (!hasAny) {
          isBadBingo = true;
          patterns.add("badBingo");
        }
      }

      const checkPattern = (pattern) => {
        if (
          !pattern ||
          (!PRECOMPUTED_PATTERNS[pattern] && !META_PATTERNS[pattern])
        ) {
          return false;
        }

        if (META_PATTERNS[pattern]) {
          const markedCount = cellKeys.filter(
            (cell) => cell !== "n3" && markedCells.has(cell),
          ).length;
          if (markedCount >= META_PATTERNS[pattern].required) {
            patterns.add(pattern);
            return true;
          }
          return false;
        }

        const patternVariations = PRECOMPUTED_PATTERNS[pattern];
        let patternMatched = false;

        if (pattern === "anyLineOrCorner" || pattern === "anyLinePlusCorner") {
          const allLines = [
            ...PRECOMPUTED_PATTERNS["row"],
            ...PRECOMPUTED_PATTERNS["column"],
            ...PRECOMPUTED_PATTERNS["diagonal"],
          ];
          const corners = PRECOMPUTED_PATTERNS["fourCorners"][0];
          const hasLine = allLines.some((line) =>
            line.every((idx) => markedCells.has(cellKeys[idx])),
          );
          const cornerCount = corners.filter((idx) =>
            markedCells.has(cellKeys[idx]),
          ).length;
          if (hasLine && cornerCount >= 1) {
            patterns.add(pattern);
            patternMatched = true;
          }
        } else if (pattern === "anyTwoLinesOrCorners") {
          const allLines = [
            ...PRECOMPUTED_PATTERNS["row"],
            ...PRECOMPUTED_PATTERNS["column"],
            ...PRECOMPUTED_PATTERNS["diagonal"],
          ];
          const allCorners = PRECOMPUTED_PATTERNS["fourCorners"][0];
          const lineCount = allLines.filter((line) =>
            line.every((idx) => markedCells.has(cellKeys[idx])),
          ).length;
          const cornerCount = allCorners.filter((idx) =>
            markedCells.has(cellKeys[idx]),
          ).length;
          if (
            lineCount >= 2 ||
            cornerCount >= 2 ||
            (lineCount >= 1 && cornerCount >= 1)
          ) {
            patterns.add(pattern);
            patternMatched = true;
          }
        } else if (pattern === "anyCornerSquare") {
          patternMatched = patternVariations.some((variation) =>
            variation.every((idx) => markedCells.has(cellKeys[idx])),
          );
          if (patternMatched) patterns.add(pattern);
        } else {
          patternMatched = patternVariations.some((variation) => {
            const isMatch = variation.every((idx) =>
              markedCells.has(cellKeys[idx]),
            );
            if (isMatch) matchedVariation = variation;
            return isMatch;
          });
          if (patternMatched) patterns.add(pattern);
        }

        return patternMatched;
      };

      const isPrimaryMatch = checkPattern(primaryPattern);
      const isBonusMatch = bonusPattern ? checkPattern(bonusPattern) : false;

      const isWinner = isPrimaryMatch;

      setCartelaData(data);
      setCardNumbers(numbers);
      setBingoState(
        cellKeys.reduce(
          (acc, cell) => ({ ...acc, [cell]: markedCells.has(cell) }),
          {},
        ),
      );
      setPatternTypes(Array.from(patterns));

      if (isWinner || isBadBingo) {
        setOpenModal(true);
        (async () => {
          playWinnerAudio();
          try {
            await apiService.declareWinner(
              gameDetails.houseId,
              gameDetails.gameId,
              cardIdInput,
            );
            setGameDetails((prev) => ({
              ...prev,
              winnerCardId: cardIdInput,
              finished: true,
            }));
            refreshWallet();
            setIsGameEnded(true);
            setIsPlaying(false);
            toast.info("Winner declared! Please end the game to proceed.");

            const ineligiblePatterns = ["fullCard", "blackout"];
            const winningPatterns = Array.from(patterns).filter(
              (pattern) => !ineligiblePatterns.includes(pattern),
            );

            if (winningPatterns.length > 0 && matchedVariation) {
              const calledCells = Array.from(markedCells).filter(
                (cell) => cell !== "n3",
              );
              const patternCells = matchedVariation
                .map((idx) => cellKeys[idx])
                .filter((cell) => cell !== "n3");
              isBonusEligible =
                calledCells.length === patternCells.length &&
                calledCells.every((cell) => patternCells.includes(cell));
            }

            if (isBonusEligible || isBonusGloballyActive) {
              let bonusAmount = 0;
              if (
                enableDynamicBonus &&
                (calledNumbers.length === 4 ||
                  isBonusGloballyActive ||
                  (bonusPattern && isBonusMatch))
              ) {
                try {
                  const bonusResponse = await apiService.awardBonus(
                    userId,
                    gameDetails.gameId,
                    gameDetails.houseId,
                    dynamicBonus,
                  );
                  setBonusAwarded(true);
                  setBonusAmountGiven(bonusResponse.bonus.bonusAmount);
                  setDynamicBonus(0);
                  toast.success(
                    `Dynamic bonus of ${bonusResponse.bonus.bonusAmount} ETB awarded for 4-call win!`,
                  );
                  refreshWallet();
                } catch (error) {
                  toast.error(`Failed to award bonus: ${error.message}`);
                }
              } else if (bonusPattern && isBonusMatch && bonusAmount > 0) {
                try {
                  // const bonusResponse = await apiService.awardBonus(
                  //   userId,
                  //   gameDetails.gameId,
                  //   gameDetails.houseId,
                  //   bonusAmount,
                  // );
                  setBonusAwarded(true);
                  setBonusAmountGiven(bonusAmount);
                  toast.success(
                    `Bonus of ${bonusAmount} ETB awarded for ${bonusPattern} pattern!`,
                  );
                  refreshWallet();
                } catch (error) {
                  toast.error(`Failed to award bonus: ${error.message}`);
                }
              } else if (!enableDynamicBonus) {
                if (calledNumbers.length === 4) {
                  bonusAmount = 1000;
                } else if (calledNumbers.length === 5) {
                  bonusAmount = 500;
                } else if (calledNumbers.length === 6) {
                  bonusAmount = 300;
                } else if (calledNumbers.length === 7) {
                  bonusAmount = 200;
                }

                if (bonusAmount > 0) {
                  try {
                    await apiService.awardBonus(
                      userId,
                      gameDetails.gameId,
                      gameDetails.houseId,
                      bonusAmount,
                    );
                    setBonusAwarded(true);
                    setBonusAmountGiven(bonusAmount);
                    toast.success(
                      `Manual bonus of ${bonusAmount} ETB awarded!`,
                    );
                    refreshWallet();
                  } catch (error) {
                    toast.error(`Failed to award bonus: ${error.message}`);
                  }
                } else {
                  toast.info(
                    "Pattern matched, but no bonus awarded due to call count.",
                  );
                }
              } else {
                toast.info(
                  "Pattern matched, but no bonus awarded due to call count.",
                );
              }
            }
            if (isBonusGloballyActive) {
              localStorage.setItem("isBonusGloballyActive", "false");
              toast.success(
                "One-time Global Bonus has been consumed and deactivated.",
              );
            }
          } catch (error) {
            toast.error(`Failed to declare winner: ${error.message}`);
          }
        })();
      } else {
        setOpenModal(true);
        if (
          primaryPattern !== "anySixLine" &&
          primaryPattern !== "anySevenLine"
        ) {
          playLoseAudio();
          toast.info(`Card ${cardIdInput} is not a winner yet.`);
        }
      }
    } catch (error) {
      toast.error(error.message);
      setCardNumbers([]);
      setCartelaData(null);
      setBingoState({});
      setPatternTypes([]);
    }
  }, [
    cardIdInput,
    lockedCards,
    gameDetails,
    calledNumbersSet,
    primaryPattern,
    userId,
    enableDynamicBonus,
    dynamicBonus,
    isBonusGloballyActive,
    isBadBingoActive,
    bonusPattern,
    calledNumbers.length,
    playBlockedAudio,
    cardIdInput,
    lockedCards,
    gameDetails,
    calledNumbersSet,
    primaryPattern,
    userId,
    enableDynamicBonus,
    dynamicBonus,
    isBonusGloballyActive,
    isBadBingoActive,
    bonusPattern,
    calledNumbers.length,
    playBlockedAudio,
    playLoseAudio,
    playWinnerAudio,
  ]);

  // Handle end game
  const handleEndGame = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    resetGame();
    navigate("/game");
  };

  // Clear locked cards
  const clearLockedCards = () => {
    setLockedCards([]);
    localStorage.removeItem("lockedCards");
    // toast.info('All cards unlocked');
  };

  // Toggle play/pause
  const togglePlayPause = async () => {
    if (isLoading) {
      // toast.error('Game is still loading...');
      return;
    }
    if (!gameData || !gameData.cartela || gameData.cartela.length === 0) {
      // toast.error('Game data or cartela not loaded');
      return;
    }
    if (!isPlaying && isShuffling) {
      setIsShuffling(false);
      clearInterval(shuffleIntervalRef.current);
      clearTimeout(shuffleTimeoutRef.current);
      // toast.info('Shuffling stopped to start the game');
    }
    if (!isPlaying) {
      // Starting the game
      try {
        await playStartAudio();
        setIsPlaying(true);
      } catch (error) {
        // toast.error('Failed to play start audio');
      }
    } else {
      // Pausing the game
      setIsPlaying(false);
      playStopAudio();
    }
  };

  // Handle ready
  const handleReady = () => {
    if (!gameData || !gameData.cartela || gameData.cartela.length === 0) {
      // toast.error('Game data or cartela not loaded');
      navigate("/game");
      return;
    }
    if (isShuffling) {
      setIsShuffling(false);
      clearInterval(shuffleIntervalRef.current);
      clearTimeout(shuffleTimeoutRef.current);
      // toast.info('Shuffling stopped to prepare the game');
    }
    setIsReady(true);
    // toast.info('Game is ready to start!');
  };

  // Handle reset
  const handleReset = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    setCalledNumbers([]);
    setRecentCalls([]);
    setCurrentNumber("00");
    setPreviousNumber("00");
    setCallCount(0);
    setIsPlaying(false);
    setIsReady(false);
    setIsShuffling(false);
    setIsGameEnded(false);
    setHasGameStarted(false);
    setOpenModal(false);
    setBonusAwarded(false);
    clearInterval(shuffleIntervalRef.current);
    clearTimeout(shuffleTimeoutRef.current);
    clearLockedCards();
    resetGame();

    localStorage.removeItem("calledNumbers");
    localStorage.removeItem("recentCalls");
    localStorage.removeItem("currentNumber");
    localStorage.removeItem("previousNumber");
    localStorage.removeItem("callCount");
    localStorage.removeItem("hasGameStarted");
    localStorage.removeItem("lockedCards");

    // toast.info('Game reset');
  };

  // Handle shuffle click - runs indefinitely until manually stopped
  const handleShuffleClick = () => {
    if (isReady || isPlaying) return;

    if (isShuffling) {
      setIsShuffling(false);
      clearInterval(shuffleIntervalRef.current);
      clearTimeout(shuffleTimeoutRef.current);
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        currentAudioRef.current = null;
      }
      // toast.info('Shuffling stopped');
    } else {
      setIsShuffling(true);
      playShuffleSound();
      const interval = setInterval(() => {
        const shuffledNumbers = Array.from({ length: 75 }, (_, i) =>
          (i + 1).toString(),
        ).sort(() => Math.random() - 0.5);
      }, 50);
      shuffleIntervalRef.current = interval;
      // NO auto-stop timeout - shuffle runs indefinitely until manually stopped
      // toast.info('Shuffling started');
    }
  };

  // Handle close
  const handleClose = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    resetGame();
    navigate("/game");
    localStorage.removeItem("bonusAmount");
    localStorage.removeItem("bonusPattern");
  };

  // Handle close modal
  const handleCloseModal = () => {
    setOpenModal(false);
    setCardNumbers([]);
    setCartelaData(null);
    setBingoState({});
    setPatternTypes([]);
    setCardIdInput("");
    setBonusAwarded(false);
  };

  // Handle pattern select open
  const handlePatternSelectOpen = (event) => {
    setPatternAnchorEl(event.currentTarget);
  };

  // Handle pattern select close
  const handlePatternSelectClose = () => {
    setPatternAnchorEl(null);
  };

  // Compute possible winning patterns
  const possiblePatterns = useMemo(() => {
    //
    const patterns = [];

    if (META_PATTERNS[primaryPattern]) {
      patterns.push({
        type: formatPatternName(primaryPattern),
        progressGrid: Array(25).fill(true),
        source: "primary",
      });
    } else if (BINGO_PATTERNS[primaryPattern]) {
      BINGO_PATTERNS[primaryPattern].forEach((patternCells) => {
        const grid = Array(25).fill(false);
        patternCells.forEach((cell) => {
          const gridIndex = cellToGridIndex(cell);
          grid[gridIndex] = true;
        });
        patterns.push({
          type: formatPatternName(primaryPattern),
          progressGrid: grid,
          source: "primary",
        });
      });
    }

    if (bonusPattern) {
      if (META_PATTERNS[bonusPattern]) {
        patterns.push({
          type: formatPatternName(bonusPattern),
          progressGrid: Array(25).fill(true),
          source: "bonus",
        });
      } else if (BINGO_PATTERNS[bonusPattern]) {
        BINGO_PATTERNS[bonusPattern].forEach((patternCells) => {
          const grid = Array(25).fill(false);
          patternCells.forEach((cell) => {
            const gridIndex = cellToGridIndex(cell);
            grid[gridIndex] = true;
          });
          patterns.push({
            type: formatPatternName(bonusPattern),
            progressGrid: grid,
            source: "bonus",
          });
        });
      }
    }
    //
    return patterns;
  }, [primaryPattern, bonusPattern]);

  // Animate winning patterns
  useEffect(() => {
    //
    if (possiblePatterns.length === 0) {
      setPatternAnimationIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setPatternAnimationIndex((prev) => {
        const maxIndex = Math.max(1, possiblePatterns.length) - 1;
        const nextIndex = prev >= maxIndex ? 0 : prev + 1;
        //
        return nextIndex;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [possiblePatterns]);

  return {
    enableDynamicBonus,
    dynamicBonusAmount: dynamicBonus,
    setDynamicBonus,
    calledNumbers,
    setCalledNumbers,
    recentCalls,
    setRecentCalls,
    currentNumber,
    setCurrentNumber,
    previousNumber,
    setPreviousNumber,
    callCount,
    setCallCount,
    isPlaying,
    setIsPlaying,
    isReady,
    setIsReady,
    isShuffling,
    setIsShuffling,
    cardIdInput,
    setCardIdInput,
    openModal,
    setOpenModal,
    cardNumbers,
    setCardNumbers,
    cartelaData,
    setCartelaData,
    bingoState,
    setBingoState,
    patternTypes,
    setPatternTypes,
    lockedCards,
    setLockedCards,
    allCardNumbers,
    setAllCardNumbers,
    isLoading,
    setIsLoading,
    drawSpeed,
    setDrawSpeed,
    patternAnchorEl,
    setPatternAnchorEl,
    voiceOption,
    setVoiceOption,
    prefixedNumber,
    setPrefixedNumber,
    patternAnimationIndex,
    setPatternAnimationIndex,
    gameDetails,
    setGameDetails,
    isGameEnded,
    setIsGameEnded,
    selectedBackground,
    setSelectedBackground,
    primaryPattern,
    setPrimaryPattern: debouncedSetPrimaryPattern,
    hasGameStarted,
    setHasGameStarted,
    drawNumber,
    playAudio,
    playWinnerAudio,
    playStartAudio,
    playStopAudio,
    playLoseAudio,
    playBlockedAudio,
    playShuffleSound,
    checkWinner,
    handleEndGame,
    clearLockedCards,
    togglePlayPause,
    handleReady,
    handleReset,
    handleShuffleClick,
    handleClose,
    handleCloseModal,
    handlePatternSelectOpen,
    handlePatternSelectClose,
    handleVoiceChange,
    handleBackgroundChange,
    possiblePatterns,
    bonusAwarded,
    setBonusAwarded,
    bonusAmountGiven,
    isBonusGloballyActive,
    setIsBonusGloballyActive,
    bonusAmount,
    setBonusAmount: debouncedSetBonusAmount,
    bonusPattern,
    setBonusPattern: debouncedSetBonusPattern,

    showCentralBall,
    isCentralBallMoving,
    moveDuration: Math.max(400, Math.floor(600 * (drawSpeed / 3000))),
    blowerZoomBall,
    // Manual call function for GameControlsBar
    callNextNumber: drawNumber,
  };
};

export default useGameLogic;
