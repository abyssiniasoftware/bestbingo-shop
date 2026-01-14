import React from "react";
import classNames from "classnames";

const Input = ({ className, ...props }) => (
  <input
    className={classNames(
      "px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500",
      className,
    )}
    {...props}
  />
);

export default Input;
