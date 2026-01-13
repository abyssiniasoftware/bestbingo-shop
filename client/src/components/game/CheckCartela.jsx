import React, { useState, useEffect } from "react";
import { LuLoader } from "react-icons/lu";
import { MdCancel } from "react-icons/md";
import classNames from "classnames";
import { toast } from "react-toastify";
import { BINGO_PATTERNS, META_PATTERNS } from "../../utils/patterns";

const CheckCartela = ({
  checkCardId,
  closeModal,
  liveResults,
  gameNo,
  finished,
  userId,
  voiceOption,
}) => {
  const [cartelaData, setCartelaData] = useState(null);
  const [bingoState, setBingoState] = useState({});
  const [patternTypes, setPatternTypes] = useState([]);
  const [numbers, setNumbers] = useState(
    JSON.parse(localStorage.getItem("numbers")) || []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const selectedPattern = localStorage.getItem("selectedPattern") || null;
  const winnerType = "2";

  useEffect(() => {
    const fetchCartelaData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_APP_API_URL
          }/api/bingo/get/${userId}/${checkCardId}`
        );
        if (!response.ok) throw new Error("ካርቴላ ማግኘት አልተቻለም");
        const data = await response.json();
        const formattedData = {};
        Object.keys(data).forEach((key) => {
          const [prefix, number] = key.split("");
          const formattedKey = prefix.toLowerCase() + number;
          if (
            ["b", "i", "n", "g", "o"].includes(prefix.toLowerCase()) &&
            ["1", "2", "3", "4", "5"].includes(number)
          ) {
            formattedData[number] = formattedData[number] || {};
            formattedData[number][formattedKey] = data[key];
          }
        });
        setCartelaData(formattedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCartelaData();
  }, [checkCardId, userId]);

  useEffect(() => {
    if (!cartelaData) return;
    const updatedState = {};
    Object.keys(cartelaData).forEach((row) => {
      Object.keys(cartelaData[row]).forEach((cell) => {
        if (cell === "n3") {
          updatedState[cell] = true;
        } else {
          const value = parseInt(cartelaData[row][cell], 10);
          updatedState[cell] = liveResults
            .map((num) => parseInt(num, 10))
            .includes(value);
        }
      });
    });
    setBingoState(updatedState);
  }, [cartelaData, liveResults]);

  useEffect(() => {
    if (!cartelaData || !bingoState) return;
    const patterns = new Set();
    Object.keys(BINGO_PATTERNS).forEach((patternType) => {
      BINGO_PATTERNS[patternType].forEach((pattern) => {
        if (pattern.every((cell) => bingoState[cell] === true)) {
          patterns.add(patternType);
        }
      });
    });
    setPatternTypes(Array.from(patterns));
  }, [bingoState, cartelaData]);

  useEffect(() => {
    const playWinnerAudio = async () => {
      const isMetaPattern = selectedPattern && META_PATTERNS[selectedPattern];
      const isRegularPattern =
        selectedPattern && BINGO_PATTERNS[selectedPattern];
      const metaSatisfied =
        isMetaPattern &&
        patternTypes.length >= META_PATTERNS[selectedPattern].required;
      const regularSatisfied =
        isRegularPattern && patternTypes.includes(selectedPattern);
      if (
        selectedPattern &&
        (metaSatisfied || regularSatisfied) &&
        (winnerType === "1" ||
          (winnerType === "2" && (metaSatisfied || patternTypes.length > 1)))
      ) {
        const audio = new Audio(
          (await import(`../../voice/utilVoice.winner`)).default
        );
        audio.play();
      }
    };
    playWinnerAudio();
  }, [patternTypes, voiceOption, selectedPattern]);

  const declareWinner = async () => {
    const isMetaPattern = selectedPattern && META_PATTERNS[selectedPattern];
    const isRegularPattern = selectedPattern && BINGO_PATTERNS[selectedPattern];
    const metaSatisfied =
      isMetaPattern &&
      patternTypes.length >= META_PATTERNS[selectedPattern].required;
    const regularSatisfied =
      isRegularPattern && patternTypes.includes(selectedPattern);
    if (!selectedPattern || !(metaSatisfied || regularSatisfied)) return;
    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_APP_API_URL
        }/api/game/${gameNo}/${userId}/updateWinnerCartela`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checkCardId }),
        }
      );
      if (!response.ok) throw new Error("አሸናፊን ማውጣት አልተቻለም");
      toast.success("አሸናፊ ተገልጿል!");
      finished();
      closeModal();
    } catch (err) {
      toast.error("አሸናፊን ለማውጣት ስህተት");
    }
  };

  const addNumber = () => {
    const updatedNumbers = [...numbers, checkCardId];
    setNumbers(updatedNumbers);
    localStorage.setItem("numbers", JSON.stringify(updatedNumbers));
    toast.info(`ካርቴላ ${checkCardId} ተቆልሏል`);
  };

  const clearNumbers = () => {
    setNumbers([]);
    localStorage.removeItem("numbers");
    toast.info("ሁሉም ካርቴላዎች ተከፍተዋል");
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <LuLoader className="animate-spin text-5xl text-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-lg">ስህተት: {error}</div>
      </div>
    );
  }

  if (!cartelaData) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-lg">ዳታ የለም</div>
      </div>
    );
  }

  const isMetaPattern = selectedPattern && META_PATTERNS[selectedPattern];
  const isRegularPattern = selectedPattern && BINGO_PATTERNS[selectedPattern];
  const metaSatisfied =
    isMetaPattern &&
    patternTypes.length >= META_PATTERNS[selectedPattern].required;
  const regularSatisfied =
    isRegularPattern && patternTypes.includes(selectedPattern);
  const isWinner = selectedPattern && (metaSatisfied || regularSatisfied);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <button
          onClick={closeModal}
          className="absolute top-2 right-2 text-red-500"
        >
          <MdCancel className="text-2xl" />
        </button>
        <h2 className="text-lg font-bold">
          ጨዋታ {gameNo} - ካርድ {checkCardId}
        </h2>
        <p className="text-sm text-gray-600">ቅርጽ: {selectedPattern || "የለም"}</p>
        <div className="text-sm text-green-800 my-4">
          ተቆልሏል: {numbers.length > 0 ? numbers.join(", ") : "የለም"}
          <button
            onClick={clearNumbers}
            className="ml-2 px-4 py-1 bg-red-500 text-white rounded"
          >
            ሁሉንም ክፈት
          </button>
        </div>
        <div className="my-4">
          {isWinner ? (
            <h2 className="text-2xl font-bold text-green-600">
              አሸናፊ! {patternTypes.length} ቅርጾች ተመሳስለዋል
            </h2>
          ) : (
            <h2 className="text-2xl font-bold text-red-600">
              የተሸነፈ! {patternTypes.length} ቅርጾች ተመሳስለዋል
            </h2>
          )}
        </div>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(cartelaData).map(([number, values]) =>
            Object.entries(values).map(([prefix, value]) => {
              const isFreeCell = value === 0;
              const isLiveResult = liveResults
                .map((num) => parseInt(num, 10))
                .includes(parseInt(value, 10));
              return (
                <div
                  key={`${prefix}-${number}`}
                  className={classNames(
                    "p-2 rounded text-center font-semibold",
                    {
                      "bg-green-600 text-white":
                        isFreeCell || (isLiveResult && isWinner),
                      "bg-red-600 text-white": isLiveResult && !isWinner,
                      "bg-gray-200": !isFreeCell && !isLiveResult,
                    }
                  )}
                >
                  {isFreeCell ? "ነፃ" : value}
                </div>
              );
            })
          )}
        </div>
        <div className="flex justify-center gap-4 mt-4">
          {isWinner && (
            <button
              onClick={declareWinner}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              እሺ ዝጋ
            </button>
          )}
          <button
            onClick={addNumber}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            ካርድ አጠር
          </button>
          <button
            onClick={closeModal}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            ዝጋ
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckCartela;
