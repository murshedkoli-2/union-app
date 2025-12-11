"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AlertDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    children: React.ReactNode
}

const AlertDialogContext = React.createContext<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
}>({
    open: false,
    onOpenChange: () => { },
});

export const AlertDialog: React.FC<AlertDialogProps> = ({ open, onOpenChange, children }) => {
    return (
        <AlertDialogContext.Provider value={{ open, onOpenChange }}>
            {children}
        </AlertDialogContext.Provider>
    )
}

export const AlertDialogTrigger: React.FC<{ children: React.ReactNode, asChild?: boolean }> = ({ children, asChild }) => {
    const { onOpenChange } = React.useContext(AlertDialogContext);
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

export const AlertDialogContent: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => {
    const { open, onOpenChange } = React.useContext(AlertDialogContext);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
                onClick={() => onOpenChange(false)}
            />
            {/* Content */}
            <div className={cn(
                "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg md:w-full",
                className
            )}>
                {children}
            </div>
        </div>
    )
}

export const AlertDialogHeader: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => {
    return (
        <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}>
            {children}
        </div>
    )
}

export const AlertDialogFooter: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => {
    return (
        <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}>
            {children}
        </div>
    )
}

export const AlertDialogTitle: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => {
    return (
        <h2 className={cn("text-lg font-semibold", className)}>
            {children}
        </h2>
    )
}

export const AlertDialogDescription: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => {
    return (
        <p className={cn("text-sm text-muted-foreground", className)}>
            {children}
        </p>
    )
}

export const AlertDialogAction: React.FC<{ onClick?: () => void, children: React.ReactNode, className?: string }> = ({ onClick, children, className }) => {
    const { onOpenChange } = React.useContext(AlertDialogContext);
    return (
        <button
            onClick={(e) => {
                onClick?.();
                onOpenChange(false);
            }}
            className={cn("inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", className)}
        >
            {children}
        </button>
    )
}

export const AlertDialogCancel: React.FC<{ onClick?: () => void, children: React.ReactNode, className?: string }> = ({ onClick, children, className }) => {
    const { onOpenChange } = React.useContext(AlertDialogContext);
    return (
        <button
            onClick={(e) => {
                onClick?.();
                onOpenChange(false);
            }}
            className={cn("mt-2 inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:mt-0", className)}
        >
            {children}
        </button>
    )
}
