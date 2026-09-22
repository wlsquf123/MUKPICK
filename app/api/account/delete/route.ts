import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { authOptions } from "../../../../lib/auth";
import { connectMongoDB } from "../../../../lib/mongodb";

import User from "../../../../models/User";
import PickHistory from "../../../../models/PickHistory";

const deleteAccountSchema = z.object({
  password: z
    .string()
    .min(1, "비밀번호를 입력해주세요."),
});

export async function DELETE(
  request: Request
) {
  try {
    /*
      1. 로그인 확인
    */
    const session =
      await getServerSession(
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

    /*
      2. 요청 데이터 확인
    */
    const body =
      await request.json();

    const parsed =
      deleteAccountSchema.safeParse(
        body
      );

    if (!parsed.success) {
      return NextResponse.json(
        {
          message:
            parsed.error.issues[0]
              ?.message ??
            "입력 정보를 확인해주세요.",
        },
        {
          status: 400,
        }
      );
    }

    const { password } =
      parsed.data;

    await connectMongoDB();

    /*
      3. 현재 로그인 사용자 조회
    */
    const email =
      session.user.email
        .trim()
        .toLowerCase();

    const user =
      await User.findOne({
        email,
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
      4. 탈퇴 전 비밀번호 재확인
    */
    const passwordMatches =
      await bcrypt.compare(
        password,
        user.passwordHash
      );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          message:
            "비밀번호가 올바르지 않습니다.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      5. 개인 먹픽 기록 삭제
    */
    await PickHistory.deleteMany({
      userId: user._id,
    });

    /*
      6. 회원 계정 삭제
    */
    await User.deleteOne({
      _id: user._id,
    });

    return NextResponse.json({
      message:
        "회원탈퇴가 완료되었습니다.",
    });
  } catch (error) {
    console.error(
      "회원탈퇴 오류:",
      error
    );

    return NextResponse.json(
      {
        message:
          "회원탈퇴 처리 중 오류가 발생했습니다.",
      },
      {
        status: 500,
      }
    );
  }
}