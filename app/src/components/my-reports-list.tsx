import { View } from "react-native";

import type { IncidentReport, ReportStatus } from "@/lib/api/incident-reports";
import { useIncidentReports } from "@/lib/queries/incident-reports";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { hazardWhen } from "@/components/heatmap/hazard-labels";

function statusVariant(status: ReportStatus) {
  switch (status) {
    case "verified":
      return "success" as const;
    case "dismissed":
      return "muted" as const;
    case "resolved":
      return "secondary" as const;
    default:
      return "accent" as const;
  }
}

export function ReportCard({ report }: { report: IncidentReport }) {
  const referral = report.referrals?.[0];

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
        </View>
        <Badge variant={statusVariant(report.status)} label={report.status_label} />
      </View>

      <Text variant="caption">{report.description}</Text>

      {referral ? (
        <View className="gap-0.5 border-t border-border pt-2">
          <Text variant="caption" className="font-semibold text-foreground">
            {referral.citizen_label}
          </Text>
          <Text variant="caption">{referral.agency_label}</Text>
          {referral.team?.contact_number ? (
            <Text variant="caption">{referral.team.contact_number}</Text>
          ) : null}
        </View>
      ) : null}

      {report.on_impact_map ? (
        <Badge variant="secondary" label="Shown on the public impact map" />
      ) : null}
    </Card>
  );
}

export function MyReportsList() {
  const reports = useIncidentReports();

  if (reports.isLoading) {
    return (
      <View className="gap-3">
        {[0, 1].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl" />
        ))}
      </View>
    );
  }

  const items = reports.data ?? [];

  if (items.length === 0) {
    return (
      <Card>
        <Text variant="caption">
          You have not reported anything yet. Anything you send shows up here
          with its review and referral status.
        </Text>
      </Card>
    );
  }

  return (
    <View className="gap-3">
      {items.map((report) => (
        <ReportCard key={report.id} report={report} />
      ))}
    </View>
  );
}
