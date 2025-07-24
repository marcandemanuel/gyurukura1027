"use client"
import styles from "./Button.module.css"
import clsx from "clsx"

const Button = ({ children, variant = "primary", size = "medium", onClick, disabled = false, className, ...props }) => {
  return (
    <button
      className={clsx(styles.button, styles[variant], styles[size], className)}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
