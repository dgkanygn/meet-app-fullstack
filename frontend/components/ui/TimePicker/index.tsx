"use client";

import { InputHTMLAttributes, forwardRef, useId } from "react";

interface TimePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  hint?: string;
}

const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <input
          type="time"
          ref={ref}
          id={inputId}
          className={[
            "w-full px-3 py-2 text-sm rounded-[6px]",
            "bg-surface text-foreground placeholder:text-muted",
            "border transition-colors duration-150 outline-none cursor-pointer",
            error
              ? "border-error focus:border-error"
              : "border-border focus:border-foreground",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />
        {error && <p className="text-xs text-error">{error}</p>}
        {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      </div>
    );
  }
);

TimePicker.displayName = "TimePicker";
export default TimePicker;
