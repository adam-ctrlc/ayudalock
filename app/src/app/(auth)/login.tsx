import { useState } from "react";
import { Pressable, View } from "react-native";
import { Link, useRouter } from "expo-router";
import {
  At,
  Basket,
  Bus,
  CaretRight,
  GasPump,
  Lock,
} from "phosphor-react-native";

import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/context";
import { PH_COLORS } from "@/lib/theme";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Field } from "@/components/ui/field";
import { IconInput } from "@/components/ui/icon-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextLink } from "@/components/ui/text-link";

export default function Login() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      await signIn(identifier.trim(), password);
      router.replace("/");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View className="mt-8 items-center gap-3">
        <View className="h-20 w-20 items-center justify-center rounded-3xl bg-primary">
          <Text className="text-3xl font-extrabold text-primary-foreground">
            AL
          </Text>
        </View>
        <View className="items-center gap-0.5">
          <Text variant="title">AyudaLock</Text>
          <Text variant="subtitle" className="text-center">
            The Last-Mile Relief Engine
          </Text>
        </View>
      </View>

      <View className="mt-8 gap-4">
        <View className="gap-0.5">
          <Text variant="heading">Sign in</Text>
          <Text variant="caption">Access your relief programs.</Text>
        </View>

        <Field label="Email or username" error={error}>
          <IconInput
            icon={<At size={20} color={PH_COLORS.mutedForeground} />}
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="you@example.com or username"
          />
        </Field>

        <Field label="Password">
          <IconInput
            icon={<Lock size={20} color={PH_COLORS.mutedForeground} />}
            togglePassword
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            placeholder="Your password"
          />
        </Field>

        <Button label="Sign in" onPress={onSubmit} loading={loading} />

        <View className="flex-row items-center justify-center gap-1">
          <Text variant="caption">New to AyudaLock?</Text>
          <TextLink href="/(auth)/register">Create an account</TextLink>
        </View>
      </View>

      <Link href="/(auth)/prices" asChild>
        <Pressable className="mt-3 active:opacity-80">
          <Card className="flex-row items-center gap-3">
            <View className="flex-row gap-1.5">
              <GasPump size={24} color={PH_COLORS.blue} weight="duotone" />
              <Bus size={24} color={PH_COLORS.red} weight="duotone" />
              <Basket size={24} color={PH_COLORS.success} weight="duotone" />
            </View>
            <View className="flex-1">
              <Text variant="label">View current PH prices</Text>
              <Text variant="caption">Fuel, fare, and market prices today</Text>
            </View>
            <CaretRight size={18} color={PH_COLORS.mutedForeground} />
          </Card>
        </Pressable>
      </Link>
    </Screen>
  );
}
