import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
    ({ className, onCheckedChange, ...props }, ref) => (
        <label className={cn("inline-flex items-center cursor-pointer", className)}>
            <input
                type="checkbox"
                className="sr-only peer"
                ref={ref}
                onChange={(e) => {
                    if (onCheckedChange) {
                        onCheckedChange(e.target.checked);
                    }
                }}
                {...props}
            />
            <div className="relative w-11 h-6 bg-input rounded-full peer peer-focus:ring-2 peer-focus:ring-ring dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
        </label>
    )
)
Switch.displayName = "Switch"

export { Switch }
