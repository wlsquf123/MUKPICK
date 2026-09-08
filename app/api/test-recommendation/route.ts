import { NextResponse } from "next/server";
import { getRecommendations } from "../../../lib/recommendation";

export async function GET() {
  const selectedTags = [
    "spicy",
    "hot",
    "broth",
    "filling",
    "adventurous",
  ] as const;

  const recommendations = getRecommendations([...selectedTags]);

  return NextResponse.json({
    selectedTags,
    recommendations,
  });
}