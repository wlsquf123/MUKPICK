"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    setError("");

    if (password !== passwordConfirm) {
      setError(
        "비밀번호가 서로 일치하지 않습니다."
      );
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        "/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            username,
            email,
            password,
            passwordConfirm,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "회원가입에 실패했습니다."
        );
      }

      setSuccess(true);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "회원가입 중 오류가 발생했습니다."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#fff9f4",
          display: "grid",
          placeItems: "center",
          padding: "24px 16px",
          fontFamily: "Arial, sans-serif",
          color: "#201a17",
        }}
      >
        <section
          style={{
            width: "100%",
            maxWidth: "460px",
            padding:
              "clamp(28px, 6vw, 44px)",
            background: "#fffdfb",
            border: "1px solid #eadfd8",
            borderRadius: "24px",
            textAlign: "center",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              fontSize: "56px",
              marginBottom: "18px",
            }}
          >
            🎉
          </div>

          <p
            style={{
              margin: "0 0 8px",
              color: "#ff5a36",
              fontWeight: 700,
            }}
          >
            회원가입 완료
          </p>

          <h1
            style={{
              margin: "0 0 14px",
              fontSize:
                "clamp(28px, 7vw, 34px)",
              lineHeight: 1.3,
            }}
          >
            먹픽에 오신 걸 환영해요!
          </h1>

          <p
            style={{
              margin: "0 0 28px",
              color: "#746964",
              lineHeight: 1.7,
            }}
          >
            이제 로그인하면 나중에
            내 먹픽 기록을 저장하고
            확인할 수 있어요.
          </p>

          <button
            onClick={() =>
              router.push("/login")
            }
            style={{
              width: "100%",
              padding: "16px",
              border: 0,
              borderRadius: "14px",
              background: "#ff5a36",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            로그인하러 가기
          </button>

          <button
            onClick={() =>
              router.push("/")
            }
            style={{
              width: "100%",
              marginTop: "10px",
              padding: "14px",
              border: 0,
              background: "transparent",
              color: "#746964",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            로그인 없이 먹픽 시작하기
          </button>
        </section>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#fff9f4",
        color: "#201a17",
        padding: "28px 16px 60px",
        fontFamily: "Arial, sans-serif",
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
          회원가입
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
            marginBottom: "30px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: "0 0 10px",
              color: "#ff5a36",
              fontWeight: 700,
              fontSize: "14px",
            }}
          >
            MUKPICK ACCOUNT
          </p>

          <h1
            style={{
              margin: "0 0 12px",
              fontSize:
                "clamp(30px, 7vw, 40px)",
              lineHeight: 1.25,
            }}
          >
            먹픽 시작하기
          </h1>

          <p
            style={{
              margin: 0,
              color: "#746964",
              lineHeight: 1.6,
            }}
          >
            로그인하지 않아도 먹픽은
            사용할 수 있어요.
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
              사용자이름
            </span>

            <input
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(
                  event.target.value
                )
              }
              required
              minLength={2}
              maxLength={20}
              placeholder="먹픽왕"
              autoComplete="username"
              style={{
                width: "100%",
                padding: "15px 16px",
                border:
                  "1px solid #ded1ca",
                borderRadius: "12px",
                background: "#ffffff",
                color: "#201a17",
                fontSize: "16px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </label>

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
              style={{
                width: "100%",
                padding: "15px 16px",
                border:
                  "1px solid #ded1ca",
                borderRadius: "12px",
                background: "#ffffff",
                color: "#201a17",
                fontSize: "16px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </label>

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
              minLength={8}
              placeholder="8자 이상 입력해주세요"
              autoComplete="new-password"
              style={{
                width: "100%",
                padding: "15px 16px",
                border:
                  "1px solid #ded1ca",
                borderRadius: "12px",
                background: "#ffffff",
                color: "#201a17",
                fontSize: "16px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </label>

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
              비밀번호 확인
            </span>

            <input
              type="password"
              value={passwordConfirm}
              onChange={(event) =>
                setPasswordConfirm(
                  event.target.value
                )
              }
              required
              minLength={8}
              placeholder="비밀번호를 다시 입력해주세요"
              autoComplete="new-password"
              style={{
                width: "100%",
                padding: "15px 16px",
                border:
                  "1px solid #ded1ca",
                borderRadius: "12px",
                background: "#ffffff",
                color: "#201a17",
                fontSize: "16px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </label>

          {error && (
            <div
              style={{
                marginBottom: "18px",
                padding: "13px 14px",
                background: "#fff0ed",
                borderRadius: "12px",
                color: "#c0392b",
                fontSize: "14px",
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "16px",
              border: 0,
              borderRadius: "14px",
              background: "#ff5a36",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: 700,
              cursor: isLoading
                ? "not-allowed"
                : "pointer",
              opacity: isLoading
                ? 0.6
                : 1,
            }}
          >
            {isLoading
              ? "가입하는 중..."
              : "회원가입"}
          </button>

          <div
            style={{
              marginTop: "22px",
              textAlign: "center",
              color: "#746964",
              fontSize: "14px",
            }}
          >
            이미 계정이 있나요?{" "}
            <button
              type="button"
              onClick={() =>
                router.push("/login")
              }
              style={{
                border: 0,
                padding: 0,
                background:
                  "transparent",
                color: "#ff5a36",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              로그인
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}