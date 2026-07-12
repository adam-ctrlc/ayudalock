import { useEffect, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { Minus, Plus } from "phosphor-react-native";

import { cn } from "@/lib/utils";
import { PH_COLORS } from "@/lib/theme";

function StepButton({
  onPress,
  disabled,
  children,
}: {
  onPress: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      className={cn(
        "h-8 w-8 items-center justify-center rounded-full border border-primary active:opacity-70",
        disabled && "border-border opacity-40",
      )}
    >
      {children}
    </Pressable>
  );
}

export function Stepper({
  value,
  onChange,
  min = 1,
  max,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  function commit(raw: string) {
    const digits = raw.replace(/[^0-9]/g, "");
    if (digits === "") {
      // allow the field to be briefly empty while typing
      setText("");
      return;
    }
    const n = parseInt(digits, 10);
    const clamped = Math.max(min, max !== undefined ? Math.min(max, n) : n);
    setText(String(clamped));
    onChange(clamped);
  }

  function onBlur() {
    if (text === "") {
      setText(String(value));
    }
  }

  const atMin = value <= min;
  const atMax = max !== undefined && value >= max;

  return (
    <View className="flex-row items-center gap-2">
      <StepButton
        onPress={() => onChange(Math.max(min, value - 1))}
        disabled={atMin}
      >
        <Minus
          size={14}
          weight="bold"
          color={atMin ? PH_COLORS.mutedForeground : PH_COLORS.blue}
        />
      </StepButton>
      <TextInput
        value={text}
        onChangeText={commit}
        onBlur={onBlur}
        keyboardType="number-pad"
        selectTextOnFocus
        className="min-w-[42px] rounded-lg border border-input bg-background px-1 py-1 text-center text-base font-bold text-foreground"
      />
      <StepButton
        onPress={() =>
          onChange(max !== undefined ? Math.min(max, value + 1) : value + 1)
        }
        disabled={atMax}
      >
        <Plus
          size={14}
          weight="bold"
          color={atMax ? PH_COLORS.mutedForeground : PH_COLORS.blue}
        />
      </StepButton>
    </View>
  );
}
