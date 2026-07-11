import { Text as RNText, type TextProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const textVariants = cva("text-foreground", {
  variants: {
    variant: {
      default: "text-base",
      title: "text-2xl font-bold",
      heading: "text-xl font-semibold",
      subtitle: "text-base text-muted-foreground",
      caption: "text-sm text-muted-foreground",
      label: "text-sm font-medium",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type TextVariantProps = VariantProps<typeof textVariants>;

export function Text({
  className,
  variant,
  ...props
}: TextProps & TextVariantProps) {
  return (
    <RNText className={cn(textVariants({ variant }), className)} {...props} />
  );
}
