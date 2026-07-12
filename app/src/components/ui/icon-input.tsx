import { useState } from "react";
import { Pressable, TextInput, View, type TextInputProps } from "react-native";
import { Eye, EyeSlash } from "phosphor-react-native";

import { cn } from "@/lib/utils";
import { PH_COLORS } from "@/lib/theme";

type IconInputProps = TextInputProps & {
  icon: React.ReactNode;
  togglePassword?: boolean;
};

export function IconInput({
  icon,
  togglePassword,
  secureTextEntry,
  className,
  ...props
}: IconInputProps) {
  const [hidden, setHidden] = useState(true);
  const isSecure = togglePassword ? hidden : secureTextEntry;

  return (
    <View className="h-12 flex-row items-center rounded-xl border border-input bg-background px-3">
      {icon}
      <TextInput
        className={cn("ml-2 flex-1 text-base text-foreground", className)}
        placeholderTextColor={PH_COLORS.mutedForeground}
        secureTextEntry={isSecure}
        {...props}
      />
      {togglePassword ? (
        <Pressable onPress={() => setHidden((v) => !v)} hitSlop={8} className="pl-2">
          {hidden ? (
            <EyeSlash size={20} color={PH_COLORS.mutedForeground} />
          ) : (
            <Eye size={20} color={PH_COLORS.mutedForeground} />
          )}
        </Pressable>
      ) : null}
    </View>
  );
}
