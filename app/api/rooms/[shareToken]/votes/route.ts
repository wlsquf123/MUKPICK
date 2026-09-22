import { NextResponse } from "next/server";
import { z } from "zod";

import { connectMongoDB } from "../../../../../lib/mongodb";
import Room from "../../../../../models/Room";
import Vote from "../../../../../models/Vote";

const requestSchema = z.object({
  foodId: z.string().min(1),
  voterToken: z.string().min(1),
});

/*
  현재 브라우저가 이 방에 이미 투표했는지 확인
  GET /api/rooms/[shareToken]/votes?voterToken=...
*/
export async function GET(
  request: Request,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  try {
    const { shareToken } = await params;

    const { searchParams } = new URL(request.url);
    const voterToken = searchParams.get("voterToken");

    if (!voterToken) {
      return NextResponse.json(
        {
          message: "voterToken이 필요합니다.",
        },
        { status: 400 }
      );
    }

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

    const existingVote = await Vote.findOne({
      roomId: room._id,
      voterToken,
    }).lean();

    if (!existingVote) {
      return NextResponse.json({
        hasVoted: false,
        foodId: null,
      });
    }

    return NextResponse.json({
      hasVoted: true,
      foodId: existingVote.foodId,
      participantType: existingVote.participantType,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "투표 상태를 확인하는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

/*
  새로운 친구 투표 저장
*/
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
        foodId: vote.foodId,
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