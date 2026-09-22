import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { connectMongoDB } from "../../../../lib/mongodb";
import User from "../../../../models/User";

const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2, "사용자이름은 2자 이상이어야 합니다.")
    .max(20, "사용자이름은 20자 이하여야 합니다."),

  email: z
    .string()
    .trim()
    .email("올바른 이메일을 입력해주세요."),

  password: z
    .string()
    .min(8, "비밀번호는 8자 이상이어야 합니다."),

  passwordConfirm: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message:
            parsed.error.issues[0]?.message ||
            "회원가입 정보를 확인해주세요.",
        },
        {
          status: 400,
        }
      );
    }

    const {
      username,
      email,
      password,
      passwordConfirm,
    } = parsed.data;

    /*
      비밀번호 확인
    */
    if (password !== passwordConfirm) {
      return NextResponse.json(
        {
          message:
            "비밀번호가 서로 일치하지 않습니다.",
        },
        {
          status: 400,
        }
      );
    }

    await connectMongoDB();

    /*
      이메일 중복 확인
    */
    const normalizedEmail =
      email.toLowerCase();

    const existingUser =
      await User.findOne({
        email: normalizedEmail,
      });

    if (existingUser) {
      return NextResponse.json(
        {
          message:
            "이미 사용 중인 이메일입니다.",
        },
        {
          status: 409,
        }
      );
    }

    /*
      비밀번호 해시
      원래 비밀번호는 DB에 저장하지 않음
    */
    const passwordHash =
      await bcrypt.hash(password, 12);

    const user = await User.create({
      username,
      email: normalizedEmail,
      passwordHash,
    });

    return NextResponse.json(
      {
        message:
          "회원가입이 완료되었습니다.",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error: unknown) {
    console.error(
      "회원가입 오류:",
      error
    );

    /*
      MongoDB unique index에서
      이메일 중복이 잡힌 경우
    */
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return NextResponse.json(
        {
          message:
            "이미 사용 중인 이메일입니다.",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        message:
          "회원가입 중 오류가 발생했습니다.",
      },
      {
        status: 500,
      }
    );
  }
}