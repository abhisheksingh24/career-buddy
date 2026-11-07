import { cn } from "@/lib/utils";
import * as React from "react";


// One keyboard focus style for every text field: the --ring token, solid 3px
// (docs/ux/design-system.md, "Focus ring"). No second outline.
export const focusRing =
  "outline-none focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-[3px]";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return <input type={type} data-slot="input" className={cn(focusRing, className)} {...props} />;
}

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea data-slot="textarea" className={cn(focusRing, className)} {...props} />;
}

export { Input, Textarea };
