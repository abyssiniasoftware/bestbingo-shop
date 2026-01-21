import React from "react";
import { SyncLoader } from "react-spinners";

const Spinner = ({ color = "#00FD3B", size = 15 }) => (
  <SyncLoader color={color} size={size} />
);

export default Spinner;
