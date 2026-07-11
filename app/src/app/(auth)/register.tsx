import { useState } from "react";
import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";

import { ApiError } from "@/lib/api/client";
import type { RegisterPayload, UserRole } from "@/lib/api/auth";
import { useLocations } from "@/lib/queries/locations";
import { useAuth } from "@/lib/auth/context";
import { cn } from "@/lib/utils";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TextLink } from "@/components/ui/text-link";

const ROLES: { key: UserRole; label: string }[] = [
  { key: "citizen", label: "Citizen" },
  { key: "merchant", label: "Merchant" },
  { key: "lgu_admin", label: "LGU" },
];

export default function Register() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [phone, setPhone] = useState("");
  const [philSysId, setPhilSysId] = useState("");
  const [role, setRole] = useState<UserRole>("citizen");
  const [locationId, setLocationId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  const locations = useLocations({}, role === "merchant");

  function fieldError(key: string) {
    return fieldErrors[key]?.[0];
  }

  async function onSubmit() {
    setError(null);
    setFieldErrors({});
    setLoading(true);
    try {
      const payload: RegisterPayload = {
        name,
        email: email.trim(),
        password,
        password_confirmation: confirm,
        role,
        phone: phone || undefined,
      };
      if (role === "citizen") payload.phil_sys_id = philSysId || undefined;
      if (role === "merchant") payload.location_id = locationId ?? undefined;

      await signUp(payload);
      router.replace("/");
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.message);
        if (e.errors) setFieldErrors(e.errors);
      } else {
        setError("Unable to create your account.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View className="mt-6 gap-1">
        <Text variant="title">Create account</Text>
        <Text variant="subtitle">Join AyudaLock to access relief programs.</Text>
      </View>

      <View className="gap-1">
        <Text variant="label">I am a</Text>
        <View className="flex-row gap-2">
          {ROLES.map((r) => {
            const active = role === r.key;
            return (
              <Pressable
                key={r.key}
                onPress={() => setRole(r.key)}
                className={cn(
                  "flex-1 items-center rounded-xl border py-3",
                  active
                    ? "border-primary bg-primary"
                    : "border-border bg-background",
                )}
              >
                <Text
                  className={cn(
                    "font-semibold",
                    active ? "text-primary-foreground" : "text-foreground",
                  )}
                >
                  {r.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="gap-3">
        <Field label="Full name" error={fieldError("name")}>
          <Input value={name} onChangeText={setName} placeholder="Juan Dela Cruz" />
        </Field>
        <Field label="Email" error={fieldError("email")}>
          <Input
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Phone" error={fieldError("phone")}>
          <Input
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="09xxxxxxxxx"
          />
        </Field>

        {role === "citizen" ? (
          <Field label="PhilSys ID" error={fieldError("phil_sys_id")}>
            <Input
              value={philSysId}
              onChangeText={setPhilSysId}
              autoCapitalize="characters"
              placeholder="PSN-0000-0000-0000"
            />
          </Field>
        ) : null}

        {role === "merchant" ? (
          <View className="gap-2">
            <Text variant="label">Assigned location</Text>
            {locations.isLoading ? (
              <View className="gap-2">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </View>
            ) : (
              locations.data?.map((loc) => {
                const active = locationId === loc.id;
                return (
                  <Pressable key={loc.id} onPress={() => setLocationId(loc.id)}>
                    <Card
                      className={cn(
                        "p-3",
                        active && "border-primary bg-secondary",
                      )}
                    >
                      <Text variant="label">{loc.name}</Text>
                      <Text variant="caption">
                        {loc.type === "kadiwa_store" ? "Kadiwa store" : "Gas station"}
                      </Text>
                    </Card>
                  </Pressable>
                );
              })
            )}
            {fieldError("location_id") ? (
              <Text variant="caption" className="text-destructive">
                {fieldError("location_id")}
              </Text>
            ) : null}
          </View>
        ) : null}

        <Field label="Password" error={fieldError("password")}>
          <Input
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="At least 8 characters"
          />
        </Field>
        <Field label="Confirm password">
          <Input
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            placeholder="Re-enter your password"
          />
        </Field>

        {error ? <Text className="text-destructive">{error}</Text> : null}
        <Button label="Create account" onPress={onSubmit} loading={loading} />
      </View>

      <View className="items-center py-2">
        <TextLink href="/(auth)/login">I already have an account</TextLink>
      </View>
    </Screen>
  );
}
