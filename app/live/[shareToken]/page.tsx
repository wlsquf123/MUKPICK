"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import type { Food } from "../../../data/foods";
import FoodImage from "../../../components/FoodImage";

interface ResultItem {
  foodId: string;
  food?: Food;
  voteCount: number;
}

interface ResultsData {
  shareToken: string;
  status: "voting" | "tiebreak" | "finished";
  totalVotes: number;
  results: ResultItem[];
  isTie: boolean;
  leadingFoodId: string | null;
  finalFoodId: string | null;
}

export default function LiveResultPage() {
  const params = useParams<{ shareToken: string }>();
  const shareToken = params.shareToken;

  const [data, setData] = useState<ResultsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  useEffect(() => {
    const savedShareToken =
      sessionStorage.getItem("shareToken");

    if (savedShareToken === shareToken) {
      setIsHost(true);
    }

    const fetchResults = async () => {
      try {
        const response = await fetch(
          `/api/rooms/${shareToken}/results`,
          {
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "투표 결과를 불러오지 못했습니다."
          );
        }

        setData(result);
        setError("");
      } catch (error) {
        console.error(error);
        setError("투표 결과를 불러오지 못했어요.");
      } finally {
        setIsLoading(false);
      }
    };

    if (!shareToken) {
      return;
    }

    fetchResults();

    const interval = setInterval(() => {
      fetchResults();
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [shareToken]);

  const handleFinalize = async () => {
    try {
      setIsFinalizing(true);
      setError("");

      const voterToken =
        localStorage.getItem("mukpickVoterToken");

      if (!voterToken) {
        throw new Error(
          "호스트 정보를 찾을 수 없습니다."
        );
      }

      const response = await fetch(
        `/api/rooms/${shareToken}/finalize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            voterToken,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "최종 결과 확정에 실패했습니다."
        );
      }

      window.location.href =
        `/final/${shareToken}`;
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "최종 결과를 확정하는 중 오류가 발생했습니다."
        );
      }
    } finally {
      setIsFinalizing(false);
    }
  };

  if (isLoading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#fff9f4",
          padding: "24px",
          textAlign: "center",
        }}
      >
        투표 결과를 불러오는 중...
      </main>
    );
  }

  if (error && !data) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#fff9f4",
          padding: "24px",
          color: "#c0392b",
          textAlign: "center",
        }}
      >
        {error}
      </main>
    );
  }

  if (!data) {
    return null;
  }

  const maxVotes = Math.max(
    ...data.results.map(
      (item) => item.voteCount
    ),
    1
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#fff9f4",
        color: "#201a17",
        padding: "32px 16px 60px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          width: "100%",
          maxWidth: "1100px",
          margin: "0 auto 60px",
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
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

        <span
          style={{
            color: "#746964",
            fontSize: "14px",
          }}
        >
          실시간 투표 결과
        </span>
      </header>

      <section
        style={{
          width: "100%",
          maxWidth: "900px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: "#ff5a36",
            fontWeight: 700,
          }}
        >
          LIVE RESULT
        </p>

        <h1
          style={{
            fontSize: "clamp(30px, 6vw, 42px)",
            lineHeight: 1.25,
            margin: "10px 0 14px",
          }}
        >
          지금 어디로 마음이 모이고 있을까요?
        </h1>

        <p
          style={{
            color: "#746964",
            lineHeight: 1.6,
            marginBottom: "42px",
          }}
        >
          현재 총{" "}
          <strong
            style={{
              color: "#ff5a36",
            }}
          >
            {data.totalVotes}명
          </strong>
          이 선택했어요.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
            width: "100%",
          }}
        >
          {data.results.map((item) => {
            const percentage =
              (item.voteCount / maxVotes) * 100;

            return (
              <article
                key={item.foodId}
                style={{
                  minWidth: 0,
                  background: "#fffdfb",
                  border: "1px solid #eadfd8",
                  borderRadius: "24px",
                  padding:
                    "clamp(20px, 4vw, 30px)",
                  textAlign: "left",
                  boxSizing: "border-box",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "4 / 3",
                    maxHeight: "260px",
                    borderRadius: "18px",
                    background: "#f5ebe5",
                    overflow: "hidden",
                    marginBottom: "22px",
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
                        placeItems: "center",
                        background: "#f5ebe5",
                        fontSize: "56px",
                      }}
                    >
                      🍽️
                    </div>
                  )}
                </div>

                <p
                  style={{
                    color: "#ff5a36",
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
                  {item.food?.category || "메뉴"}
                </p>

                <h2
                  style={{
                    fontSize:
                      "clamp(25px, 5vw, 30px)",
                    margin: "8px 0 20px",
                  }}
                >
                  {item.food?.name ||
                    item.foodId}
                </h2>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <span
                    style={{
                      color: "#746964",
                    }}
                  >
                    현재 투표
                  </span>

                  <strong
                    style={{
                      fontSize: "24px",
                      color: "#ff5a36",
                    }}
                  >
                    {item.voteCount}표
                  </strong>
                </div>

                <div
                  style={{
                    height: "12px",
                    background: "#eadfd8",
                    borderRadius: "999px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${percentage}%`,
                      height: "100%",
                      background: "#ff5a36",
                      borderRadius: "999px",
                      transition:
                        "width 0.3s ease",
                    }}
                  />
                </div>
              </article>
            );
          })}
        </div>

        {isHost && (
          <div
            style={{
              marginTop: "32px",
            }}
          >
            {data.status === "finished" ? (
              <button
                onClick={() => {
                  window.location.href =
                    `/final/${shareToken}`;
                }}
                style={{
                  width:
                    "min(100%, 320px)",
                  padding: "17px 30px",
                  border: 0,
                  borderRadius: "14px",
                  background: "#2b211d",
                  color: "white",
                  fontSize: "17px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                결정된 메뉴 보기
              </button>
            ) : data.isTie ? (
              <button
                onClick={() => {
                  window.location.href =
                    `/tiebreak/${shareToken}`;
                }}
                style={{
                  width:
                    "min(100%, 320px)",
                  padding: "17px 30px",
                  border: 0,
                  borderRadius: "14px",
                  background: "#ff5a36",
                  color: "white",
                  fontSize: "17px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                동점 풀기
              </button>
            ) : (
              <button
                onClick={handleFinalize}
                disabled={isFinalizing}
                style={{
                  width:
                    "min(100%, 320px)",
                  padding: "17px 30px",
                  border: 0,
                  borderRadius: "14px",
                  background: "#2b211d",
                  color: "white",
                  fontSize: "17px",
                  fontWeight: 700,
                  cursor: isFinalizing
                    ? "not-allowed"
                    : "pointer",
                  opacity: isFinalizing
                    ? 0.6
                    : 1,
                }}
              >
                {isFinalizing
                  ? "최종 결정 중..."
                  : "최종 결과 확인"}
              </button>
            )}
          </div>
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

        <p
          style={{
            marginTop: "28px",
            color: "#9a8f89",
            fontSize: "14px",
          }}
        >
          결과는 약 3초마다 자동으로 갱신돼요.
        </p>
      </section>
    </main>
  );
}