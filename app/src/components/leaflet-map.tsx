import { View } from "react-native";
import { WebView } from "react-native-webview";

export type MapMarker = {
  lat: number;
  lng: number;
  title?: string;
  color?: string;
};

function buildHtml(markers: MapMarker[]) {
  const data = JSON.stringify(markers);
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>html,body,#map{height:100%;margin:0;padding:0;} #map{background:#eef2f7;}</style>
</head>
<body>
<div id="map"></div>
<script>
  var markers = ${data};
  var map = L.map('map', { zoomControl: false, attributionControl: false });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
  var points = [];
  markers.forEach(function (m) {
    var color = m.color || '#0038a8';
    var marker = L.circleMarker([m.lat, m.lng], {
      radius: 9, color: color, fillColor: color, fillOpacity: 0.85, weight: 2
    });
    if (m.title) { marker.bindPopup(m.title); }
    marker.addTo(map);
    points.push([m.lat, m.lng]);
  });
  if (points.length === 1) { map.setView(points[0], 14); }
  else if (points.length > 1) { map.fitBounds(points, { padding: [30, 30] }); }
  else { map.setView([14.5995, 120.9842], 11); }
</script>
</body>
</html>`;
}

export function LeafletMap({
  markers,
  height = 240,
}: {
  markers: MapMarker[];
  height?: number;
}) {
  const valid = markers.filter(
    (m) => Number.isFinite(m.lat) && Number.isFinite(m.lng),
  );

  return (
    <View
      style={{ height }}
      className="overflow-hidden rounded-2xl border border-border"
    >
      <WebView
        originWhitelist={["*"]}
        source={{ html: buildHtml(valid) }}
        style={{ flex: 1, backgroundColor: "transparent" }}
        scrollEnabled={false}
      />
    </View>
  );
}
