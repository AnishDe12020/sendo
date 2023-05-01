import * as React from "react";
import { VariantProps, cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center border rounded-xl px-2.5 text-xs py-0.5 font-semibold transition-colors h-fit",
  {
    variants: {
      variant: {
        default: "bg-primary border-transparent text-primary-foreground",
        secondary: "bg-secondary border-transparent text-secondary-foreground",
        destructive:
          "bg-destructive border-transparent text-destructive-foreground",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
