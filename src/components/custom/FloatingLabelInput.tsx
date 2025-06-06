"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

interface FloatingLabelInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  showPasswordToggle?: boolean;
}

const FloatingLabelInput = React.forwardRef<
  HTMLInputElement,
  FloatingLabelInputProps
>(({ className, label, id, type, placeholder, value, showPasswordToggle, ...props }, ref) => {
  const internalPlaceholder = placeholder === undefined ? " " : placeholder;
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(prev => !prev);
  };

  const isToggleablePassword = type === "password";
  const inputType = isToggleablePassword ? (isPasswordVisible ? "text" : "password") : type;

  return (
    <div className={cn("relative", className)}>
      <Input
        ref={ref}
        id={id}
        type={inputType}
        placeholder={internalPlaceholder}
        className={cn(
          "peer h-10 w-full rounded border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
          "placeholder-transparent focus:placeholder-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          isToggleablePassword ? "pr-10" : ""
        )}
        value={value}
        {...props}
      />
      <Label
        htmlFor={id}
        className={cn(
          "absolute left-3 top-2 origin-[0] -translate-y-4 scale-75 transform cursor-text px-1 text-sm font-medium text-foreground duration-300 rounded-full",
          "bg-background/80 backdrop-blur-sm",
          "peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:bg-transparent peer-placeholder-shown:backdrop-blur-none",
          "peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-1 peer-focus:text-primary",
          "peer-focus:bg-background/80 peer-focus:backdrop-blur-sm"
        )}
      >
        {label}
      </Label>
      {isToggleablePassword && (
        <button
          type="button"
          tabIndex={-1}
          onClick={togglePasswordVisibility}
          className="absolute inset-y-0 right-0 z-10 flex items-center pr-3 text-gray-500 hover:text-gray-700 cursor-pointer focus:outline-none rounded-full"
          aria-label={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
        >
          {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
    </div>
  );
});

FloatingLabelInput.displayName = "FloatingLabelInput";

export { FloatingLabelInput };
