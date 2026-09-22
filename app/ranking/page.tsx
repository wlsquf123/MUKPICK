"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { Food } from "../../data/foods";
import FoodImage from "../../components/FoodImage";

interface RankingItem {
  rank: number;
  foodId: string;
  foodName: string;
  category: string | null;
  pickCount: number;
  food: Food | null;
}

interface RankingData {
  totalPickCount: number;
  rankingCount: number;
  rankings: RankingItem[];
}

export default function RankingPage() {
  const router = useRouter();

  const [data, setData] =
    useState<RankingData | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(
          "/api/rankings",
          {
            cache: "no-store",
          }
        );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "음식 랭킹을 불러오지 못했습니다."
          );
        }

        setData(result);
      } catch (error) {
        console.error(
          "음식 랭킹 조회 오류:",
          error
        );

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(
            "음식 랭킹을 불러오는 중 오류가 발생했습니다."
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankings();
  }, []);

  const getRankEmoji = (
    rank: number
  ) => {
    if (rank === 1) {
      return "🥇";
    }

    if (rank === 2) {
      return "🥈";
    }

    if (rank === 3) {
      return "🥉";
    }

    return "🏅";
  };

  if (isLoading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          background: "#fff9f4",
          color: "#201a17",
        }}
      >
        먹픽 랭킹을 불러오는 중...
      </main>
    );
  }

  if (error || !data) {
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
            maxWidth: "480px",
            padding: "34px",
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
              fontSize: "54px",
              marginBottom: "16px",
            }}
          >
            😵
          </div>

          <h1
            style={{
              margin: "0 0 12px",
              fontSize: "28px",
            }}
          >
            랭킹을 불러오지 못했어요
          </h1>

          <p
            style={{
              margin: "0 0 24px",
              color: "#746964",
              lineHeight: 1.6,
            }}
          >
            {error ||
              "잠시 후 다시 시도해주세요."}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
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
            다시 시도
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
      <header
        style={{
          width: "100%",
          maxWidth: "1000px",
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          gap: "14px",
          justifyContent:
            "space-between",
          alignItems: "center",
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
          maxWidth: "820px",
          margin: "0 auto",
          paddingTop:
            "clamp(55px, 9vw, 90px)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "42px",
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
            MUKPICK RANKING
          </p>

          <h1
            style={{
              margin: "0 0 14px",
              fontSize:
                "clamp(34px, 8vw, 48px)",
              lineHeight: 1.2,
            }}
          >
            🏆 음식 랭킹
          </h1>

          <p
            style={{
              margin: 0,
              color: "#746964",
              lineHeight: 1.7,
              wordBreak: "keep-all",
            }}
          >
            먹픽 회원들이 실제로 최종 선택한
            메뉴를 기준으로 집계한 순위예요.
          </p>

          <div
            style={{
              display: "inline-flex",
              marginTop: "20px",
              padding: "10px 16px",
              background: "#fff7f2",
              border:
                "1px solid #f0d9cc",
              borderRadius: "999px",
              color: "#ff5a36",
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            누적 {data.totalPickCount}픽
          </div>
        </div>

        {data.rankings.length === 0 ? (
          <div
            style={{
              padding:
                "clamp(32px, 7vw, 50px)",
              background: "#fffdfb",
              border:
                "1px solid #eadfd8",
              borderRadius: "26px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "56px",
                marginBottom: "18px",
              }}
            >
              🍽️
            </div>

            <h2
              style={{
                margin: "0 0 12px",
                fontSize: "26px",
              }}
            >
              아직 랭킹 데이터가 없어요
            </h2>

            <p
              style={{
                margin: "0 0 26px",
                color: "#746964",
                lineHeight: 1.7,
              }}
            >
              회원들의 먹픽 기록이 쌓이면
              음식 랭킹이 만들어져요.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/preference"
                )
              }
              style={{
                width:
                  "min(100%, 300px)",
                padding: "16px",
                border: 0,
                borderRadius: "14px",
                background: "#ff5a36",
                color: "white",
                fontSize: "16px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              먹픽 시작하기
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "14px",
            }}
          >
            {data.rankings.map(
              (item) => (
                <article
                  key={item.foodId}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "72px minmax(76px, 110px) 1fr auto",
                    gap: "16px",
                    alignItems: "center",
                    padding: "16px",
                    background: "#fffdfb",
                    border:
                      item.rank <= 3
                        ? "2px solid #ffcf8a"
                        : "1px solid #eadfd8",
                    borderRadius: "20px",
                    boxSizing:
                      "border-box",
                  }}
                >
                  <div
                    style={{
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "30px",
                      }}
                    >
                      {getRankEmoji(
                        item.rank
                      )}
                    </div>

                    <strong
                      style={{
                        display: "block",
                        marginTop: "4px",
                        color:
                          item.rank <= 3
                            ? "#ff5a36"
                            : "#746964",
                        fontSize: "14px",
                      }}
                    >
                      {item.rank}위
                    </strong>
                  </div>

                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      background: "#f5ebe5",
                      borderRadius: "16px",
                      overflow: "hidden",
                    }}
                  >
                    {item.food ? (
                      <FoodImage
                        food={item.food}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "grid",
                          placeItems:
                            "center",
                          fontSize: "36px",
                        }}
                      >
                        🍽️
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      minWidth: 0,
                    }}
                  >
                    {item.category && (
                      <p
                        style={{
                          margin:
                            "0 0 5px",
                          color:
                            "#ff5a36",
                          fontSize:
                            "12px",
                          fontWeight:
                            700,
                        }}
                      >
                        {item.category}
                      </p>
                    )}

                    <h2
                      style={{
                        margin: 0,
                        fontSize:
                          "clamp(20px, 5vw, 26px)",
                        overflow:
                          "hidden",
                        textOverflow:
                          "ellipsis",
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {item.foodName}
                    </h2>
                  </div>

                  <div
                    style={{
                      textAlign: "right",
                      minWidth: "65px",
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        color: "#ff5a36",
                        fontSize: "22px",
                      }}
                    >
                      {item.pickCount}
                    </strong>

                    <span
                      style={{
                        color: "#9a8f89",
                        fontSize: "12px",
                      }}
                    >
                      PICK
                    </span>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </section>
    </main>
  );
}