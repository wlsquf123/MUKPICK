"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signOut,
  useSession,
} from "next-auth/react";

export default function AccountPage() {
  const router = useRouter();

  const {
    data: session,
    status,
  } = useSession();

  const [password, setPassword] =
    useState("");

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
    회원탈퇴
  */
  const handleDeleteAccount =
    async () => {
      if (!password.trim()) {
        setError(
          "현재 비밀번호를 입력해주세요."
        );
        return;
      }

      const confirmed =
        window.confirm(
          "정말 회원탈퇴할까요?\n\n계정과 내 먹픽 기록이 모두 삭제되며 복구할 수 없습니다."
        );

      if (!confirmed) {
        return;
      }

      try {
        setIsDeleting(true);
        setError("");

        const response = await fetch(
          "/api/account/delete",
          {
            method: "DELETE",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              password,
            }),
          }
        );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "회원탈퇴에 실패했습니다."
          );
        }

        /*
          DB에서 계정이 삭제됐으므로
          NextAuth 세션도 종료
        */
        await signOut({
          callbackUrl: "/",
        });
      } catch (error) {
        console.error(
          "회원탈퇴 오류:",
          error
        );

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(
            "회원탈퇴 중 오류가 발생했습니다."
          );
        }
      } finally {
        setIsDeleting(false);
      }
    };

  /*
    로그인 확인 중
  */
  if (status === "loading") {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#fff9f4",
          color: "#201a17",
          padding: "24px",
        }}
      >
        계정 정보를 확인하는 중...
      </main>
    );
  }

  /*
    로그인하지 않은 상태
  */
  if (status === "unauthenticated") {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "24px 16px",
          background: "#fff9f4",
          fontFamily:
            "Arial, sans-serif",
        }}
      >
        <section
          style={{
            width: "100%",
            maxWidth: "440px",
            padding: "36px",
            background: "#fffdfb",
            border:
              "1px solid #eadfd8",
            borderRadius: "24px",
            textAlign: "center",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              fontSize: "52px",
              marginBottom: "16px",
            }}
          >
            🔐
          </div>

          <h1
            style={{
              margin: "0 0 12px",
              fontSize: "28px",
            }}
          >
            로그인이 필요해요
          </h1>

          <p
            style={{
              margin: "0 0 26px",
              color: "#746964",
              lineHeight: 1.6,
            }}
          >
            계정 관리는 로그인한
            사용자만 이용할 수 있어요.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/login")
            }
            style={{
              width: "100%",
              padding: "15px",
              border: 0,
              borderRadius: "14px",
              background: "#ff5a36",
              color: "white",
              fontSize: "16px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            로그인하기
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
        fontFamily:
          "Arial, sans-serif",
        boxSizing: "border-box",
      }}
    >
      {/* 상단 */}
      <header
        style={{
          width: "100%",
          maxWidth: "900px",
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "center",
          justifyContent:
            "space-between",
        }}
      >
        <button
          type="button"
          onClick={() =>
            router.push("/")
          }
          style={{
            padding: 0,
            border: 0,
            background: "transparent",
            color: "#ff5a36",
            fontSize: "24px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          MUKPICK
        </button>

        <button
          type="button"
          onClick={() =>
            router.push("/")
          }
          style={{
            padding: "10px 14px",
            border:
              "1px solid #eadfd8",
            borderRadius: "12px",
            background: "#fffdfb",
            color: "#201a17",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          ← 홈으로
        </button>
      </header>

      <section
        style={{
          width: "100%",
          maxWidth: "620px",
          margin: "0 auto",
          paddingTop:
            "clamp(55px, 9vw, 90px)",
        }}
      >
        {/* 계정 정보 */}
        <div
          style={{
            marginBottom: "24px",
            padding:
              "clamp(24px, 5vw, 32px)",
            background: "#fffdfb",
            border:
              "1px solid #eadfd8",
            borderRadius: "24px",
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              color: "#ff5a36",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            MY ACCOUNT
          </p>

          <h1
            style={{
              margin: "0 0 28px",
              fontSize:
                "clamp(30px, 7vw, 38px)",
            }}
          >
            계정 관리
          </h1>

          <div
            style={{
              display: "grid",
              gap: "18px",
            }}
          >
            <div>
              <p
                style={{
                  margin: "0 0 6px",
                  color: "#9a8f89",
                  fontSize: "13px",
                }}
              >
                사용자 이름
              </p>

              <strong>
                {session?.user?.name ??
                  "-"}
              </strong>
            </div>

            <div>
              <p
                style={{
                  margin: "0 0 6px",
                  color: "#9a8f89",
                  fontSize: "13px",
                }}
              >
                이메일
              </p>

              <strong
                style={{
                  wordBreak:
                    "break-all",
                }}
              >
                {session?.user?.email ??
                  "-"}
              </strong>
            </div>
          </div>
        </div>

        {/* 탈퇴 영역 */}
        <div
          style={{
            padding:
              "clamp(24px, 5vw, 32px)",
            background: "#fffdfb",
            border:
              "1px solid #efc8c0",
            borderRadius: "24px",
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              color: "#b54835",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            DANGER ZONE
          </p>

          <h2
            style={{
              margin: "0 0 12px",
              fontSize: "25px",
            }}
          >
            회원탈퇴
          </h2>

          <p
            style={{
              margin: "0 0 24px",
              color: "#746964",
              lineHeight: 1.7,
              wordBreak: "keep-all",
            }}
          >
            회원탈퇴하면 계정과
            내 먹픽 기록이 삭제됩니다.
            삭제된 정보는 복구할 수
            없습니다.
          </p>

          <label
            htmlFor="delete-password"
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            현재 비밀번호 확인
          </label>

          <input
            id="delete-password"
            type="password"
            value={password}
            disabled={isDeleting}
            placeholder="현재 비밀번호 입력"
            onChange={(event) => {
              setPassword(
                event.target.value
              );

              if (error) {
                setError("");
              }
            }}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !isDeleting
              ) {
                handleDeleteAccount();
              }
            }}
            style={{
              width: "100%",
              padding: "15px 16px",
              border:
                "1px solid #d9cec8",
              borderRadius: "13px",
              background: "white",
              color: "#201a17",
              fontSize: "16px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          {error && (
            <div
              style={{
                marginTop: "12px",
                padding: "12px 14px",
                background: "#fff0ed",
                border:
                  "1px solid #ffd4ca",
                borderRadius: "12px",
                color: "#b54835",
                fontSize: "14px",
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="button"
            disabled={
              isDeleting ||
              !password.trim()
            }
            onClick={
              handleDeleteAccount
            }
            style={{
              width: "100%",
              marginTop: "18px",
              padding: "16px",
              border: 0,
              borderRadius: "14px",
              background:
                isDeleting ||
                !password.trim()
                  ? "#d8bdb7"
                  : "#b54835",
              color: "white",
              fontSize: "16px",
              fontWeight: 700,
              cursor:
                isDeleting ||
                !password.trim()
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {isDeleting
              ? "회원탈퇴 처리 중..."
              : "회원탈퇴"}
          </button>
        </div>

        <div
          style={{
            marginTop: "24px",
            textAlign: "center",
          }}
        >
          <button
            type="button"
            onClick={() =>
              router.push("/mypick")
            }
            style={{
              border: 0,
              background: "transparent",
              color: "#746964",
              fontSize: "14px",
              textDecoration:
                "underline",
              cursor: "pointer",
            }}
          >
            내 먹픽으로 돌아가기
          </button>
        </div>
      </section>
    </main>
  );
}