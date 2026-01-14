import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import SideMenu from "../components/common/SideMenu";
import useUserStore from "../stores/userStore";
import api from "../utils/api";

const AddCartela = () => {
  const initialCartelaData = {
    cardId: "",
    b1: "",
    b2: "",
    b3: "",
    b4: "",
    b5: "",
    i1: "",
    i2: "",
    i3: "",
    i4: "",
    i5: "",
    n1: "",
    n2: "",
    n3: "0",
    n4: "",
    n5: "",
    g1: "",
    g2: "",
    g3: "",
    g4: "",
    g5: "",
    o1: "",
    o2: "",
    o3: "",
    o4: "",
    o5: "",
  };
  const [cartelaData, setCartelaData] = useState(initialCartelaData);
  const { user, userId, setUser } = useUserStore();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api
        .get(`/api/me`)
        .then((response) => response.json())
        .then((userData) => {
          setUser({ id: userData.id, username: userData.username });
        })
        .catch((error) => {});
    }
  }, [setUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCartelaData({ ...cartelaData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const response = await api.post(`/api/bingo-card/create`, {
        ...cartelaData,
        userId,
      });
      if (!response.ok) throw new Error("Failed to create cartela");
      await response.json();
      toast.success("Bingo card created successfully!");
      setCartelaData(initialCartelaData);
    } catch (error) {
      toast.error("Error creating bingo card.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900">
      <SideMenu />
      {user && (
        <div className="flex-1 p-4 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-white">Add Cartela</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="number"
              name="cardId"
              value={cartelaData.cardId}
              onChange={handleChange}
              placeholder="Card ID"
              className="w-full p-2 border rounded bg-gray-800 text-white"
              required
            />
            <div className="grid grid-cols-5 gap-4">
              {["B", "I", "N", "G", "O"].map((letter) => (
                <div key={letter} className="flex flex-col">
                  <p className="text-xl font-bold mb-2 text-center text-white">
                    {letter}
                  </p>
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
                        placeholder={field}
                        className="p-2 border rounded bg-gray-800 text-white"
                        required={field !== "n3"}
                        readOnly={field === "n3"}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            <button
              type="submit"
              className="bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600"
            >
              Create Cartela
            </button>
          </form>
          <ToastContainer />
        </div>
      )}
    </div>
  );
};

export default AddCartela;
