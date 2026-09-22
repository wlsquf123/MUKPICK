"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import SiteHeader from "../../components/SiteHeader";
import type { PreferenceTag } from "../../data/foods";

interface PreferenceOption {
  label: string;
  emoji: string;
  tag: PreferenceTag;
}

interface PreferenceQuestion {
  title: string;
  description: string;
  options: [
    PreferenceOption,
    PreferenceOption
  ];
}

const questions: PreferenceQuestion[] = [
  {
    title: "지금 더 당기는 맛은?",
    description:
      "오늘 입맛에 더 가까운 쪽을 골라주세요.",
    options: [
      {
        label: "매콤한 맛",
        emoji: "🌶️",
        tag: "spicy",
      },
      {
        label: "순한 맛",
        emoji: "🙂",
        tag: "mild",
      },
    ],
  },
  {
    title: "온도는 어느 쪽이 좋아?",
    description:
      "따뜻한 음식과 시원한 음식 중 골라주세요.",
    options: [
      {
        label: "뜨끈한 음식",
        emoji: "🔥",
        tag: "hot",
      },
      {
        label: "시원한 음식",
        emoji: "❄️",
        tag: "cold",
      },
    ],
  },
  {
    title: "국물은?",
    description:
      "오늘 국물이 당기는지 골라주세요.",
    options: [
      {
        label: "국물 있는 음식",
        emoji: "🍲",
        tag: "broth",
      },
      {
        label: "국물 없는 음식",
        emoji: "🥢",
        tag: "no-broth",
      },
    ],
  },
  {
    title: "오늘은 얼마나 먹고 싶어?",
    description:
      "식사량과 느낌에 가까운 쪽을 골라주세요.",
    options: [
      {
        label: "든든하게",
        emoji: "🍚",
        tag: "filling",
      },
      {
        label: "가볍게",
        emoji: "🥗",
        tag: "light",
      },
    ],
  },
  {
    title: "어떤 느낌이 더 끌려?",
    description:
      "익숙한 메뉴와 새로운 메뉴 중 골라주세요.",
    options: [
      {
        label: "익숙한 맛",
        emoji: "🏠",
        tag: "familiar",
      },
      {
        label: "새로운 맛",
        emoji: "✨",
        tag: "adventurous",
      },
    ],
  },
];

