import { NextResponse } from "next/server";
import { z } from "zod";

import { connectMongoDB } from "../../../../../lib/mongodb";
import Room from "../../../../../models/Room";
import Vote from "../../../../../models/Vote";

const requestSchema = z.object({
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
          message: "요청 정보가 올바르지 않습니다.",
        },
        { status: 400 }
      );
    }

    const { voterToken } = parsed.data;

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

    if (room.status === "finished") {
      return NextResponse.json({
        message: "이미 최종 결정이 완료되었습니다.",
        finalFoodId: room.finalFoodId,
        status: room.status,
      });
    }

    const hostVote = await Vote.findOne({
      roomId: room._id,
      voterToken,
      participantType: "host",
    });

    if (!hostVote) {
      return NextResponse.json(
        {
          message: "호스트만 최종 결정을 확정할 수 있습니다.",
        },
        { status: 403 }
      );
    }

    const votes = await Vote.find({
      roomId: room._id,
    }).lean();

    const firstFoodId = room.candidateFoodIds[0];
    const secondFoodId = room.candidateFoodIds[1];

    const firstCount = votes.filter(
      (vote) => vote.foodId === firstFoodId
    ).length;

    const secondCount = votes.filter(
      (vote) => vote.foodId === secondFoodId
    ).length;

    if (firstCount === secondCount) {
      return NextResponse.json(
        {
          message: "현재 동점이므로 타이브레이크가 필요합니다.",
        },
        { status: 400 }
      );
    }

    const winnerFoodId =
      firstCount > secondCount
        ? firstFoodId
        : secondFoodId;

    room.finalFoodId = winnerFoodId;
    room.status = "finished";

    await room.save();

    return NextResponse.json({
      message: "최종 메뉴가 결정되었습니다.",
      finalFoodId: room.finalFoodId,
      status: room.status,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "최종 메뉴를 결정하는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}