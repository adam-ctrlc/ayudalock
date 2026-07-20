import { useState } from "react";
import { Image, Pressable, View } from "react-native";
import { Trash } from "phosphor-react-native";

import { ApiError } from "@/lib/api/client";
import type {
  IncidentReport,
  Referral,
  ReferralStatus,
  ReportStatus,
} from "@/lib/api/incident-reports";
import {
  useAdvanceReferral,
  useDeleteIncidentReport,
  useIncidentReports,
  usePromoteIncidentReport,
  useReviewIncidentReport,
} from "@/lib/queries/incident-reports";
import { cn } from "@/lib/utils";
import { PH_COLORS } from "@/lib/theme";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDialog } from "@/components/ui/dialog";
import { hazardWhen } from "@/components/heatmap/hazard-labels";

const FILTERS: { key: ReportStatus | "all"; label: string }[] = [
  { key: "submitted", label: "New" },
  { key: "verified", label: "Verified" },
  { key: "all", label: "All" },
];

function nextStatus(status: ReferralStatus): ReferralStatus | null {
  switch (status) {
    case "suggested":
      return "referred";
    case "referred":
      return "acknowledged";
    case "acknowledged":
      return "closed";
    case "closed":
      return null;
  }
}

function nextLabel(status: ReferralStatus): string {
  switch (status) {
    case "suggested":
      return "Send to agency";
    case "referred":
      return "Mark acknowledged";
    case "acknowledged":
      return "Close";
    case "closed":
      return "Closed";
  }
}

function ReferralRow({ referral }: { referral: Referral }) {
  const advance = useAdvanceReferral();
  const dialog = useDialog();
  const next = nextStatus(referral.status);

  return (
    <View className="gap-2 border-t border-border pt-2">
      <View className="flex-row items-center gap-2">
        <Text variant="label" className="flex-1">
          {referral.agency_label}
        </Text>
        <Badge
          variant={referral.status === "closed" ? "muted" : "accent"}
          label={referral.status_label}
        />
      </View>

      {referral.team ? (
        <Text variant="caption">
          {referral.team.name}
          {referral.team.contact_number ? ` · ${referral.team.contact_number}` : ""}
        </Text>
      ) : (
        <Text variant="caption">No team on file for this agency yet.</Text>
      )}

      {next ? (
        <Button
          size="sm"
          variant="secondary"
          label={nextLabel(referral.status)}
          loading={advance.isPending}
          onPress={() =>
            advance.mutate(
              { id: referral.id, status: next },
              {
                onError: (e) =>
                  dialog.alert({
                    title: "Could not update",
                    message:
                      e instanceof ApiError ? e.message : "Please try again.",
                  }),
              },
            )
          }
        />
      ) : null}
    </View>
  );
}

function ReportRow({ report }: { report: IncidentReport }) {
  const review = useReviewIncidentReport();
  const promote = usePromoteIncidentReport();
  const remove = useDeleteIncidentReport();
  const dialog = useDialog();

  function setStatus(status: ReportStatus) {
    review.mutate(
      { id: report.id, status },
      {
        onError: (e) =>
          dialog.alert({
            title: "Could not update",
            message: e instanceof ApiError ? e.message : "Please try again.",
          }),
      },
    );
  }

  return (
    <Card className="gap-2">
      <View className="flex-row items-start gap-2">
        <View className="flex-1 gap-0.5">
          <Text variant="label">{report.title}</Text>
          <Text variant="caption">
            {report.type_label}
            {report.province ? ` · ${report.province}` : ""}
            {report.created_at ? ` · ${hazardWhen(report.created_at)}` : ""}
          </Text>
          <Text variant="caption">
            {report.reporter ?? "Unknown reporter"} · {report.location_label}
            {report.accuracy_meters != null
              ? ` (±${report.accuracy_meters}m)`
              : ""}
          </Text>
        </View>
        <Pressable
          hitSlop={8}
          onPress={async () => {
            const ok = await dialog.confirm({
              title: "Remove this report?",
              message: "The reporter will no longer see it.",
            });

            if (ok) remove.mutate(report.id);
          }}
        >
          <Trash size={18} color={PH_COLORS.red} />
        </Pressable>
      </View>

      <Text variant="caption">{report.description}</Text>

      {report.photo_thumbnail ? (
        <Image
          source={{ uri: report.photo_thumbnail }}
          className="h-32 w-full rounded-xl"
          resizeMode="cover"
        />
      ) : report.has_photo ? (
        <Badge variant="muted" label="Photo attached" />
      ) : null}

      <View className="flex-row flex-wrap gap-2">
        <Badge
          variant={report.status === "submitted" ? "accent" : "muted"}
          label={report.status_label}
        />
        {report.on_impact_map ? (
          <Badge variant="secondary" label="On impact map" />
        ) : null}
      </View>

      {report.status === "submitted" ? (
        <View className="flex-row gap-2">
          <Button
            className="flex-1"
            size="sm"
            variant="secondary"
            label="Verify"
            loading={review.isPending}
            onPress={() => setStatus("verified")}
          />
          <Button
            className="flex-1"
            size="sm"
            variant="outline"
            label="Dismiss"
            loading={review.isPending}
            onPress={() => setStatus("dismissed")}
          />
        </View>
      ) : null}

      {report.status !== "dismissed" && !report.on_impact_map ? (
        <Button
          size="sm"
          variant="outline"
          label="Publish to impact map"
          loading={promote.isPending}
          onPress={() =>
            promote.mutate(report.id, {
              onSuccess: () =>
                dialog.alert({
                  title: "Published",
                  message: "This now shades the public impact map.",
                }),
              onError: (e) =>
                dialog.alert({
                  title: "Could not publish",
                  message:
                    e instanceof ApiError ? e.message : "Please try again.",
                }),
            })
          }
        />
      ) : null}

      {(report.referrals ?? []).map((referral) => (
        <ReferralRow key={referral.id} referral={referral} />
      ))}
    </Card>
  );
}

export function ReportsAdmin() {
  const [filter, setFilter] = useState<ReportStatus | "all">("submitted");
  const reports = useIncidentReports(
    filter === "all" ? {} : { status: filter },
  );

  return (
    <>
      <Text variant="subtitle">
        Citizen reports. Verify one to publish it to the public impact map, and
        refer it to the agency that should handle it.
      </Text>

      <View className="flex-row gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              className={cn(
                "flex-1 items-center rounded-xl border py-2.5",
                active
                  ? "border-primary bg-primary"
                  : "border-border bg-background",
              )}
            >
              <Text
                className={cn(
                  "text-sm font-semibold",
                  active ? "text-primary-foreground" : "text-foreground",
                )}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {reports.isLoading ? (
        <View className="gap-3">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </View>
      ) : (reports.data ?? []).length === 0 ? (
        <Card>
          <Text variant="caption">Nothing here right now.</Text>
        </Card>
      ) : (
        <View className="gap-3">
          {(reports.data ?? []).map((report) => (
            <ReportRow key={report.id} report={report} />
          ))}
        </View>
      )}
    </>
  );
}
