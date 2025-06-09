"use client";

import { InputMask } from "@react-input/mask";
import { Eye, EyeClosed } from "lucide-react";
import {
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
  useState,
} from "react";

import { cn } from "@/lib/utils";

interface InputIconProps extends InputHTMLAttributes<HTMLInputElement> {
  iconLeft: ReactNode;
  showToggle?: boolean;
  mask?: string;
}

const InputIcon = forwardRef<HTMLInputElement, InputIconProps>(
  (
    {
      type = "text",
      placeholder = "",
      iconLeft,
      showToggle = false,
      className,
      mask,
      ...rest
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = showToggle ? (showPassword ? "text" : "password") : type;
    const paddingRight = showToggle ? "pr-10" : "";

    const commonClasses = cn(
      "pl-10 py-2 text-gray-500 rounded-full bg-white w-full border-none outline-none placeholder:text-gray-400 text-xl",
      paddingRight,
      className
    );

    return (
      <div className="relative flex items-center">
        <span className="absolute left-3 text-gray-600">{iconLeft}</span>

        {mask ? (
          <InputMask
            ref={ref}
            type={inputType}
            placeholder={placeholder}
            className={commonClasses}
            mask={mask}
            replacement={{ _: /\d/ }}
            showMask
            {...rest}
          />
        ) : (
          <input
            ref={ref}
            type={inputType}
            placeholder={placeholder}
            className={commonClasses}
            {...rest}
          />
        )}

        {showToggle && (
          <span
            role="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 text-gray-600 cursor-pointer"
          >
            {showPassword ? <EyeClosed /> : <Eye />}
          </span>
        )}
      </div>
    );
  }
);

InputIcon.displayName = "InputIcon";

export default InputIcon;
