"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#fff9f4",
        color: "#201a17",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "34px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <strong
          style={{
            fontSize: "26px",
            color: "#ff5a36",
            letterSpacing: "-0.5px",
          }}
        >
          MUKPICK
        </strong>

        <span
          style={{
            fontSize: "14px",
            color: "#746964",
          }}
        >
          오늘 메뉴, 같이 골라요
        </span>
      </header>

      <section
        style={{
          maxWidth: "1180px",
          minHeight: "680px",
          margin: "0 auto",
          padding: "40px 28px 80px",
          display: "grid",
          gridTemplateColumns: "1.05fr 0.95fr",
          alignItems: "center",
          gap: "70px",
        }}
      >
        <div>
          <p
            style={{
              display: "inline-block",
              margin: "0 0 22px",
              padding: "9px 14px",
              borderRadius: "999px",
              background: "#fff0e9",
              color: "#ff5a36",
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            오늘 뭐 먹지?
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "62px",
              lineHeight: 1.15,
              letterSpacing: "-2px",
            }}
          >
            고민은 줄이고,
            <br />
            <span
              style={{
                color: "#ff5a36",
              }}
            >
              메뉴는 빠르게.
            </span>
          </h1>

          <p
            style={{
              maxWidth: "540px",
              margin: "26px 0 0",
              color: "#746964",
              fontSize: "19px",
              lineHeight: 1.7,
            }}
          >
            몇 가지 취향만 고르면 오늘 먹기 좋은 메뉴를
            두 개로 좁혀드려요.
            <br />
            혼자 결정하기 어렵다면 친구에게 링크를 보내
            같이 투표할 수도 있어요.
          </p>

          <button
            onClick={() => {
              sessionStorage.removeItem("recommendations");
              sessionStorage.removeItem("selectedTags");
              sessionStorage.removeItem("selectedFood");
              sessionStorage.removeItem("shareToken");

              router.push("/preference");
            }}
            style={{
              marginTop: "38px",
              padding: "18px 34px",
              border: 0,
              borderRadius: "16px",
              background: "#ff5a36",
              color: "white",
              fontSize: "18px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 12px 30px rgba(255, 90, 54, 0.2)",
            }}
          >
            메뉴 추천 시작하기 →
          </button>

          <div
            style={{
              marginTop: "42px",
              display: "flex",
              gap: "28px",
              color: "#746964",
              fontSize: "14px",
            }}
          >
            <span>✓ 로그인 없이</span>
            <span>✓ 빠른 취향 선택</span>
            <span>✓ 친구와 함께 투표</span>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            minHeight: "520px",
            display: "grid",
            placeItems: "center",
          }}
        >
          <div
            style={{
              width: "450px",
              height: "450px",
              borderRadius: "50%",
              background: "#fff0e9",
              display: "grid",
              placeItems: "center",
            }}
          >
            <div
              style={{
                width: "320px",
                padding: "30px",
                borderRadius: "30px",
                background: "#fffdfb",
                border: "1px solid #eadfd8",
                boxShadow: "0 18px 50px rgba(60, 35, 25, 0.08)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "100px",
                  marginBottom: "18px",
                }}
              >
                🍜
              </div>

              <strong
                style={{
                  display: "block",
                  fontSize: "26px",
                  marginBottom: "8px",
                }}
              >
                오늘의 먹픽
              </strong>

              <span
                style={{
                  color: "#746964",
                  fontSize: "15px",
                }}
              >
                취향을 골라 두 메뉴로 좁혀보세요
              </span>
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              top: "65px",
              right: "10px",
              padding: "14px 18px",
              borderRadius: "16px",
              background: "#fffdfb",
              border: "1px solid #eadfd8",
              fontWeight: 700,
              transform: "rotate(5deg)",
            }}
          >
            🌶️ 매콤하게?
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "75px",
              left: "0",
              padding: "14px 18px",
              borderRadius: "16px",
              background: "#fffdfb",
              border: "1px solid #eadfd8",
              fontWeight: 700,
              transform: "rotate(-5deg)",
            }}
          >
            👥 같이 고르기
          </div>
        </div>
      </section>
    </main>
  );
}