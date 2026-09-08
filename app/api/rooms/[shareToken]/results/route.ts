import { NextResponse } from "next/server";

import { connectMongoDB } from "../../../../../lib/mongodb";
import Room from "../../../../../models/Room";
import Vote from "../../../../../models/Vote";
import { foods } from "../../../../../data/foods";

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

    const votes = await Vote.find({
      roomId: room._id,
    }).lean();

    const results = room.candidateFoodIds.map((foodId) => {
      const food = foods.find(
        (item) => item.id === foodId
      );

      const voteCount = votes.filter(
        (vote) => vote.foodId === foodId
      ).length;

      return {
        foodId,
        food,
        voteCount,
      };
    });

    const totalVotes = votes.length;

    const firstResult = results[0];
    const secondResult = results[1];

    const isTie =
      firstResult.voteCount === secondResult.voteCount;

    let leadingFoodId: string | null = null;

    if (!isTie) {
      leadingFoodId =
        firstResult.voteCount > secondResult.voteCount
          ? firstResult.foodId
          : secondResult.foodId;
    }

    return NextResponse.json({
      shareToken: room.shareToken,
      status: room.status,
      totalVotes,
      results,

      isTie,
      leadingFoodId,

      finalFoodId: room.finalFoodId ?? null,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "투표 결과를 불러오는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}