import { NextResponse } from "next/server";

import { connectMongoDB } from "../../../../lib/mongodb";
import Room from "../../../../models/Room";
import { foods } from "../../../../data/foods";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  try {
    const { shareToken } = await params;

    await connectMongoDB();

    const room = await Room.findOne({
      shareToken,
    }).lean();

    if (!room) {
      return NextResponse.json(
        {
          message: "존재하지 않는 방입니다.",
        },
        { status: 404 }
      );
    }

    const candidateFoods = foods.filter((food) =>
      room.candidateFoodIds.includes(food.id)
    );

    return NextResponse.json({
      roomId: room._id.toString(),
      shareToken: room.shareToken,
      status: room.status,
      preferenceAnswers: room.preferenceAnswers,
      candidateFoods,
      finalFoodId: room.finalFoodId ?? null,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "방 정보를 불러오는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}