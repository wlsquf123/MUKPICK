import { NextResponse } from "next/server";
import { z } from "zod";
import { getRecommendations } from "../../../lib/recommendation";

const preferenceTagSchema = z.enum([
  "spicy",
  "mild",
  "hot",
  "cold",
  "broth",
  "no-broth",
  "filling",
  "light",
  "familiar",
  "adventurous",
]);

const requestSchema = z.object({
  selectedTags: z.array(preferenceTagSchema).min(1),
  excludeFoodIds: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = requestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          message: "취향 정보가 올바르지 않습니다.",
        },
        { status: 400 }
      );
    }

    const { selectedTags, excludeFoodIds = [] } = result.data;

    const recommendations = getRecommendations(
      selectedTags,
      excludeFoodIds
    );

    return NextResponse.json({
      selectedTags,
      recommendations,
    });
  } catch {
    return NextResponse.json(
      {
        message: "추천 결과를 만드는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}