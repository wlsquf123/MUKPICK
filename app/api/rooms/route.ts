import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";

import { connectMongoDB } from "../../../lib/mongodb";
import Room from "../../../models/Room";
import Vote from "../../../models/Vote";

const requestSchema = z.object({
  candidateFoodIds: z.array(z.string()).length(2),
  preferenceAnswers: z.array(z.string()),
  hostFoodId: z.string(),
  voterToken: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "요청 데이터가 올바르지 않습니다.",
        },
        { status: 400 }
      );
    }

    const {
      candidateFoodIds,
      preferenceAnswers,
      hostFoodId,
      voterToken,
    } = parsed.data;

    if (!candidateFoodIds.includes(hostFoodId)) {
      return NextResponse.json(
        {
          message: "호스트 선택 음식이 후보에 포함되어 있지 않습니다.",
        },
        { status: 400 }
      );
    }

    await connectMongoDB();

    const shareToken = randomUUID();

    const room = await Room.create({
      candidateFoodIds,
      preferenceAnswers,
      shareToken,
      status: "voting",
    });

    await Vote.create({
      roomId: room._id,
      foodId: hostFoodId,
      voterToken,
      participantType: "host",
    });

    return NextResponse.json(
      {
        shareToken: room.shareToken,
        roomId: room._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "방을 만드는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}