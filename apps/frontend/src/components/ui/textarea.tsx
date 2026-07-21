import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const textareaVariants = cva(
  "flex w-full rounded-md text-base transition-all disabled:cursor-not-allowed disabled:opacity-50 md:text-sm outline-none",
  {
    variants: {
      variant: {
        default:
          "min-h-[80px] border border-input bg-background px-3 py-2 placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        brand:
          "min-h-[120px] bg-slate-50 border-transparent focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-brand-primary/30 p-4 resize-none text-slate-900 font-normal",
      },
    },
    defaultVariants: {
      variant: "brand",
    },
  }
)

export interface TextareaProps
  extends React.ComponentProps<"textarea">,
    VariantProps<typeof textareaVariants> {}

function Textarea({ className, variant, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(textareaVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Textarea, textareaVariants }

