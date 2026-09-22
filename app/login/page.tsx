"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
    로그인 전에 있던 페이지 주소 확인

    예:
    /login?callbackUrl=%2Fresult
    → /result

    외부 주소나 이상한 주소가 들어오면
    안전하게 홈("/")으로 이동
  */
  const getCallbackUrl = () => {
    if (typeof window === "undefined") {
      return "/";
    }

    const params =
      new URLSearchParams(
        window.location.search
      );

    const callbackUrl =
      params.get("callbackUrl");

    if (
      !callbackUrl ||
      !callbackUrl.startsWith("/") ||
      callbackUrl.startsWith("//")
    ) {
      return "/";
    }

    return callbackUrl;
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const result = await signIn(
        "credentials",
        {
          email: email
            .trim()
            .toLowerCase(),

          password,

          redirect: false,
        }
      );

      if (!result) {
        throw new Error(
          "로그인 결과를 확인하지 못했습니다."
        );
      }

      if (result.error) {
        setError(
          "이메일 또는 비밀번호가 올바르지 않습니다."
        );

        return;
      }

      /*
        로그인 성공 후
        로그인 전에 보고 있던 페이지로 복귀
      */
      const callbackUrl =
        getCallbackUrl();

      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      console.error(
        "로그인 오류:",
        error
      );

      setError(
        "로그인 중 오류가 발생했습니다. 다시 시도해주세요."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueWithoutLogin =
    () => {
      const callbackUrl =
        getCallbackUrl();

      router.push(callbackUrl);
    };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#fff9f4",
        color: "#201a17",
        padding: "28px 16px 60px",
        fontFamily:
          "Arial, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <header
        style={{
          width: "100%",
          maxWidth: "1100px",
          margin: "0 auto",
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <button
          type="button"
          onClick={() =>
            router.push("/")
          }
          style={{
            border: 0,
            padding: 0,
            background: "transparent",
            color: "#ff5a36",
            fontSize: "24px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          MUKPICK
        </button>

        <span
          style={{
            color: "#746964",
            fontSize: "14px",
          }}
        >
          로그인
        </span>
      </header>

      <section
        style={{
          width: "100%",
          maxWidth: "460px",
          margin: "0 auto",

          paddingTop:
            "clamp(55px, 10vw, 90px)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              fontSize: "52px",
              marginBottom: "16px",
            }}
          >
            🍽️
          </div>

          <p
            style={{
              margin: "0 0 10px",
              color: "#ff5a36",
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            WELCOME BACK
          </p>

          <h1
            style={{
              margin: "0 0 12px",

              fontSize:
                "clamp(30px, 7vw, 40px)",

              lineHeight: 1.25,
            }}
          >
            다시 만났네요!
          </h1>

          <p
            style={{
              margin: 0,
              color: "#746964",
              lineHeight: 1.6,
              wordBreak: "keep-all",
            }}
          >
            로그인하면 앞으로
            내 먹픽 기록을 확인할 수 있어요.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            padding:
              "clamp(22px, 5vw, 32px)",

            background: "#fffdfb",

            border:
              "1px solid #eadfd8",

            borderRadius: "24px",

            boxSizing: "border-box",
          }}
        >
          {/* 이메일 */}
          <label
            style={{
              display: "block",
              marginBottom: "20px",
            }}
          >
            <span
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              이메일
            </span>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              required
              placeholder="example@email.com"
              autoComplete="email"
              disabled={isLoading}
              style={{
                width: "100%",

                padding:
                  "15px 16px",

                border:
                  "1px solid #ded1ca",

                borderRadius:
                  "12px",

                background:
                  "#ffffff",

                color: "#201a17",

                fontSize: "16px",

                outline: "none",

                boxSizing:
                  "border-box",
              }}
            />
          </label>

          {/* 비밀번호 */}
          <label
            style={{
              display: "block",
              marginBottom: "24px",
            }}
          >
            <span
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              비밀번호
            </span>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              required
              placeholder="비밀번호를 입력해주세요"
              autoComplete="current-password"
              disabled={isLoading}
              style={{
                width: "100%",

                padding:
                  "15px 16px",

                border:
                  "1px solid #ded1ca",

                borderRadius:
                  "12px",

                background:
                  "#ffffff",

                color: "#201a17",

                fontSize: "16px",

                outline: "none",

                boxSizing:
                  "border-box",
              }}
            />
          </label>

          {/* 오류 메시지 */}
          {error && (
            <div
              style={{
                marginBottom:
                  "18px",

                padding:
                  "13px 14px",

                background:
                  "#fff0ed",

                border:
                  "1px solid #ffd4ca",

                borderRadius:
                  "12px",

                color:
                  "#c0392b",

                fontSize:
                  "14px",

                lineHeight:
                  1.5,
              }}
            >
              {error}
            </div>
          )}

          {/* 로그인 */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",

              padding: "16px",

              border: 0,

              borderRadius:
                "14px",

              background:
                "#ff5a36",

              color:
                "#ffffff",

              fontSize:
                "16px",

              fontWeight:
                700,

              cursor:
                isLoading
                  ? "not-allowed"
                  : "pointer",

              opacity:
                isLoading
                  ? 0.6
                  : 1,
            }}
          >
            {isLoading
              ? "로그인하는 중..."
              : "로그인"}
          </button>

          {/* 회원가입 */}
          <div
            style={{
              marginTop:
                "22px",

              textAlign:
                "center",

              color:
                "#746964",

              fontSize:
                "14px",
            }}
          >
            아직 계정이 없나요?{" "}
            <button
              type="button"
              onClick={() => {
                const callbackUrl =
                  getCallbackUrl();

                router.push(
                  `/signup?callbackUrl=${encodeURIComponent(
                    callbackUrl
                  )}`
                );
              }}
              style={{
                border: 0,
                padding: 0,
                background:
                  "transparent",
                color:
                  "#ff5a36",
                fontWeight:
                  700,
                cursor:
                  "pointer",
              }}
            >
              회원가입
            </button>
          </div>
        </form>

        {/* 비로그인 사용 */}
        <div
          style={{
            marginTop: "18px",
            textAlign: "center",
          }}
        >
          <button
            type="button"
            onClick={
              handleContinueWithoutLogin
            }
            style={{
              border: 0,

              padding:
                "12px 16px",

              background:
                "transparent",

              color:
                "#746964",

              fontSize:
                "14px",

              cursor:
                "pointer",
            }}
          >
            로그인 없이 계속 이용하기 →
          </button>
        </div>
      </section>
    </main>
  );
}