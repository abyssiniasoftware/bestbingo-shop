import React, { useState } from "react";
import { toast } from "react-toastify";
import { IoMdCloseCircle } from "react-icons/io";
import { validateInput, parseFile } from "../../utils/bingoUtils";
import apiService from "../../api/apiService";

const BulkUploadModal = ({ isOpen, onClose, userId, onBulkUpload }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    setIsUploading(true);
    try {
      const cards = await parseFile(file);
      if (!cards.length) {
        throw new Error("No valid card data found in file");
      }

      const formattedCards = cards.map((card, index) => {
        const formattedCard = {
          cardId: card.cardId || `${index + 1}`,
          b1: parseInt(card.b1, 10),
          b2: parseInt(card.b2, 10),
          b3: parseInt(card.b3, 10),
          b4: parseInt(card.b4, 10),
          b5: parseInt(card.b5, 10),
          i1: parseInt(card.i1, 10),
          i2: parseInt(card.i2, 10),
          i3: parseInt(card.i3, 10),
          i4: parseInt(card.i4, 10),
          i5: parseInt(card.i5, 10),
          n1: parseInt(card.n1, 10),
          n2: parseInt(card.n2, 10),
          n3: parseInt(card.n3, 10) || 0,
          n4: parseInt(card.n4, 10),
          n5: parseInt(card.n5, 10),
          g1: parseInt(card.g1, 10),
          g2: parseInt(card.g2, 10),
          g3: parseInt(card.g3, 10),
          g4: parseInt(card.g4, 10),
          g5: parseInt(card.g5, 10),
          o1: parseInt(card.o1, 10),
          o2: parseInt(card.o2, 10),
          o3: parseInt(card.o3, 10),
          o4: parseInt(card.o4, 10),
          o5: parseInt(card.o5, 10),
          userId,
        };

        for (const key in formattedCard) {
          if (key === "cardId" || key === "userId") continue;
          if (!validateInput(key, formattedCard[key])) {
            throw new Error(
              `Invalid value for ${key.toUpperCase()} in card ${
                formattedCard.cardId
              }: must be between ${
                validateInput(key, 0)
                  ? validateInput(key, 0).join(" and ")
                  : "valid range"
              }`,
            );
          }
        }

        return formattedCard;
      });

      const token = localStorage.getItem("token");
      await apiService.bulkUploadCards(userId, formattedCards, token);
      toast.success("Bulk cards uploaded successfully!");
      setFile(null);
      onBulkUpload();
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to process bulk upload");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800/70 z-50 p-4">
      <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Bulk Upload Cards
          </h2>
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
            type="file"
            accept=".json,.csv,.xlsx,.xls"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full p-2 border rounded bg-gray-100 text-gray-900 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!file || isUploading}
            className={`w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition transform hover:scale-105 ${
              !file || isUploading
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-blue-700"
            }`}
          >
            {isUploading ? "Uploading..." : "Upload Cards"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BulkUploadModal;
