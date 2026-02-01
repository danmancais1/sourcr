import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-deep-teal-700 bg-deep-teal-900 px-3 py-2 text-body text-deep-teal-50 ring-offset-deep-teal-950 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-deep-teal-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-teal-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
