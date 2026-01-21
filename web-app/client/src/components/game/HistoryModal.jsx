// import React from 'react';
// import History from './History';

// const HistoryModal = ({ userId, closeModal }) => (
//   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
//     <div className="bg-white p-4 rounded shadow-lg">
//       <button
//         onClick={closeModal}
//         className="bg-red-500 text-white px-4 py-2 rounded mb-4"
//       >
//         Close
//       </button>
//       <History userId={userId} />
//     </div>
//   </div>
// );

// export default HistoryModal;
import React from "react";
import History from "./History";

const HistoryModal = ({ userId, closeModal }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-4 rounded shadow-lg">
      <button
        onClick={closeModal}
        className="bg-red-500 text-white px-4 py-2 rounded mb-4"
      >
        Close
      </button>
      <History userId={userId} />
    </div>
  </div>
);

export default HistoryModal;
