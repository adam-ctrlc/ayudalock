import { useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import type { Edge } from "react-native-safe-area-context";
import {
  CalendarBlank,
  ClockCounterClockwise,
  IdentificationBadge,
  IdentificationCard,
  Lock,
  ShieldCheck,
  SignOut,
  UserCircle,
  Warning,
} from "phosphor-react-native";

import { ApiError } from "@/lib/api/client";
import type { UserRole } from "@/lib/api/auth";
import {
  deleteAccount,
  updatePassword,
  updateProfile,
} from "@/lib/api/auth";
import { useAuth } from "@/lib/auth/context";
import { PH_COLORS } from "@/lib/theme";
import { Screen } from "@/components/ui/screen";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { IconInput } from "@/components/ui/icon-input";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type BadgeVariant = "secondary" | "accent" | "default";

const ROLE_LABELS: Record<UserRole, { text: string; variant: BadgeVariant }> = {
  citizen: { text: "Citizen", variant: "secondary" },
  merchant: { text: "Merchant", variant: "accent" },
  lgu_admin: { text: "LGU Admin", variant: "default" },
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function dateLabel(iso: string | null | undefined) {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-start gap-3 py-2.5">
      <View className="mt-0.5">{icon}</View>
      <View className="flex-1 gap-0.5">
        <Text variant="caption">{label}</Text>
        <Text variant="label">{value}</Text>
      </View>
    </View>
  );
}

function Divider() {
  return <View className="h-px bg-border" />;
}

function SectionHeading({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: string;
}) {
  return (
    <View className="flex-row items-center gap-2">
      {icon}
      <Text variant="heading">{children}</Text>
    </View>
  );
}

export function AccountScreen({
  title,
  edges = [],
}: {
  title?: string;
  edges?: Edge[];
}) {
  const { user, signOut, updateUser } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [middleName, setMiddleName] = useState(user?.middle_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [editingPassword, setEditingPassword] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const name = user?.name ?? "-";
  const role = ROLE_LABELS[user?.role ?? "citizen"];
  const lockedClass = editingProfile ? undefined : "bg-muted";

  function cancelProfile() {
    setFirstName(user?.first_name ?? "");
    setMiddleName(user?.middle_name ?? "");
    setLastName(user?.last_name ?? "");
    setPhone(user?.phone ?? "");
    setEmail(user?.email ?? "");
    setEditingProfile(false);
  }

  async function onSaveProfile() {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      Alert.alert("First name, last name, and email are required.");
      return;
    }
    setSavingProfile(true);
    try {
      const updated = await updateProfile({
        first_name: firstName.trim(),
        middle_name: middleName.trim() || null,
        last_name: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
      });
      updateUser(updated);
      setEditingProfile(false);
      Alert.alert("Saved", "Your profile has been updated.");
    } catch (e) {
      Alert.alert(
        "Could not save",
        e instanceof ApiError ? e.message : "Please try again.",
      );
    } finally {
      setSavingProfile(false);
    }
  }

  function cancelPassword() {
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setEditingPassword(false);
  }

  async function onChangePassword() {
    if (!currentPw || !newPw) {
      Alert.alert("Enter your current and new password.");
      return;
    }
    if (newPw !== confirmPw) {
      Alert.alert("Your new passwords do not match.");
      return;
    }
    setSavingPw(true);
    try {
      await updatePassword({
        current_password: currentPw,
        password: newPw,
        password_confirmation: confirmPw,
      });
      cancelPassword();
      Alert.alert("Password updated", "Use it the next time you sign in.");
    } catch (e) {
      Alert.alert(
        "Could not update",
        e instanceof ApiError ? e.message : "Please try again.",
      );
    } finally {
      setSavingPw(false);
    }
  }

  function onDeleteAccount() {
    Alert.alert(
      "Delete account?",
      "This permanently removes your account. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount();
              await signOut();
              router.replace("/");
            } catch (e) {
              Alert.alert(
                "Could not delete",
                e instanceof ApiError ? e.message : "Please try again.",
              );
            }
          },
        },
      ],
    );
  }

  async function onSignOut() {
    await signOut();
    router.replace("/");
  }

  return (
    <Screen edges={edges}>
      {title ? <Text variant="title">{title}</Text> : null}

      <Card className="items-center gap-2 py-5">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-accent">
          <Text className="text-xl font-bold text-accent-foreground">
            {initialsOf(name)}
          </Text>
        </View>
        <View className="items-center">
          <Text variant="heading">{name}</Text>
          {user?.username ? (
            <Text variant="caption">@{user.username}</Text>
          ) : null}
        </View>
        <Badge variant={role.variant} label={role.text} className="self-center" />
      </Card>

      <SectionHeading
        icon={<UserCircle size={20} color={PH_COLORS.blue} weight="duotone" />}
      >
        Personal details
      </SectionHeading>
      <Card>
        <View className="gap-3">
          <Field label="First name">
            <Input
              value={firstName}
              onChangeText={setFirstName}
              editable={editingProfile}
              className={lockedClass}
              placeholder="First name"
            />
          </Field>
          <Field label="Middle name">
            <Input
              value={middleName}
              onChangeText={setMiddleName}
              editable={editingProfile}
              className={lockedClass}
              placeholder="Middle name (optional)"
            />
          </Field>
          <Field label="Last name">
            <Input
              value={lastName}
              onChangeText={setLastName}
              editable={editingProfile}
              className={lockedClass}
              placeholder="Last name"
            />
          </Field>
          <Field label="Mobile number">
            <Input
              value={phone}
              onChangeText={setPhone}
              editable={editingProfile}
              className={lockedClass}
              keyboardType="phone-pad"
              placeholder="09xxxxxxxxx"
            />
          </Field>
          <Field label="Email address">
            <Input
              value={email}
              onChangeText={setEmail}
              editable={editingProfile}
              className={lockedClass}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@example.com"
            />
          </Field>

          {editingProfile ? (
            <View className="flex-row gap-2">
              <Button
                variant="outline"
                className="flex-1"
                label="Cancel"
                onPress={cancelProfile}
              />
              <Button
                className="flex-1"
                label="Save"
                loading={savingProfile}
                onPress={onSaveProfile}
              />
            </View>
          ) : (
            <Button
              variant="outline"
              label="Edit details"
              onPress={() => setEditingProfile(true)}
            />
          )}
        </View>
      </Card>

      <SectionHeading
        icon={<ShieldCheck size={20} color={PH_COLORS.blue} weight="duotone" />}
      >
        Identity & account
      </SectionHeading>
      <Card>
        <InfoRow
          icon={
            <IdentificationCard
              size={20}
              color={PH_COLORS.mutedForeground}
              weight="duotone"
            />
          }
          label="Philippine Identification System (PhilSys) ID"
          value={user?.phil_sys_id ?? "Not linked"}
        />
        <Divider />
        <InfoRow
          icon={
            <IdentificationBadge
              size={20}
              color={PH_COLORS.mutedForeground}
              weight="duotone"
            />
          }
          label="Account role"
          value={role.text}
        />
        <Divider />
        <InfoRow
          icon={
            <CalendarBlank
              size={20}
              color={PH_COLORS.mutedForeground}
              weight="duotone"
            />
          }
          label="Member since"
          value={dateLabel(user?.created_at)}
        />
        <Divider />
        <InfoRow
          icon={
            <ClockCounterClockwise
              size={20}
              color={PH_COLORS.mutedForeground}
              weight="duotone"
            />
          }
          label="Last updated"
          value={dateLabel(user?.updated_at)}
        />
      </Card>

      <SectionHeading
        icon={<Lock size={20} color={PH_COLORS.blue} weight="duotone" />}
      >
        Change password
      </SectionHeading>
      <Card>
        {editingPassword ? (
          <View className="gap-3">
            <Field label="Current password">
              <IconInput
                icon={<Lock size={20} color={PH_COLORS.mutedForeground} />}
                togglePassword
                value={currentPw}
                onChangeText={setCurrentPw}
                autoCapitalize="none"
                placeholder="Your current password"
              />
            </Field>
            <Field label="New password">
              <IconInput
                icon={<Lock size={20} color={PH_COLORS.mutedForeground} />}
                togglePassword
                value={newPw}
                onChangeText={setNewPw}
                autoCapitalize="none"
                placeholder="At least 8 characters"
              />
            </Field>
            <Field label="Confirm new password">
              <IconInput
                icon={<Lock size={20} color={PH_COLORS.mutedForeground} />}
                togglePassword
                value={confirmPw}
                onChangeText={setConfirmPw}
                autoCapitalize="none"
                placeholder="Re-enter new password"
              />
            </Field>
            <View className="flex-row gap-2">
              <Button
                variant="outline"
                className="flex-1"
                label="Cancel"
                onPress={cancelPassword}
              />
              <Button
                className="flex-1"
                label="Update"
                loading={savingPw}
                onPress={onChangePassword}
              />
            </View>
          </View>
        ) : (
          <Button
            variant="outline"
            label="Change password"
            onPress={() => setEditingPassword(true)}
          />
        )}
      </Card>

      <Pressable
        onPress={onSignOut}
        className="flex-row items-center justify-center gap-2 rounded-xl border border-border py-3 active:opacity-60"
      >
        <SignOut size={18} color={PH_COLORS.mutedForeground} />
        <Text variant="label" className="text-muted-foreground">
          Sign out
        </Text>
      </Pressable>

      <SectionHeading
        icon={<Warning size={20} color={PH_COLORS.red} weight="duotone" />}
      >
        Delete account
      </SectionHeading>
      <Card className="gap-3">
        <Text variant="caption">
          Permanently delete your account and all related records. This cannot
          be undone.
        </Text>
        <Button
          variant="destructive"
          label="Delete my account"
          onPress={onDeleteAccount}
        />
      </Card>
    </Screen>
  );
}
