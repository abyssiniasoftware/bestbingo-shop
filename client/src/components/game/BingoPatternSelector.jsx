import React, { useState, useEffect } from "react";
import { BINGO_PATTERNS } from "../../utils/patterns";

const BingoPatternSelector = () => {
  const [selectedPattern, setSelectedPattern] = useState(localStorage.getItem("selectedPattern") || "");

  useEffect(() => {
    localStorage.setItem("selectedPattern", selectedPattern);
  }, [selectedPattern]);

  const formatPatternLabel = (pattern) =>
    pattern
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/(\d+)/g, " $1")
      .replace(/([A-Z]+)/g, (match) => match.charAt(0).toUpperCase() + match.slice(1).toLowerCase())
      .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());

  const getHighlightedCells = () => (selectedPattern ? BINGO_PATTERNS[selectedPattern]?.flat() || [] : []);

  return (
    <div className="mt-6 p-4 bg-gray-900 text-white rounded-xl">
      <h2 className="text-lg font-semibold text-center mb-2">🎯 Bingo Pattern</h2>
      <select
        value={selectedPattern}
        onChange={(e) => setSelectedPattern(e.target.value)}
        className="w-full p-2 rounded bg-white text-gray-800"
      >
        <option value="" disabled>
          Select a pattern
        </option>
        {Object.keys(BINGO_PATTERNS).map((pattern) => (
          <option key={pattern} value={pattern}>
            {formatPatternLabel(pattern)}
          </option>
        ))}
      </select>
      {selectedPattern && (
        <div className="mt-4">
          <p className="text-sm text-center">
            Selected: <span className="font-medium text-blue-400">{formatPatternLabel(selectedPattern)}</span>
          </p>
          <div className="grid grid-cols-5 gap-1 mt-2 max-w-xs mx-auto">
            {Array.from({ length: 5 }, (_, row) =>
              ["b", "i", "n", "g", "o"].map((col) => {
                const cell = `${col}${row + 1}`;
                return (
                  <div
                    key={cell}
                    className={`w-10 h-10 flex items-center justify-center rounded ${
                      getHighlightedCells().includes(cell) ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {cell.toUpperCase()}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BingoPatternSelector;