"use client";

import * as React from "react";
import { Textarea } from "@/components/ui/textarea"; 
import { Label } from "@/components/ui/label"; 
import { cn } from "@/lib/utils"; 

interface FloatingLabelTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { 
  label: string;
  id: string;
}

const FloatingLabelTextarea = React.forwardRef<
  HTMLTextAreaElement, 
  FloatingLabelTextareaProps
>(({ className, label, id, placeholder, value, rows = 3, ...props }, ref) => {
  const internalPlaceholder = placeholder === undefined ? " " : placeholder;

  return (
    <div className={cn("relative w-full", className)}> 
      <Textarea
        ref={ref}
        id={id}
        placeholder={internalPlaceholder}
        className={cn(
          "peer min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background",
          "placeholder:text-muted-foreground", 
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1", 
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
        value={value}
        rows={rows} 
        {...props}
      />
      <Label
        htmlFor={id}
        className={cn(
          "absolute left-3 origin-[0] transform cursor-text px-1 text-sm font-medium text-foreground duration-300 rounded-md", 
          "bg-background/80 backdrop-blur-sm", 

          "peer-placeholder-shown:top-[0.60rem] peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:bg-transparent peer-placeholder-shown:backdrop-blur-none",
          
          "top-2 -translate-y-[0.85rem] scale-75", 
          "peer-focus:top-2 peer-focus:-translate-y-[0.85rem] peer-focus:scale-75 peer-focus:px-1 peer-focus:text-primary peer-focus:bg-background/80 peer-focus:backdrop-blur-sm"
        )}
      >
        {label}
      </Label>
    </div>
  );
});

FloatingLabelTextarea.displayName = "FloatingLabelTextarea";

export { FloatingLabelTextarea };
