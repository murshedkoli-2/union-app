"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
// import { X } from "lucide-react" 
// Not using lucide-react X icon directly to avoid circular deps or complexity if not needed, 
// but typically DialogClose uses it. I'll rely on simple content for now or add it if needed.
import { X } from "lucide-react"

// Simple Dialog implementation since we don't have Radix UI
// This is a naive implementation for the sake of the task requirement

interface DialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    children: React.ReactNode
}

const DialogContext = React.createContext<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
}>({
    open: false,
    onOpenChange: () => { },
});

export const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
    return (
        <DialogContext.Provider value={{ open, onOpenChange }}>
            {children}
        </DialogContext.Provider>
    )
}

export const DialogTrigger: React.FC<{ children: React.ReactNode, asChild?: boolean }> = ({ children, asChild }) => {
    const { onOpenChange } = React.useContext(DialogContext);
    // Clone element if asChild, otherwise wrap in div or button
    // For simplicity, if asChild is true, we clone the child and add onClick
    if (asChild && React.isValidElement(children)) {
        const child = children as React.ReactElement<any>;
        return React.cloneElement(child, {
            onClick: (e: React.MouseEvent) => {
                child.props.onClick?.(e);
                onOpenChange(true);
            }
        });
    }
    return (
        <button onClick={() => onOpenChange(true)}>{children}</button>
    )
}

export const DialogContent: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => {
    const { open, onOpenChange } = React.useContext(DialogContext);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => onOpenChange(false)}
            />
            {/* Content */}
            <div className={cn(
                "relative z-50 w-full max-w-lg bg-background p-6 shadow-lg sm:rounded-lg border border-border animate-in fade-in zoom-in-95 duration-200",
                className
            )}>
                {children}
                <button
                    onClick={() => onOpenChange(false)}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                >
                    <X size={18} />
                    <span className="sr-only">Close</span>
                </button>
            </div>
        </div>
    )
}

export const DialogHeader: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => {
    return (
        <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}>
            {children}
        </div>
    )
}

export const DialogTitle: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => {
    return (
        <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>
            {children}
        </h2>
    )
}
