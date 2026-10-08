// Display label for an incident's backend `source` ("sos" | "report").
// Shared by Emergency Details and a responder's Past Incidents so the two
// can never label the same incident differently.
export function incidentSourceLabel(source: string | undefined): "SOS" | "Citizen Report" {
  return source === "sos" ? "SOS" : "Citizen Report";
}
