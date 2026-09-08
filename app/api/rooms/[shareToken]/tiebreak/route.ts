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
          message: "타이브레이크 정보가 올바르지 않습니다.",
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

    if (room.status === "finished") {
      return NextResponse.json(
        {
          message: "이미 최종 결정이 완료된 방입니다.",
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

    // 이 방을 만든 호스트인지 확인
    const hostVote = await Vote.findOne({
      roomId: room._id,
      voterToken,
      participantType: "host",
    });

    if (!hostVote) {
      return NextResponse.json(
        {
          message: "호스트만 타이브레이크를 결정할 수 있습니다.",
        },
        { status: 403 }
      );
    }

    // 실제 투표가 동점인지 다시 확인
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

    if (firstCount !== secondCount) {
      return NextResponse.json(
        {
          message: "현재 투표 결과는 동점이 아닙니다.",
        },
        { status: 400 }
      );
    }

    room.finalFoodId = foodId;
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
        message: "타이브레이크 처리 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}