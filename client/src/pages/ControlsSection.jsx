import React from "react";
import { FaEye, FaEyeSlash, FaSync } from "react-icons/fa";
import { BET_AMOUNT_OPTIONS, CUT_AMOUNT_OPTIONS } from "../constants";
import { BINGO_PATTERNS } from "../utils/patterns";
import { formatPatternName } from "../utils/gameUtils";

const ControlsSection = ({
  betAmount,
  setBetAmount,
  useDropdown,
  setUseDropdown,
  cutAmount,
  setCutAmount,
  cartelaInput,
  setCartelaInput,
  showCutAmount,
  toggleCutAmount,
  showCardCount,
  toggleCardCount,
  cartela,
  cardIds,
  handleCartelaInput,
  handleCartelaKeyDown,
  isCartelaInputValid,
  showSensitiveInfo,
  toggleSensitiveInfo,
  winAmount,
  handleStartGame,
  handleClearSelections,
  isLoading,
  backgroundOptions,
  selectedBackground,
  handleBackgroundChange,
  handleRefreshCards,
  handleRefreshCutAmount,
  bonusAmount,
  setBonusAmount,
  bonusPattern,
  setBonusPattern,
}) => {
  const patternForBonus = ["xPattern", "lPattern", "tPattern"];
  const validPatterns = [
    ...Object.keys(BINGO_PATTERNS).filter((p) => patternForBonus.includes(p)),
    "badBingo",
  ];

  return (
    <div className="flex flex-col sm:flex-row flex-wrap justify-between items-center gap-3 sm:gap-4 p-4 rounded-lg">
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <label htmlFor="bet-amount" className="text-lg font-semibold">
          መደብ
        </label>
        {useDropdown ? (
          <select
            id="bet-amount"
            value={betAmount}
            onChange={(e) =>
              setBetAmount(Math.max(10, parseInt(e.target.value) || 10))
            }
            className="bg-gray-700 text-white rounded px-2 py-1 focus:outline-none w-20"
            aria-label="የመደብ መጠን ይምረጡ"
          >
            {BET_AMOUNT_OPTIONS.map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBetAmount((prev) => Math.max(prev - 10, 10))}
              className="bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-600 transition"
              aria-label="የመደብ መጠን ይቀንሱ"
            >
              -
            </button>
            <span className="text-lg" aria-live="polite">
              {betAmount}
            </span>
            <button
              onClick={() => setBetAmount((prev) => prev + 10)}
              className="bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-600 transition"
              aria-label="የመደብ መጠን ይጨምሩ"
            >
              +
            </button>
          </div>
        )}
        <input
          type="checkbox"
          checked={useDropdown}
          onChange={(e) => setUseDropdown(e.target.checked)}
          aria-label="የመደብ መጠን ለመምረጥ የሚያስችል ምናሌ ይጠቀሙ"
        />
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <select
          id="background-select"
          value={selectedBackground}
          onChange={handleBackgroundChange}
          className="bg-gray-700 text-white rounded px-2 py-1 focus:outline-none w-36"
          aria-label="የጀርባ ገጽታ ይምረጡ"
        >
          {backgroundOptions.map((bg) => (
            <option key={bg.value} value={bg.value}>
              {bg.label}
            </option>
          ))}
        </select>
      </div>
      {showCutAmount && (
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <label htmlFor="cut-amount" className="text-lg font-semibold">
            አይነት
          </label>
          <select
            id="cut-amount"
            value={cutAmount}
            onChange={(e) => setCutAmount(parseInt(e.target.value))}
            className="bg-gray-700 text-white rounded px-2 py-1 focus:outline-none w-20"
            aria-label="የቆረጣ መጠን ይምረጡ"
          >
            {CUT_AMOUNT_OPTIONS.map((val) => (
              <option key={val} value={val}>
                {val}%
              </option>
            ))}
          </select>
        </div>
      )}
      <button
        onClick={toggleCutAmount}
        className="text-white hover:text-gray-300 transition"
        aria-label={showCutAmount ? "ሚስጥራዊ መረጃ ደብቅ" : "ሚስጥራዊ መረጃ አሳይ"}
      >
        {showCutAmount ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
      </button>
      <button
        onClick={handleRefreshCutAmount}
        disabled={isLoading}
        className={`${
          isLoading
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
        } text-white rounded-full w-6 h-6 flex items-center justify-center transition transform hover:scale-105`}
        aria-label="የቆራጥ መጠን ያድስ"
      >
        <FaSync size={12} />
      </button>
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <label htmlFor="bonus-amount" className="text-lg font-semibold">
          የቦነስ መጠን
        </label>
        <input
          id="bonus-amount"
          type="number"
          value={bonusAmount}
          onChange={(e) =>
            setBonusAmount(Math.max(0, parseInt(e.target.value) || 0))
          }
          className="bg-gray-700 text-white rounded px-2 py-1 w-20 focus:outline-none"
          placeholder="መጠን"
          aria-label="የቦነስ መጠን ያስገቡ"
        />
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <label htmlFor="bonus-pattern" className="text-lg font-semibold">
          የቦነስ ፓተርን
        </label>
        <select
          id="bonus-pattern"
          value={bonusPattern}
          onChange={(e) => setBonusPattern(e.target.value)}
          className="bg-gray-700 text-white rounded px-2 py-1 focus:outline-none w-36"
          aria-label="የቦነስ ፓተርን ይምረጡ"
        >
          <option value="">ምንም</option>
          {validPatterns.map((pattern) => (
            <option key={pattern} value={pattern}>
              {formatPatternName(pattern)}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-2">
        {showCardCount && (
          <label className="text-lg font-semibold">
            የተመረጡ <span>{cartela.length} ካርዶች</span>
          </label>
        )}
        <button
          onClick={toggleCardCount}
          className="text-white hover:text-gray-300 transition"
          aria-label={showCardCount ? "የካርድ ብዛት ደብቅ" : "የካርድ ብዛት አሳይ"}
        >
          {showCardCount ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2 relative">
        <label htmlFor="cartela-input" className="text-lg font-semibold">
          ካርቴላ መያዣ
        </label>
        <div className="relative">
          <input
            id="cartela-input"
            type="text"
            value={cartelaInput}
            onChange={(e) => setCartelaInput(e.target.value)}
            onKeyDown={handleCartelaKeyDown}
            className={`bg-gray-700 text-white rounded px-2 py-1 w-24 focus:outline-none border-2 ${
              cartelaInput && !cardIds.includes(cartelaInput)
                ? "border-red-500"
                : cartelaInput && cartela.includes(cartelaInput)
                ? "border-yellow-500"
                : "border-transparent"
            }`}
            placeholder="ቁጥር ያስገቡ"
            aria-label="ካርቴላ ቁጥር ያስገቡ"
            aria-describedby="cartela-input-status"
          />
          {cartelaInput && !cardIds.includes(cartelaInput) && (
            <span
              id="cartela-input-status"
              className="absolute -bottom-6 left-0 text-red-500 text-xs"
            >
              የማያገለግል መታወቂያ
            </span>
          )}
          {cartelaInput &&
            cardIds.includes(cartelaInput) &&
            cartela.includes(cartelaInput) && (
              <span
                id="cartela-input-status"
                className="absolute -bottom-6 left-0 text-yellow-500 text-xs"
              >
                አስቀድሞ የተመረጠ
              </span>
            )}
        </div>
        <button
          onClick={handleCartelaInput}
          disabled={!isCartelaInputValid()}
          className={`bg-gray-700 text-white rounded-full w-8 h-8 flex items-center justify-center transition ${
            isCartelaInputValid()
              ? "hover:bg-gray-600"
              : "opacity-50 cursor-not-allowed"
          }`}
          aria-label="ካርቴላ መታወቂያ ያክሉ"
        >
          +
        </button>
      </div>

      <div className="flex gap-2">
        <h2 className="text-lg font-semibold">
          {showSensitiveInfo && (
            <span className="ml-0 text-sm font-normal text-gray-400">
              {winAmount}
            </span>
          )}
        </h2>
        <button
          onClick={toggleSensitiveInfo}
          className="text-white hover:text-gray-300 transition"
          aria-label={showSensitiveInfo ? "ሚስጥራዊ መረጃ ደብቅ" : "ሚስጥራዊ መረጃ አሳይ"}
        >
          {showSensitiveInfo ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleStartGame}
          disabled={isLoading}
          className={`${
            isLoading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white rounded-full w-10 h-10 flex items-center justify-center transition transform hover:scale-105`}
          aria-label="ጨዋታ ጀምር"
        >
          ጀምር
        </button>

        <button
          onClick={handleRefreshCards}
          disabled={isLoading}
          className={`${
            isLoading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          } text-white rounded-full w-10 h-10 flex items-center justify-center transition transform hover:scale-105`}
          aria-label="የካርድ መታወቂያዎችን ያድስ"
        >
          <FaSync size={20} />
        </button>
        <button
          onClick={handleClearSelections}
          className="bg-red-600 hover:bg-red-700 text-white rounded-full w-10 h-10 flex items-center justify-center transition transform hover:scale-105"
          aria-label="የተመረጡትን አጥፋ"
        >
          አጥፋ
        </button>
      </div>
    </div>
  );
};

export default ControlsSection;
