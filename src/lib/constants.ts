export const APP_NAME = "Cordova RISKQ";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000/api";

export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  "http://localhost:5000";

export const EMERGENCY_STATUSES = [
  "Active",
  "Responding",
  "Resolved",
  "Cancelled",
];

export const RESPONDER_STATUSES = [
  "Available",
  "On Duty",
  "Offline",
];