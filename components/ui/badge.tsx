import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "success" | "warning" | "danger" | "secondary" | "outline"
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant = "default", ...props }, ref) => {
        const variants = {
            default: "bg-primary/10 text-primary border-primary/20",
            success: "bg-[var(--success-soft)] text-[var(--success)] border-[var(--success)]/20",
            warning: "bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning)]/20",
            danger: "bg-[var(--danger-soft)] text-[var(--danger)] border-[var(--danger)]/20",
            secondary: "bg-secondary text-secondary-foreground border-border",
            outline: "text-foreground border-border bg-card"
        }

        return (
            <div
                ref={ref}
                className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                    variants[variant],
                    className
                )}
                {...props}
            />
        )
    }
)
Badge.displayName = "Badge"

export { Badge }
