import React from "react";
import { backgroundButtonColors } from "../constants/constants";

const CardGrid = ({
  cardIds,
  cartela,
  handleCardIdClick,
  isLoading,
  selectedBackground,
}) => {
  const buttonBgColor =
    backgroundButtonColors[selectedBackground] || "bg-gray-700";
  const buttonHoverColor = `${buttonBgColor.replace(
    "bg-",
    "hover:bg-"
  )} hover:bg-opacity-80`;
  return (
    <div className=" p-2 rounded-lg">
      {isLoading && cardIds.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      ) : cardIds.length === 0 ? (
        <p className="text-red-500" aria-live="assertive">
          No cards available. Please add some via the{" "}
          <a href="/add-cartela" className="underline">
            Add Cartela
          </a>{" "}
          page.
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(60px,1fr))] gap-1 sm:gap-2">
          {cardIds.map((number) => (
            <button
              key={number}
              onClick={() => handleCardIdClick(number)}
              className={`w-full aspect-square rounded-lg font-bold text-2xl sm:text-3xl transition-all duration-300 transform hover:scale-105 text-white ${
                cartela.includes(number.toString())
                  ? "bg-red-700  shadow-lg"
                  : `${buttonBgColor} ${buttonHoverColor}`
              }`}
              aria-label={`Select cartela ${number}`}
              aria-pressed={cartela.includes(number.toString())}
            >
              {number}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CardGrid;
