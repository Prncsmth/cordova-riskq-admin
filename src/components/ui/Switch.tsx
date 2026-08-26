"use client";

import { useState } from "react";

type SwitchProps = {
  defaultChecked?: boolean;
  label?: string;
  disabled?: boolean;
};

export default function Switch({ defaultChecked = false, label, disabled = false }: SwitchProps) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => setChecked((c) => !c)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-linear-to-b from-primary to-primary-dark shadow-inner" : "bg-border"
      }`}
    >
      <span
        className={`inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-md transition-transform duration-200 ${
          checked ? "translate-x-[22px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}
