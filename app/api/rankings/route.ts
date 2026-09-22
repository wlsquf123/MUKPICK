import { NextResponse } from "next/server";

import { connectMongoDB } from "../../../lib/mongodb";
import PickHistory from "../../../models/PickHistory";
import { foods } from "../../../data/foods";

export const dynamic = "force-dynamic";

interface RankingAggregate {
  _id: string;
  foodName: string;
  pickCount: number;
}

export async function GET() {
  try {
    await connectMongoDB();

    /*
      전체 회원의 PickHistory를
      foodId 기준으로 묶어서 집계
    */
    const aggregated =
      await PickHistory.aggregate<RankingAggregate>([
        {
          $group: {
            _id: "$foodId",

            foodName: {
              $first: "$foodName",
            },

            pickCount: {
              $sum: 1,
            },
          },
        },

        /*
          선택 횟수가 많은 음식부터 정렬
        */
        {
          $sort: {
            pickCount: -1,
            foodName: 1,
          },
        },

        /*
          우선 TOP 10만 사용
        */
        {
          $limit: 10,
        },
      ]);

    /*
      전체 먹픽 기록 수
    */
    const totalPickCount =
      await PickHistory.countDocuments();

    /*
      음식 정보 + 순위 생성

      같은 선택 횟수면 같은 순위
      예:
      10픽 → 1위
      10픽 → 1위
       8픽 → 3위
    */
    let previousPickCount:
      | number
      | null = null;

    let previousRank = 0;

    const rankings =
      aggregated.map(
        (item, index) => {
          const food =
            foods.find(
              (food) =>
                food.id === item._id
            );

          let rank: number;

          if (
            previousPickCount ===
            item.pickCount
          ) {
            rank = previousRank;
          } else {
            rank = index + 1;

            previousRank = rank;

            previousPickCount =
              item.pickCount;
          }

          return {
            rank,

            foodId: item._id,

            foodName:
              food?.name ??
              item.foodName,

            category:
              food?.category ??
              null,

            pickCount:
              item.pickCount,

            food: food ?? null,
          };
        }
      );

    return NextResponse.json(
      {
        totalPickCount,

        rankingCount:
          rankings.length,

        rankings,
      },
      {
        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "음식 랭킹 조회 오류:",
      error
    );

    return NextResponse.json(
      {
        message:
          "음식 랭킹을 불러오는 중 오류가 발생했습니다.",
      },
      {
        status: 500,
      }
    );
  }
}