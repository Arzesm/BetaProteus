import * as React from "react"
import { cn } from "@/lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string
  alt?: string
  size?: "sm" | "md" | "lg"
}

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, src, alt, size = "md", children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full",
          {
            "h-8 w-8": size === "sm",
            "h-10 w-10": size === "md",
            "h-12 w-12": size === "lg",
          },
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="aspect-square h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">
            {children}
          </span>
        )}
      </span>
    )
  }
)

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, ...props }, ref) => (
  <img
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))

const AvatarFallback = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))

Avatar.displayName = "Avatar"
AvatarImage.displayName = "AvatarImage"
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }