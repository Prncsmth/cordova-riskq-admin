import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "Cordova RISKQ Admin",
    timestamp: new Date().toISOString(),
  });
}