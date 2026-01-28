import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import useUserStore from "../stores/userStore";
import apiService from "../api/apiService";
import AddCartelaModal from "../components/ui/AddCartelaModal";
import BulkUploadModal from "../components/ui/BulkUploadModal";
import EditCartelaModal from "../components/ui/EditCartelaModal";

const ViewCartela = () => {
  const [cardIds, setCardIds] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [bulkUploadModalVisible, setBulkUploadModalVisible] = useState(false);
  const [bingoCardData, setBingoCardData] = useState(null);
  const [updatedBingoCard, setUpdatedBingoCard] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [invalidFields, setInvalidFields] = useState({});
  const {
    user,
    userId,
    role,
    houseId: storeHouseId,
    enableDynamicBonus,
    setUser,
  } = useUserStore();

  const [localHouseId, setLocalHouseId] = useState(null);
  const [isBonusGloballyActive, setIsBonusGloballyActive] = useState(() => {
    const storedValue = localStorage.getItem("isBonusGloballyActive");
    return storedValue === "true";
  });
  const [isBonusHidden, setIsBonusHidden] = useState(() => {
    const storedValue = localStorage.getItem("isBonusHidden");
    return storedValue === "true";
  });
  // Local toggle for Bad Bingo (zero-match win)
  const [isBadBingoActive, setIsBadBingoActive] = useState(() => {
    const stored = localStorage.getItem("isBadBingoActive");
    return stored === "true";
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const userData = await apiService.fetchUserDetails(userId, token);
          setUser({
            id: userData.id,
            username: userData.username,
            role: userData.role,
            houseId: userData.houseId,
            enableDynamicBonus: userData.enableDynamicBonus || false,
            package: userData.package,
          });
          setLocalHouseId(userData.houseId || null);
        } catch (error) {
          toast.error(error.message || "Failed to fetch user details");
        }
      }
    };
    fetchUserData();
  }, [setUser, userId]);
  //Initialize isBonusGloballyActive from localStorage on mount
  useEffect(() => {
    const storedValue = localStorage.getItem("isBonusGloballyActive");
    setIsBonusGloballyActive(storedValue === "true");
    const storedBonusHidden = localStorage.getItem("isBonusHidden");
    setIsBonusHidden(storedBonusHidden === "true");
  }, []);

  const handleMarkBonusInactive = async () => {
    if (!storeHouseId || !userId) {
      toast.error("House ID or User ID is missing");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await apiService.markBonusInactive(storeHouseId, userId, token);
      toast.success("Bonus has been marked as inactive");
    } catch (error) {
      toast.error(error.message || "Failed to mark bonus as inactive");
    }
  };

  const handleToggleGlobalBonus = () => {
    const newActiveState = !isBonusGloballyActive;
    setIsBonusGloballyActive(newActiveState);
    localStorage.setItem("isBonusGloballyActive", newActiveState.toString());
    toast.success(
      `Global bonus system ${newActiveState ? "activated" : "deactivated"}.`,
    );
  };

  // Toggle for Bad Bingo (zero-match win)
  const handleToggleBadBingo = () => {
    const newActiveState = !isBadBingoActive;
    setIsBadBingoActive(newActiveState);
    localStorage.setItem("isBadBingoActive", newActiveState.toString());
    toast.success(`Bad Bingo ${newActiveState ? "activated" : "deactivated"}.`);
  };
  const handleToggleBonusHidden = () => {
    const newActiveState = !isBonusHidden;
    setIsBonusHidden(newActiveState);
    localStorage.setItem("isBonusHidden", newActiveState.toString());
    toast.success(
      `Dynamic bonus display ${newActiveState ? "activated" : "deactivated"}.`,
    );
  };

  useEffect(() => {
    const fetchCardIds = async () => {
      if (!userId) return;
      setIsLoading(true);
      try {
        const data = await apiService.fetchCardIds(
          userId,
          localStorage.getItem("token"),
        );
        setCardIds(data.sort((a, b) => parseInt(a) - parseInt(b)));
      } catch (error) {
        toast.error(error.message || "Failed to fetch card IDs");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCardIds();
  }, [userId]);

  const fetchBingoCardData = async (cardId) => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const data = await apiService.fetchCartelaData(
        cardId,
        userId,
        localStorage.getItem("token"),
      );
      const rawData = {};
      Object.keys(data).forEach((row) => {
        Object.assign(rawData, data[row]);
      });
      setBingoCardData(rawData);
      setUpdatedBingoCard(rawData);
    } catch (error) {
      toast.error(error.message || "Failed to fetch bingo card data");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEditModal = (cardId) => {
    if (!editModalVisible) {
      setSelectedCard(cardId);
      fetchBingoCardData(cardId);
    } else {
      setSelectedCard(null);
      setBingoCardData(null);
      setUpdatedBingoCard(null);
      setInvalidFields({});
    }
    setEditModalVisible(!editModalVisible);
  };

  const toggleAddModal = () => {
    setAddModalVisible(!addModalVisible);
  };

  const toggleBulkUploadModal = () => {
    setBulkUploadModalVisible(!bulkUploadModalVisible);
  };

  const handleCartelaAdded = () => {
    const fetchCardIds = async () => {
      if (!userId) return;
      try {
        const data = await apiService.fetchCardIds(
          userId,
          localStorage.getItem("token"),
        );
        setCardIds(data.sort((a, b) => parseInt(a) - parseInt(b)));
        localStorage.removeItem("cachedCardIds");
      } catch (error) {
        toast.error(error.message || "Failed to fetch card IDs");
      }
    };
    fetchCardIds();
  };

  const handleBulkUploaded = () => {
    localStorage.removeItem("cachedCardIds");
    handleCartelaAdded();
  };

  return (
    <div className="w-full">
      <div className="w-full">
        {user ? (
          <div>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
              </div>
            ) : cardIds.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
                <p
                  className="text-red-500 text-xl sm:text-2xl mb-2 font-bold"
                  aria-live="assertive"
                >
                  No cards found.
                </p>
                <p className="mb-6 text-gray-600">Please add new cards.</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={toggleAddModal}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-lg shadow transition transform hover:-translate-y-0.5"
                  >
                    Add Card
                  </button>
                  <button
                    onClick={toggleBulkUploadModal}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition transform hover:scale-105"
                  >
                    Bulk Upload
                  </button>
                  {role === "cashier" && enableDynamicBonus && (
                    <button
                      onClick={handleMarkBonusInactive}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-full transition transform hover:scale-105"
                    >
                      Mark Bonus Inactive
                    </button>
                  )}
                  {/* New Animated Toggle Button for Global Bonus Activation */}
                  {role === "cashier" && (
                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 p-2 px-3 rounded-lg">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Global Bonus:
                      </span>
                      <button
                        onClick={handleToggleGlobalBonus}
                        className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors duration-200 ease-in-out focus:outline-none ${isBonusGloballyActive ? "bg-green-500" : "bg-gray-300"
                          }`}
                        aria-pressed={isBonusGloballyActive}
                      >
                        <span
                          className={`inline-block w-3 h-3 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${isBonusGloballyActive
                            ? "translate-x-5"
                            : "translate-x-1"
                            }`}
                        />
                      </button>
                    </div>
                  )}
                  {role === "cashier" && (
                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 p-2 px-3 rounded-lg">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Dynamic Bonus:
                      </span>
                      <button
                        onClick={handleToggleBonusHidden}
                        className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors duration-200 ease-in-out focus:outline-none ${isBonusHidden ? "bg-green-500" : "bg-gray-300"
                          }`}
                        aria-pressed={isBonusHidden}
                      >
                        <span
                          className={`inline-block w-3 h-3 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${isBonusHidden ? "translate-x-5" : "translate-x-1"
                            }`}
                        />
                      </button>
                    </div>
                  )}
                  {role === "cashier" && (
                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 p-2 px-3 rounded-lg">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Bad Bingo:
                      </span>
                      <button
                        onClick={handleToggleBadBingo}
                        className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors duration-200 ease-in-out focus:outline-none ${isBadBingoActive ? "bg-green-500" : "bg-gray-300"
                          }`}
                        aria-pressed={isBadBingoActive}
                      >
                        <span
                          className={`inline-block w-3 h-3 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${isBadBingoActive ? "translate-x-5" : "translate-x-1"
                            }`}
                        />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap gap-2 sm:gap-4 justify-center">
                  <button
                    onClick={toggleAddModal}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full transition transform hover:scale-105"
                  >
                    Add Card
                  </button>
                  <button
                    onClick={toggleBulkUploadModal}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition transform hover:scale-105"
                  >
                    Bulk Upload
                  </button>
                  {role === "cashier" && enableDynamicBonus && (
                    <button
                      onClick={handleMarkBonusInactive}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-full transition transform hover:scale-105"
                    >
                      Mark Bonus Inactive
                    </button>
                  )}
                  {/* New Animated Toggle Button for Global Bonus Activation */}
                  {role === "cashier" && (
                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 p-2 px-3 rounded-lg">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Global Bonus:
                      </span>
                      <button
                        onClick={handleToggleGlobalBonus}
                        className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors duration-200 ease-in-out focus:outline-none ${isBonusGloballyActive ? "bg-green-500" : "bg-gray-300"
                          }`}
                        aria-pressed={isBonusGloballyActive}
                      >
                        <span
                          className={`inline-block w-3 h-3 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${isBonusGloballyActive
                            ? "translate-x-5"
                            : "translate-x-1"
                            }`}
                        />
                      </button>
                    </div>
                  )}
                  {role === "cashier" && (
                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 p-2 px-3 rounded-lg">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Dynamic Bonus:
                      </span>
                      <button
                        onClick={handleToggleBonusHidden}
                        className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors duration-200 ease-in-out focus:outline-none ${isBonusHidden ? "bg-green-500" : "bg-gray-300"
                          }`}
                        aria-pressed={isBonusHidden}
                      >
                        <span
                          className={`inline-block w-3 h-3 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${isBonusHidden ? "translate-x-5" : "translate-x-1"
                            }`}
                        />
                      </button>
                    </div>
                  )}
                  {role === "cashier" && (
                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 p-2 px-3 rounded-lg">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Bad Bingo:
                      </span>
                      <button
                        onClick={handleToggleBadBingo}
                        className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors duration-200 ease-in-out focus:outline-none ${isBadBingoActive ? "bg-green-500" : "bg-gray-300"
                          }`}
                        aria-pressed={isBadBingoActive}
                      >
                        <span
                          className={`inline-block w-3 h-3 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${isBadBingoActive ? "translate-x-5" : "translate-x-1"
                            }`}
                        />
                      </button>
                    </div>
                  )}
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
                    <span className="w-2 h-6 bg-red-600 rounded-full"></span>
                    Available Cards
                  </h3>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(clamp(60px,18vw,90px),1fr))] gap-3 sm:gap-4">
                    {" "}
                    {cardIds.map((cardId) => (
                      <button
                        key={cardId}
                        onClick={() => toggleEditModal(cardId)}
                        className="w-full aspect-square rounded-xl font-bold text-[clamp(1.5rem,6vw,2.2rem)] bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 hover:border-red-300 hover:text-red-600 shadow-sm transition-all duration-300 transform hover:-translate-y-1"
                        aria-label={`View Card ${cardId}`}
                      >
                        {cardId}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center" aria-live="polite">
            Loading user data...
          </p>
        )}
        <EditCartelaModal
          isOpen={editModalVisible}
          onClose={() => toggleEditModal()}
          userId={userId}
          selectedCard={selectedCard}
          bingoCardData={bingoCardData}
          setBingoCardData={setBingoCardData}
          updatedBingoCard={updatedBingoCard}
          setUpdatedBingoCard={setUpdatedBingoCard}
          isLoading={isLoading}
          invalidFields={invalidFields}
          setInvalidFields={setInvalidFields}
        />
        <AddCartelaModal
          isOpen={addModalVisible}
          onClose={toggleAddModal}
          userId={userId}
          onCartelaAdded={handleCartelaAdded}
        />
        <BulkUploadModal
          isOpen={bulkUploadModalVisible}
          onClose={toggleBulkUploadModal}
          userId={userId}
          onBulkUpload={handleBulkUploaded}
        />
        <ToastContainer />
      </div>
    </div>
  );
};

export default ViewCartela;
