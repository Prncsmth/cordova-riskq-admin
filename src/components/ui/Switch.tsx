"use client";

import { useState } from "react";

type SwitchProps = {
  // Controlled mode (checked + onChange) is opt-in -- omitting `checked`
  // keeps existing callers' uncontrolled defaultChecked-only usage working
  // unchanged.
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
};

export default function Switch({
  checked,
  defaultChecked = false,
  onChange,
  label,
  disabled = false,
}: SwitchProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = checked !== undefined;
  const value = isControlled ? checked : internalChecked;

  function handleClick() {
    const next = !value;
    if (!isControlled) setInternalChecked(next);
    onChange?.(next);
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={label}
      disabled={disabled}
      onClick={handleClick}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 ${
        value ? "bg-primary" : "bg-border"
      }`}
    >
      <span
        className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-md transition-transform duration-200 ${
          value ? "translate-x-[22px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}
