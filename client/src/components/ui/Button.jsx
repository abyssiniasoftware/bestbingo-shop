import React from "react";
import classNames from "classnames";

const Button = ({ children, className, ...props }) => (
  <button
    className={classNames(
      "px-4 py-2 rounded font-semibold focus:outline-none",
      className
    )}
    {...props}
  >
    {children}
  </button>
);

export default Button;