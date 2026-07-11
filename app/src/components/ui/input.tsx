import { TextInput, type TextInputProps } from "react-native";

import { cn } from "@/lib/utils";
import { PH_COLORS } from "@/lib/theme";

export function Input({ className, ...props }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={PH_COLORS.mutedForeground}
      className={cn(
        "h-12 rounded-xl border border-input bg-background px-4 text-base text-foreground",
        className,
      )}
      {...props}
    />
  );
}
