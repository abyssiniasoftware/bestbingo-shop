import React, { useState } from "react";
import { toast } from "react-toastify";
import { IoMdCloseCircle } from "react-icons/io";
import { initialCartelaData, letterStyles } from "../../constants/bingo";
import { validateInput } from "../../utils/bingoUtils";
import apiService from "../../api/apiService";

const AddCartelaModal = ({ isOpen, onClose, userId, onCartelaAdded }) => {
  const [cartelaData, setCartelaData] = useState(initialCartelaData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCartelaData({ ...cartelaData, [name]: value });
  };

  const handleBlur = (key) => {
    if (key === "n3" || key === "cardId") return;
    const value = cartelaData[key];
    if (!validateInput(key, value)) {
      toast.error(
        `Invalid value for ${key.toUpperCase()}: must be between ${validateInput(key, 0)
          ? validateInput(key, 0).join(" and ")
          : "valid range"
        }`,
      );
      setCartelaData({ ...cartelaData, [key]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (const key in cartelaData) {
      if (key === "n3" || key === "cardId") continue;
      if (!validateInput(key, cartelaData[key])) {
        toast.error(
          `Invalid value for ${key.toUpperCase()}: must be between ${validateInput(key, 0)
            ? validateInput(key, 0).join(" and ")
            : "valid range"
          }`,
        );
        return;
      }
    }

    try {
      await apiService.createBingoCard({ ...cartelaData, userId });
      toast.success("Bingo card created successfully!");
      setCartelaData(initialCartelaData);
      onCartelaAdded();
      onClose();
    } catch (error) {
      toast.error(error.message || "Error creating bingo card.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800/70 z-50 p-4">
      <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            ካርቴላ መፍጠሪያ
          </h1>
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full w-10 h-10 flex items-center justify-center transition transform hover:scale-105"
            aria-label="Close modal"
          >
            <IoMdCloseCircle size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="cardId"
            value={cartelaData.cardId}
            onChange={handleChange}
            placeholder="Card ID"
            className="w-full p-2 border rounded bg-gray-100 text-gray-900 focus:border-blue-500 focus:outline-none"
            required
          />
          <div className="bg-gray-200 p-4 rounded-lg shadow-inner border-4 border-gray-400">
            <div className="grid grid-cols-5 gap-1 sm:gap-2">
              {["B", "I", "N", "G", "O"].map((letter) => (
                <div key={letter} className="flex flex-col items-center">
                  <div
                    className={`font-bold text-lg sm:text-xl text-white mb-2 rounded-full w-9 h-9 flex items-center justify-center ${letterStyles[letter]}`}
                  >
                    {letter}
                  </div>
                  {Array.from({ length: 5 }, (_, i) => {
                    const index = i + 1;
                    const field = `${letter.toLowerCase()}${index}`;
                    return (
                      <input
                        key={field}
                        type="text"
                        name={field}
                        value={cartelaData[field]}
                        onChange={handleChange}
                        onBlur={() => handleBlur(field)}
                        placeholder={field === "n3" ? "FREE" : ""}
                        className={`font-semibold rounded-lg p-2 text-center w-10 sm:w-12 h-10 sm:h-12 text-sm sm:text-base border-2 ${field === "n3"
                            ? "bg-red-200 text-gray-900 cursor-not-allowed border-red-300"
                            : "bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:outline-none"
                          }`}
                        disabled={field === "n3"}
                        required={field !== "n3"}
                        aria-label={`Enter number for ${letter}${index}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition transform hover:scale-105 hover:bg-blue-700"
          >
            ካርቴላዉን ያክሉ
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCartelaModal;
