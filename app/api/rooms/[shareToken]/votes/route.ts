import { NextResponse } from "next/server";
import { z } from "zod";

import { connectMongoDB } from "../../../../../lib/mongodb";
import Room from "../../../../../models/Room";
import Vote from "../../../../../models/Vote";

const requestSchema = z.object({
  foodId: z.string().min(1),
  voterToken: z.string().min(1),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  try {
    const { shareToken } = await params;
    const body = await request.json();

    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "투표 정보가 올바르지 않습니다.",
        },
        { status: 400 }
      );
    }

    const { foodId, voterToken } = parsed.data;

    await connectMongoDB();

    const room = await Room.findOne({
      shareToken,
    });

    if (!room) {
      return NextResponse.json(
        {
          message: "존재하지 않는 방입니다.",
        },
        { status: 404 }
      );
    }

    if (room.status !== "voting") {
      return NextResponse.json(
        {
          message: "현재 투표할 수 없는 방입니다.",
        },
        { status: 400 }
      );
    }

    if (!room.candidateFoodIds.includes(foodId)) {
      return NextResponse.json(
        {
          message: "후보에 없는 음식입니다.",
        },
        { status: 400 }
      );
    }

    const vote = await Vote.create({
      roomId: room._id,
      foodId,
      voterToken,
      participantType: "guest",
    });

    return NextResponse.json(
      {
        message: "투표가 완료되었습니다.",
        voteId: vote._id,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error(error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        {
          message: "이미 이 방에 투표했습니다.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        message: "투표 처리 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}