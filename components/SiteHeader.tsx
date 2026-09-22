"use client";

import {
  usePathname,
  useRouter,
} from "next/navigation";
import { useSession } from "next-auth/react";

interface SiteHeaderProps {
  label?: string;
  maxWidth?: string;
}

export default function SiteHeader({
  label,
  maxWidth = "1100px",
}: SiteHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    data: session,
    status,
  } = useSession();

  /*
    현재 페이지를 기억한 로그인 주소
    예:
    /result
    ↓
    /login?callbackUrl=%2Fresult
  */
  const loginUrl =
    `/login?callbackUrl=${encodeURIComponent(
      pathname
    )}`;

  return (
    <header
      style={{
        width: "100%",
        maxWidth,
        margin: "0 auto 60px",
        display: "flex",
        flexWrap: "wrap",
        gap: "14px",
        justifyContent:
          "space-between",
        alignItems: "center",
      }}
    >
      {/* 로고 → 홈 */}
      <button
        type="button"
        onClick={() => {
          router.push("/");
        }}
        aria-label="먹픽 홈으로 이동"
        style={{
          padding: 0,
          border: 0,
          background: "transparent",
          color: "#ff5a36",
          fontSize: "24px",
          fontWeight: 800,
          cursor: "pointer",
          letterSpacing: "-0.02em",
        }}
      >
        MUKPICK
      </button>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "9px",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        {/* 페이지 설명 */}
        {label && (
          <span
            style={{
              marginRight: "4px",
              color: "#746964",
              fontSize: "13px",
            }}
          >
            {label}
          </span>
        )}

        {status === "loading" ? (
          <span
            style={{
              color: "#9a8f89",
              fontSize: "13px",
            }}
          >
            로그인 확인 중...
          </span>
        ) : session?.user ? (
          <>
            {/* 로그인 사용자 */}
            <span
              style={{
                color: "#746964",
                fontSize: "13px",
                fontWeight: 700,
              }}
            >
              {session.user.name}님
            </span>

            <button
              type="button"
              onClick={() => {
                router.push("/mypick");
              }}
              style={{
                padding: "9px 12px",
                border:
                  "1px solid #eadfd8",
                borderRadius: "11px",
                background: "#fffdfb",
                color: "#201a17",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              🍽️ 내 먹픽
            </button>

            <button
              type="button"
              onClick={() => {
                router.push("/account");
              }}
              style={{
                padding: "9px 12px",
                border:
                  "1px solid #eadfd8",
                borderRadius: "11px",
                background: "#fffdfb",
                color: "#201a17",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              👤 사용자 정보
            </button>
          </>
        ) : (
          <>
            {/* 비로그인 사용자 */}
            <span
              style={{
                color: "#9a8f89",
                fontSize: "12px",
                wordBreak: "keep-all",
              }}
            >
              먹픽 기록을 저장하려면 로그인하세요
            </span>

            {/* 로그인 후 현재 페이지로 복귀 */}
            <button
              type="button"
              onClick={() => {
                router.push(loginUrl);
              }}
              style={{
                padding: "9px 13px",
                border:
                  "1px solid #eadfd8",
                borderRadius: "11px",
                background: "#fffdfb",
                color: "#201a17",
                fontSize: "13px",
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
                padding: "9px 13px",
                border: 0,
                borderRadius: "11px",
                background: "#ff5a36",
                color: "#ffffff",
                fontSize: "13px",
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
  );
}