export default function PreferencePage() {
  const router = useRouter();

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [answers, setAnswers] =
    useState<PreferenceTag[]>([]);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const currentQuestion =
    questions[currentIndex];

  const progress =
    ((currentIndex + 1) /
      questions.length) *
    100;

  const handleAnswer = async (
    tag: PreferenceTag
  ) => {
    if (isLoading) {
      return;
    }

    setError("");

    /*
      현재 단계까지의 답변을 새 배열로 생성
    */
    const nextAnswers = [
      ...answers.slice(
        0,
        currentIndex
      ),
      tag,
    ];

    /*
      마지막 질문이 아니면
      다음 질문으로 이동
    */
    if (
      currentIndex <
      questions.length - 1
    ) {
      setAnswers(nextAnswers);

      setCurrentIndex(
        currentIndex + 1
      );

      return;
    }

    /*
      마지막 질문이면 추천 API 호출
    */
    try {
      setIsLoading(true);

      const response = await fetch(
        "/api/recommendations",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            selectedTags:
              nextAnswers,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "추천 메뉴를 불러오지 못했습니다."
        );
      }

      if (
        !data.recommendations ||
        data.recommendations.length < 2
      ) {
        throw new Error(
          "추천 메뉴를 충분히 찾지 못했습니다."
        );
      }

      /*
        Result 페이지에서 사용할 데이터 저장
      */
      sessionStorage.setItem(
        "recommendations",
        JSON.stringify(
          data.recommendations
        )
      );

      sessionStorage.setItem(
        "selectedTags",
        JSON.stringify(
          nextAnswers
        )
      );

      /*
        이전 선택 음식이 남아있으면 제거
      */
      sessionStorage.removeItem(
        "selectedFood"
      );

      router.push("/result");
    } catch (error) {
      console.error(
        "추천 생성 오류:",
        error
      );

      if (
        error instanceof Error
      ) {
        setError(error.message);
      } else {
        setError(
          "추천 메뉴를 만드는 중 오류가 발생했습니다."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    if (
      currentIndex === 0 ||
      isLoading
    ) {
      return;
    }

    setError("");

    setCurrentIndex(
      currentIndex - 1
    );
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#fff9f4",
        color: "#201a17",
        padding:
          "32px 16px 60px",
        fontFamily:
          "Arial, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <SiteHeader label="취향 선택" />

      <section
        style={{
          width: "100%",
          maxWidth: "760px",
          margin: "0 auto",
        }}
      >
        {/* 진행 상황 */}
        <div
          style={{
            marginBottom: "44px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: "16px",
              marginBottom: "12px",
            }}
          >
            <span
              style={{
                color: "#746964",
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              취향 질문
            </span>

            <strong
              style={{
                color: "#ff5a36",
                fontSize: "14px",
              }}
            >
              {currentIndex + 1} /{" "}
              {questions.length}
            </strong>
          </div>

          <div
            style={{
              width: "100%",
              height: "8px",
              overflow: "hidden",
              background: "#eadfd8",
              borderRadius: "999px",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "#ff5a36",
                borderRadius:
                  "999px",
                transition:
                  "width 0.25s ease",
              }}
            />
          </div>
        </div>

        <div
          style={{
            textAlign: "center",
            marginBottom: "36px",
          }}
        >
          <p
            style={{
              margin: "0 0 10px",
              color: "#ff5a36",
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            QUESTION{" "}
            {currentIndex + 1}
          </p>

          <h1
            style={{
              margin: "0 0 12px",
              fontSize:
                "clamp(30px, 7vw, 42px)",
              lineHeight: 1.25,
              wordBreak: "keep-all",
            }}
          >
            {currentQuestion.title}
          </h1>

          <p
            style={{
              margin: 0,
              color: "#746964",
              fontSize:
                "clamp(14px, 3vw, 16px)",
              lineHeight: 1.7,
              wordBreak: "keep-all",
            }}
          >
            {
              currentQuestion.description
            }
          </p>
        </div>

        {/* 선택지 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "18px",
          }}
        >
          {currentQuestion.options.map(
            (option) => (
              <button
                key={option.tag}
                type="button"
                disabled={isLoading}
                onClick={() =>
                  handleAnswer(
                    option.tag
                  )
                }
                style={{
                  minHeight:
                    "clamp(170px, 28vw, 220px)",
                  padding: "28px 20px",
                  border:
                    "1px solid #eadfd8",
                  borderRadius: "24px",
                  background: "#fffdfb",
                  color: "#201a17",
                  cursor: isLoading
                    ? "not-allowed"
                    : "pointer",
                  opacity: isLoading
                    ? 0.6
                    : 1,
                  display: "flex",
                  flexDirection:
                    "column",
                  justifyContent:
                    "center",
                  alignItems: "center",
                  gap: "16px",
                  boxSizing:
                    "border-box",
                }}
              >
                <span
                  style={{
                    fontSize:
                      "clamp(48px, 10vw, 64px)",
                    lineHeight: 1,
                  }}
                >
                  {option.emoji}
                </span>

                <strong
                  style={{
                    fontSize:
                      "clamp(19px, 4vw, 23px)",
                  }}
                >
                  {option.label}
                </strong>

                <span
                  style={{
                    color: "#9a8f89",
                    fontSize: "13px",
                  }}
                >
                  이쪽이 더 끌려요
                </span>
              </button>
            )
          )}
        </div>

        {/* 이전 버튼 */}
        <div
          style={{
            minHeight: "48px",
            marginTop: "28px",
            textAlign: "center",
          }}
        >
          {currentIndex > 0 && (
            <button
              type="button"
              disabled={isLoading}
              onClick={handlePrevious}
              style={{
                padding:
                  "12px 20px",
                border:
                  "1px solid #eadfd8",
                borderRadius:
                  "12px",
                background:
                  "#fffdfb",
                color: "#5f514b",
                fontSize: "14px",
                fontWeight: 700,
                cursor: isLoading
                  ? "not-allowed"
                  : "pointer",
                opacity: isLoading
                  ? 0.6
                  : 1,
              }}
            >
              ← 이전 질문
            </button>
          )}
        </div>

        {isLoading && (
          <p
            style={{
              marginTop: "22px",
              textAlign: "center",
              color: "#ff5a36",
              fontWeight: 700,
            }}
          >
            내 취향에 맞는 메뉴를
            찾는 중...
          </p>
        )}

        {error && (
          <div
            style={{
              maxWidth: "560px",
              margin:
                "22px auto 0",
              padding:
                "14px 16px",
              background:
                "#fff0ed",
              border:
                "1px solid #ffd4ca",
              borderRadius:
                "14px",
              color: "#c0392b",
              textAlign: "center",
              fontSize: "14px",
              lineHeight: 1.6,
            }}
          >
            {error}
          </div>
        )}
      </section>
    </main>
  );
}