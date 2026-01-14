import React, { useRef } from "react";
import { toast } from "react-toastify";
import { IoMdCloseCircle } from "react-icons/io";
import { letterStyles } from "../../constants/bingo";
import { validateInput } from "../../utils/bingoUtils";
import apiService from "../../api/apiService";

const EditCartelaModal = ({
  isOpen,
  onClose,
  userId,
  selectedCard,
  bingoCardData,
  setBingoCardData,
  updatedBingoCard,
  setUpdatedBingoCard,
  isLoading,
  invalidFields,
  setInvalidFields,
}) => {
  const inputRefs = useRef({});

  const handleInputChange = (key, value) => {
    if (key === "n3") return;
    setUpdatedBingoCard({ ...updatedBingoCard, [key]: value });
  };

  const handleBlur = (key) => {
    if (key === "n3") return;
    const value = updatedBingoCard[key];
    if (!validateInput(key, value)) {
      toast.error(
        `Invalid value for ${key.toUpperCase()}: must be between ${
          validateInput(key, 0)
            ? validateInput(key, 0).join(" and ")
            : "valid range"
        }`,
      );
      setInvalidFields((prev) => ({ ...prev, [key]: true }));
      setUpdatedBingoCard({
        ...updatedBingoCard,
        [key]: bingoCardData[key] || "",
      });
    } else {
      setInvalidFields((prev) => {
        const newInvalid = { ...prev };
        delete newInvalid[key];
        return newInvalid;
      });
      setUpdatedBingoCard({ ...updatedBingoCard, [key]: parseInt(value, 10) });
    }
  };

  const handleFocus = (key, e) => {
    if (invalidFields[key]) {
      e.preventDefault();
      e.target.blur();
      toast.error(
        "Please correct the invalid value before moving to another field.",
      );
    }
  };

  const handleKeyDown = (key, e) => {
    if (key === "n3") return;
    if (e.key === "Backspace" && updatedBingoCard[key].length > 0) {
      const newValue = updatedBingoCard[key].slice(0, -1);
      setUpdatedBingoCard({ ...updatedBingoCard, [key]: newValue });
    }
  };

  const handleSubmit = async () => {
    for (const key in updatedBingoCard) {
      if (
        key === "n3" ||
        key === "_id" ||
        key === "cardId" ||
        key === "userId" ||
        key === "createdAt" ||
        key === "__v"
      )
        continue;
      if (!validateInput(key, updatedBingoCard[key])) {
        toast.error(
          `Invalid value for ${key.toUpperCase()}: must be between ${
            validateInput(key, 0)
              ? validateInput(key, 0).join(" and ")
              : "valid range"
          }`,
        );
        return;
      }
    }
    try {
      const token = localStorage.getItem("token");
      await apiService.updateBingoCard(
        userId,
        selectedCard,
        updatedBingoCard,
        token,
      );
      toast.success("Bingo card updated successfully");
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to update cartela");
    }
  };

  const handleDelete = async (cardId) => {
    if (!window.confirm("Are you sure you want to delete this Bingo card?"))
      return;
    try {
      const token = localStorage.getItem("token");
      await apiService.deleteBingoCard(userId, cardId, token);
      toast.success("Cartela deleted successfully!");
      localStorage.removeItem("cachedCardIds");
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to delete cartela");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800/70 z-50 p-4">
      <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            ካርቴላ {selectedCard}ን ያስተካክሉ
          </h1>
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full w-10 h-10 flex items-center justify-center transition transform hover:scale-105"
            aria-label="Close modal"
          >
            <IoMdCloseCircle size={24} />
          </button>
        </div>
        {isLoading || !bingoCardData ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : (
          <div className="bg-gray-200 p-4 rounded-lg shadow-inner border-4 border-gray-400">
            <div className="grid grid-cols-5 gap-1 sm:gap-2 bg-white p-2 rounded-lg shadow-md">
              {["B", "I", "N", "G", "O"].map((letter, colIndex) => (
                <div key={letter} className="flex flex-col items-center">
                  <div
                    className={`font-bold text-lg sm:text-xl text-white mb-2 rounded-full w-9 h-9 flex items-center justify-center shadow-md ${letterStyles[letter]}`}
                  >
                    {letter}
                  </div>
                  {Array.from({ length: 5 }, (_, rowIndex) => {
                    const key = `${letter.toLowerCase()}${rowIndex + 1}`;
                    const value = bingoCardData[key];
                    const formattedValue = value === 0 ? "FREE" : value;
                    return (
                      <input
                        key={key}
                        type="text"
                        value={updatedBingoCard[key] ?? formattedValue}
                        onChange={(e) => handleInputChange(key, e.target.value)}
                        onBlur={() => handleBlur(key)}
                        onFocus={(e) => handleFocus(key, e)}
                        onKeyDown={(e) => handleKeyDown(key, e)}
                        ref={(el) => (inputRefs.current[key] = el)}
                        className={`font-semibold rounded-lg p-2 text-center w-10 sm:w-12 h-10 sm:h-12 text-sm sm:text-base border-2 bg-white shadow-sm ${
                          value === 0
                            ? "bg-red-200 text-gray-900 cursor-not-allowed border-red-300"
                            : invalidFields[key]
                              ? "bg-red-100 text-gray-900 border-red-500"
                              : "text-gray-900 border-gray-300 focus:border-blue-500 focus:outline-none"
                        }`}
                        disabled={value === 0}
                        aria-label={`Enter number for ${letter}${rowIndex + 1}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex justify-between mt-6 gap-2">
          <button
            onClick={handleSubmit}
            disabled={
              isLoading ||
              !bingoCardData ||
              Object.keys(invalidFields).length > 0
            }
            className={`flex-1 bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition transform hover:scale-105 ${
              isLoading ||
              !bingoCardData ||
              Object.keys(invalidFields).length > 0
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-700"
            }`}
            aria-label="Submit changes"
          >
            አስተካክል
          </button>
          <button
            onClick={() => handleDelete(selectedCard)}
            disabled={isLoading}
            className={`flex-1 bg-red-600 text-white font-bold py-2 px-4 rounded-full transition transform hover:scale-105 ${
              isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-red-700"
            }`}
            aria-label="Delete cartela"
          >
            አጥፋ
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCartelaModal;
