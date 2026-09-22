"use client";

import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function HomePage() {
  const router = useRouter();

  const { data: session, status } = useSession();

  const handleStart = () => {
    sessionStorage.removeItem("recommendations");
    sessionStorage.removeItem("selectedTags");
    sessionStorage.removeItem("selectedFood");
    sessionStorage.removeItem("shareToken");

    router.push("/preference");
  };

  const handleLogout = async () => {
    await signOut({
      redirect: false,
    });

    router.refresh();
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#fff9f4",
        color: "#201a17",
        padding: "28px 16px 48px",
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
          flexWrap: "wrap",
          gap: "16px",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <strong
          style={{
            fontSize: "24px",
            color: "#ff5a36",
          }}
        >
          MUKPICK
        </strong>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          {status === "loading" ? (
            <span
              style={{
                color: "#9a8f89",
                fontSize: "14px",
              }}
            >
              로그인 확인 중...
            </span>
          ) : session?.user ? (
            <>
              <span
                style={{
                  color: "#746964",
                  fontSize: "14px",
                  fontWeight: 700,
                }}
              >
                {session.user.name}님
              </span>

              {/* 음식 랭킹 */}
              <button
                type="button"
                onClick={() => {
                  router.push("/ranking");
                }}
                style={{
                  padding: "10px 14px",
                  border: "1px solid #eadfd8",
                  borderRadius: "12px",
                  background: "#fffdfb",
                  color: "#201a17",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                🏆 음식 랭킹
              </button>

              {/* 내 먹픽 */}
              <button
                type="button"
                onClick={() => {
                  router.push("/mypick");
                }}
                style={{
                  padding: "10px 14px",
                  border: "1px solid #eadfd8",
                  borderRadius: "12px",
                  background: "#fffdfb",
                  color: "#201a17",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                🍽️ 내 먹픽
              </button>

              {/* 사용자 정보 */}
              <button
                type="button"
                onClick={() => {
                  router.push("/account");
                }}
                style={{
                  padding: "10px 14px",
                  border: "1px solid #eadfd8",
                  borderRadius: "12px",
                  background: "#fffdfb",
                  color: "#201a17",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                👤 사용자 정보
              </button>

              {/* 로그아웃 */}
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  padding: "10px 14px",
                  border: 0,
                  borderRadius: "12px",
                  background: "#2b211d",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              {/* 비로그인 상태에서도 랭킹 조회 가능 */}
              <button
                type="button"
                onClick={() => {
                  router.push("/ranking");
                }}
                style={{
                  padding: "10px 14px",
                  border: "1px solid #eadfd8",
                  borderRadius: "12px",
                  background: "#fffdfb",
                  color: "#201a17",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                🏆 음식 랭킹
              </button>

              <button
                type="button"
                onClick={() => {
                  router.push("/login");
                }}
                style={{
                  padding: "10px 14px",
                  border: "1px solid #eadfd8",
                  borderRadius: "12px",
                  background: "#fffdfb",
                  color: "#201a17",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                로그인
              </button>

              <button
                type="button"
                onClick={() => {
                  router.push("/signup");
                }}
                style={{
                  padding: "10px 14px",
                  border: 0,
                  borderRadius: "12px",
                  background: "#ff5a36",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                회원가입
              </button>
            </>
          )}
        </div>
      </header>

      <section
        style={{
          width: "100%",
          maxWidth: "1100px",
          minHeight: "calc(100vh - 130px)",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "48px",
          alignItems: "center",
          padding: "60px 0",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "620px",
          }}
        >
          <p
            style={{
              margin: "0 0 16px",
              color: "#ff5a36",
              fontSize: "15px",
              fontWeight: 700,
            }}
          >
            취향 기반 메뉴 추천
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(42px, 8vw, 74px)",
              lineHeight: 1.08,
              letterSpacing: "-0.04em",
              wordBreak: "keep-all",
            }}
          >
            오늘 뭐 먹을지,
            <br />
            먹픽이 골라줄게.
          </h1>

          <p
            style={{
              maxWidth: "520px",
              margin: "28px 0 0",
              color: "#746964",
              fontSize: "clamp(16px, 3vw, 19px)",
              lineHeight: 1.8,
              wordBreak: "keep-all",
            }}
          >
            간단한 취향 질문에 답하면 지금 먹기 좋은 메뉴
            2개를 추천해드려요. 혼자 고르기 어렵다면 친구와
            함께 투표해서 결정할 수도 있어요.
          </p>

          {session?.user && (
            <div
              style={{
                marginTop: "24px",
                padding: "16px 18px",
                maxWidth: "420px",
                background: "#fff7f2",
                border: "1px solid #f0d9cc",
                borderRadius: "16px",
                color: "#5f514b",
                lineHeight: 1.6,
                fontSize: "14px",
              }}
            >
              <strong
                style={{
                  color: "#ff5a36",
                }}
              >
                {session.user.name}님,
              </strong>{" "}
              오늘 메뉴도 먹픽으로 골라볼까요?
            </div>
          )}

          <button
            onClick={handleStart}
            style={{
              width: "min(100%, 340px)",
              marginTop: "36px",
              padding: "18px 28px",
              border: 0,
              borderRadius: "16px",
              background: "#ff5a36",
              color: "#ffffff",
              fontSize: "17px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow:
                "0 10px 24px rgba(255, 90, 54, 0.18)",
            }}
          >
            내 취향으로 메뉴 추천받기
          </button>

          {!session?.user && (
            <p
              style={{
                marginTop: "16px",
                color: "#9a8f89",
                fontSize: "13px",
              }}
            >
              로그인 없이도 바로 시작할 수 있어요.
            </p>
          )}
        </div>

        <div
          style={{
            width: "100%",
            maxWidth: "460px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "1 / 1",
              display: "grid",
              placeItems: "center",
              background: "#fff0e8",
              borderRadius: "50%",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                fontSize: "clamp(110px, 24vw, 190px)",
                lineHeight: 1,
                filter:
                  "drop-shadow(0 18px 18px rgba(76, 47, 34, 0.12))",
              }}
            >
              🍜
            </div>

            <div
              style={{
                position: "absolute",
                top: "12%",
                right: "8%",
                padding: "10px 14px",
                background: "#fffdfb",
                border: "1px solid #eadfd8",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: 700,
                color: "#ff5a36",
              }}
            >
              🌶️ 매콤
            </div>

            <div
              style={{
                position: "absolute",
                bottom: "14%",
                left: "5%",
                padding: "10px 14px",
                background: "#fffdfb",
                border: "1px solid #eadfd8",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: 700,
                color: "#5f514b",
              }}
            >
              🍚 든든
            </div>

            <div
              style={{
                position: "absolute",
                bottom: "6%",
                right: "12%",
                padding: "10px 14px",
                background: "#fffdfb",
                border: "1px solid #eadfd8",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: 700,
                color: "#5f514b",
              }}
            >
              ✨ 취향 추천
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}