"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { preferenceQuestions } from "../../data/preferences";
import type { PreferenceTag } from "../../data/foods";

export default function PreferencePage() {
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTags, setSelectedTags] = useState<PreferenceTag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const currentQuestion = preferenceQuestions[currentIndex];
  const isLastQuestion = currentIndex === preferenceQuestions.length - 1;

  const handleSelect = async (tag: PreferenceTag) => {
    const nextTags = [...selectedTags, tag];

    if (!isLastQuestion) {
      setSelectedTags(nextTags);
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedTags: nextTags,
        }),
      });

      if (!response.ok) {
        throw new Error("추천 요청 실패");
      }

      const data = await response.json();

      sessionStorage.removeItem("selectedFood");
      
      sessionStorage.setItem(
        "recommendations",
        JSON.stringify(data.recommendations)
      );

      sessionStorage.setItem(
        "selectedTags",
        JSON.stringify(nextTags)
      );

      router.push("/result");
    } catch {
      setError("추천 결과를 불러오지 못했어요. 다시 시도해주세요.");
      setIsLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#fff9f4",
        color: "#201a17",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          width: "100%",
          maxWidth: "1100px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "70px",
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

        <span
          style={{
            fontSize: "14px",
            color: "#746964",
          }}
        >
          오늘 메뉴 같이 고르기
        </span>
      </header>

      <section
        style={{
          width: "100%",
          maxWidth: "760px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: "#ff5a36",
            fontWeight: 700,
            marginBottom: "14px",
          }}
        >
          취향 고르기
        </p>

        <h1
          style={{
            fontSize: "42px",
            margin: "0 0 14px",
          }}
        >
          {currentQuestion.question}
        </h1>

        <p
          style={{
            color: "#746964",
            marginBottom: "44px",
          }}
        >
          지금 더 끌리는 쪽을 골라주세요.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <button
            disabled={isLoading}
            onClick={() => handleSelect(currentQuestion.left.tag)}
            style={{
              minHeight: "220px",
              border: "1px solid #eadfd8",
              borderRadius: "24px",
              background: "#fffdfb",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontSize: "26px",
              fontWeight: 700,
              color: "#2b211d",
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {currentQuestion.left.label}
          </button>

          <button
            disabled={isLoading}
            onClick={() => handleSelect(currentQuestion.right.tag)}
            style={{
              minHeight: "220px",
              border: "1px solid #eadfd8",
              borderRadius: "24px",
              background: "#fffdfb",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontSize: "26px",
              fontWeight: 700,
              color: "#2b211d",
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {currentQuestion.right.label}
          </button>
        </div>

        {isLoading && (
          <p
            style={{
              marginTop: "24px",
              color: "#ff5a36",
              fontWeight: 700,
            }}
          >
            메뉴를 고르는 중...
          </p>
        )}

        {error && (
          <p
            style={{
              marginTop: "24px",
              color: "#c0392b",
            }}
          >
            {error}
          </p>
        )}

        <div
          style={{
            marginTop: "38px",
          }}
        >
          <p
            style={{
              fontSize: "14px",
              color: "#746964",
            }}
          >
            {currentIndex + 1} / {preferenceQuestions.length}
          </p>

          <div
            style={{
              width: "100%",
              height: "8px",
              background: "#eadfd8",
              borderRadius: "999px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${
                  ((currentIndex + 1) / preferenceQuestions.length) * 100
                }%`,
                height: "100%",
                background: "#ff5a36",
                transition: "width 0.25s ease",
              }}
            />
          </div>
        </div>
      </section>
    </main>
  );
}