import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";

import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/context";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { TextLink } from "@/components/ui/text-link";

export default function Login() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View className="mt-10 items-center gap-2">
        <View className="h-16 w-16 items-center justify-center rounded-2xl bg-primary">
          <Text className="text-2xl font-bold text-primary-foreground">AL</Text>
        </View>
        <Text variant="title">AyudaLock</Text>
        <Text variant="subtitle" className="text-center">
          The Last-Mile Relief Engine
        </Text>
      </View>

      <View className="mt-4 gap-3">
        <Field label="Email">
          <Input
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Password" error={error}>
          <Input
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Your password"
          />
        </Field>
        <Button label="Sign in" onPress={onSubmit} loading={loading} />
      </View>

      <View className="mt-2 items-center gap-3">
        <TextLink href="/(auth)/register">Create an account</TextLink>
        <TextLink href="/(auth)/prices" className="text-muted-foreground">
          View current PH prices
        </TextLink>
      </View>
    </Screen>
  );
}
