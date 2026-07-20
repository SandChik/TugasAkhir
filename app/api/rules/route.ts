import { NextResponse } from "next/server";
import { educationRules } from "../../../lib/bkdRules";

export async function GET() {
  return NextResponse.json({ data: educationRules });
}
