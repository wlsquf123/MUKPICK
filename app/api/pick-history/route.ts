import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import mongoose from "mongoose";

import { authOptions } from "../../../lib/auth";
import { connectMongoDB } from "../../../lib/mongodb";

import User from "../../../models/User";
import Room from "../../../models/Room";
import PickHistory from "../../../models/PickHistory";

import { foods } from "../../../data/foods";

const saveHistorySchema = z.object({
  shareToken: z.string().min(1),
});

const deleteHistorySchema = z.object({
  historyId: z.string().min(1),
});

/*
  내 먹픽 기록 조회
*/
export async function GET() {
  try {
    const session = await getServerSession(
      authOptions
    );

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          message: "로그인이 필요한 기능입니다.",
        },
        {
          status: 401,
        }
      );
    }

    await connectMongoDB();

    const user = await User.findOne({
      email: session.user.email
        .trim()
        .toLowerCase(),
    });

    if (!user) {
      return NextResponse.json(
        {
          message:
            "사용자 정보를 찾을 수 없습니다.",
        },
        {
          status: 404,
        }
      );
    }

    const histories =
      await PickHistory.find({
        userId: user._id,
      })
        .sort({
          decidedAt: -1,
        })
        .limit(30)
        .lean();

    const result = histories.map(
      (history) => {
        const food = foods.find(
          (item) =>
            item.id === history.foodId
        );

        return {
          id: String(history._id),

          shareToken:
            history.shareToken,

          foodId:
            history.foodId,

          foodName:
            history.foodName,

          decidedAt:
            history.decidedAt,

          food: food ?? null,
        };
      }
    );

    return NextResponse.json({
      username:
        session.user.name ??
        "먹픽 사용자",

      count: result.length,

      histories: result,
    });
  } catch (error) {
    console.error(
      "먹픽 기록 조회 오류:",
      error
    );

    return NextResponse.json(
      {
        message:
          "먹픽 기록을 불러오는 중 오류가 발생했습니다.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
  최종 먹픽 기록 저장
*/
export async function POST(
  request: Request
) {
  try {
    const session = await getServerSession(
      authOptions
    );

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          message:
            "로그인이 필요한 기능입니다.",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const parsed =
      saveHistorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message:
            "먹픽 기록 정보가 올바르지 않습니다.",
        },
        {
          status: 400,
        }
      );
    }

    const { shareToken } = parsed.data;

    await connectMongoDB();

    const user = await User.findOne({
      email: session.user.email
        .trim()
        .toLowerCase(),
    });

    if (!user) {
      return NextResponse.json(
        {
          message:
            "사용자 정보를 찾을 수 없습니다.",
        },
        {
          status: 404,
        }
      );
    }

    const room = await Room.findOne({
      shareToken,
    });

    if (!room) {
      return NextResponse.json(
        {
          message:
            "먹픽 방을 찾을 수 없습니다.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      room.status !== "finished" ||
      !room.finalFoodId
    ) {
      return NextResponse.json(
        {
          message:
            "아직 최종 메뉴가 결정되지 않았습니다.",
        },
        {
          status: 400,
        }
      );
    }

    const finalFood = foods.find(
      (food) =>
        food.id === room.finalFoodId
    );

    if (!finalFood) {
      return NextResponse.json(
        {
          message:
            "최종 음식 정보를 찾을 수 없습니다.",
        },
        {
          status: 404,
        }
      );
    }

    const history =
      await PickHistory.findOneAndUpdate(
        {
          userId: user._id,
          shareToken,
        },
        {
          $setOnInsert: {
            userId: user._id,
            shareToken,
            foodId: finalFood.id,
            foodName:
              finalFood.name,
            decidedAt:
              new Date(),
          },
        },
        {
          upsert: true,
          new: true,
        }
      );

    return NextResponse.json({
      message:
        "내 먹픽 기록에 저장되었습니다.",

      history: {
        id: String(
          history._id
        ),

        foodId:
          history.foodId,

        foodName:
          history.foodName,

        shareToken:
          history.shareToken,

        decidedAt:
          history.decidedAt,
      },
    });
  } catch (error) {
    console.error(
      "먹픽 기록 저장 오류:",
      error
    );

    return NextResponse.json(
      {
        message:
          "먹픽 기록을 저장하는 중 오류가 발생했습니다.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
  내 먹픽 기록 개별 삭제
*/
export async function DELETE(
  request: Request
) {
  try {
    const session = await getServerSession(
      authOptions
    );

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          message:
            "로그인이 필요한 기능입니다.",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      await request.json();

    const parsed =
      deleteHistorySchema.safeParse(
        body
      );

    if (!parsed.success) {
      return NextResponse.json(
        {
          message:
            "삭제할 기록 정보가 올바르지 않습니다.",
        },
        {
          status: 400,
        }
      );
    }

    const { historyId } =
      parsed.data;

    /*
      잘못된 MongoDB ObjectId 차단
    */
    if (
      !mongoose.Types.ObjectId.isValid(
        historyId
      )
    ) {
      return NextResponse.json(
        {
          message:
            "올바르지 않은 기록입니다.",
        },
        {
          status: 400,
        }
      );
    }

    await connectMongoDB();

    const user =
      await User.findOne({
        email:
          session.user.email
            .trim()
            .toLowerCase(),
      });

    if (!user) {
      return NextResponse.json(
        {
          message:
            "사용자 정보를 찾을 수 없습니다.",
        },
        {
          status: 404,
        }
      );
    }

    /*
      기록 ID뿐 아니라 userId도 같이 확인

      다른 사용자의 기록 ID를 알아도
      삭제할 수 없도록 처리
    */
    const deletedHistory =
      await PickHistory.findOneAndDelete(
        {
          _id: historyId,
          userId: user._id,
        }
      );

    if (!deletedHistory) {
      return NextResponse.json(
        {
          message:
            "삭제할 먹픽 기록을 찾을 수 없습니다.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      message:
        "먹픽 기록이 삭제되었습니다.",

      deletedId:
        String(
          deletedHistory._id
        ),
    });
  } catch (error) {
    console.error(
      "먹픽 기록 삭제 오류:",
      error
    );

    return NextResponse.json(
      {
        message:
          "먹픽 기록을 삭제하는 중 오류가 발생했습니다.",
      },
      {
        status: 500,
      }
    );
  }
}