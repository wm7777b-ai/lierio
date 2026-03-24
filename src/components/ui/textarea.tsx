import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-xl border border-slate-200/55 bg-slate-50/45 px-3 py-2.5 text-base text-slate-800 shadow-none transition-colors outline-none placeholder:text-slate-400 focus-visible:border-slate-300/80 focus-visible:ring-2 focus-visible:ring-slate-200/60 disabled:cursor-not-allowed disabled:bg-slate-100/60 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/15 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
