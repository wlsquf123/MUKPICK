"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import type { Food } from "../../data/foods";
import FoodImage from "../../components/FoodImage";

interface PickHistoryItem {
  id: string;
  shareToken: string;
  foodId: string;
  foodName: string;
  decidedAt: string;
  food: Food | null;
}

interface PickHistoryData {
  username: string;
  count: number;
  histories: PickHistoryItem[];
}

export default function MyPickPage() {
  const router = useRouter();
  const { status } = useSession();

  const [data, setData] =
    useState<PickHistoryData | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    if (status !== "authenticated") {
      return;
    }

    const fetchHistories = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(
          "/api/pick-history",
          {
            cache: "no-store",
          }
        );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "먹픽 기록을 불러오지 못했습니다."
          );
        }

        setData(result);
      } catch (error) {
        console.error(
          "먹픽 기록 조회 오류:",
          error
        );

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(
            "먹픽 기록을 불러오는 중 오류가 발생했습니다."
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistories();
  }, [status, router]);

  const formatDate = (
    dateString: string
  ) => {
    const date = new Date(dateString);

    return new Intl.DateTimeFormat(
      "ko-KR",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    ).format(date);
  };

  const openNaverMap = (
    foodName: string
  ) => {
    const query =
      encodeURIComponent(foodName);

    window.open(
      `https://map.naver.com/p/search/${query}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleDelete = async (
    history: PickHistoryItem
  ) => {
    if (deletingId) {
      return;
    }

    const confirmed =
      window.confirm(
        `"${history.foodName}" 먹픽 기록을 삭제할까요?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(history.id);
      setError("");

      const response = await fetch(
        "/api/pick-history",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            historyId: history.id,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "먹픽 기록을 삭제하지 못했습니다."
        );
      }

      setData((prev) => {
        if (!prev) {
          return prev;
        }

        const newHistories =
          prev.histories.filter(
            (item) =>
              item.id !== history.id
          );

        return {
          ...prev,
          histories: newHistories,
          count: newHistories.length,
        };
      });
    } catch (error) {
      console.error(
        "먹픽 기록 삭제 오류:",
        error
      );

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "먹픽 기록을 삭제하는 중 오류가 발생했습니다."
        );
      }
    } finally {
      setDeletingId(null);
    }
  };

  if (
    status === "loading" ||
    isLoading
  ) {
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
        내 먹픽 기록을 불러오는 중...
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
          padding: "24px 16px",
          background: "#fff9f4",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <section
          style={{
            width: "100%",
            maxWidth: "480px",
            padding: "32px",
            background: "#fffdfb",
            border: "1px solid #eadfd8",
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
            😵
          </div>

          <h1
            style={{
              margin: "0 0 12px",
              fontSize: "28px",
            }}
          >
            기록을 불러오지 못했어요
          </h1>

          <p
            style={{
              margin: "0 0 24px",
              color: "#746964",
            }}
          >
            {error}
          </p>

          <button
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

  if (!data) {
    return null;
  }

  /*
    카테고리 통계
  */
  const categoryCounts =
    data.histories.reduce<
      Record<string, number>
    >((counts, history) => {
      const category =
        history.food?.category;

      if (!category) {
        return counts;
      }

      counts[category] =
        (counts[category] ?? 0) + 1;

      return counts;
    }, {});

  const categoryEntries =
    Object.entries(categoryCounts);

  const favoriteCategory =
    categoryEntries.length > 0
      ? [...categoryEntries].sort(
          (a, b) => b[1] - a[1]
        )[0][0]
      : "-";

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
            border: "1px solid #eadfd8",
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
          maxWidth: "1000px",
          margin: "0 auto",
          paddingTop:
            "clamp(55px, 9vw, 90px)",
        }}
      >
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
            MY MUKPICK
          </p>

          <h1
            style={{
              margin: "0 0 14px",
              fontSize:
                "clamp(32px, 7vw, 46px)",
              lineHeight: 1.2,
            }}
          >
            {data.username}님의 먹픽
          </h1>

          <p
            style={{
              margin: 0,
              color: "#746964",
              lineHeight: 1.7,
            }}
          >
            지금까지 결정한 메뉴와
            나의 먹픽 통계를 확인해보세요.
          </p>
        </div>

        {/* 통계 */}
        {data.histories.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
              maxWidth: "680px",
              margin: "0 auto 42px",
            }}
          >
            {/* 총 먹픽 */}
            <div
              style={{
                padding: "24px",
                background: "#fffdfb",
                border: "1px solid #eadfd8",
                borderRadius: "20px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "32px",
                  marginBottom: "10px",
                }}
              >
                🍽️
              </div>

              <p
                style={{
                  margin: "0 0 6px",
                  color: "#746964",
                  fontSize: "13px",
                }}
              >
                총 먹픽
              </p>

              <strong
                style={{
                  fontSize: "28px",
                  color: "#ff5a36",
                }}
              >
                {data.count}회
              </strong>
            </div>

            {/* 자주 고른 카테고리 */}
            <div
              style={{
                padding: "24px",
                background: "#fffdfb",
                border: "1px solid #eadfd8",
                borderRadius: "20px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "32px",
                  marginBottom: "10px",
                }}
              >
                🏆
              </div>

              <p
                style={{
                  margin: "0 0 6px",
                  color: "#746964",
                  fontSize: "13px",
                }}
              >
                자주 고른 카테고리
              </p>

              <strong
                style={{
                  fontSize: "24px",
                  color: "#ff5a36",
                  wordBreak: "keep-all",
                }}
              >
                {favoriteCategory}
              </strong>
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              maxWidth: "600px",
              margin: "0 auto 24px",
              padding: "14px 16px",
              background: "#fff0ed",
              border: "1px solid #ffd4ca",
              borderRadius: "14px",
              color: "#c0392b",
              textAlign: "center",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        {data.histories.length === 0 ? (
          <div
            style={{
              width: "100%",
              maxWidth: "560px",
              margin: "0 auto",
              padding:
                "clamp(30px, 7vw, 50px)",
              background: "#fffdfb",
              border: "1px solid #eadfd8",
              borderRadius: "26px",
              textAlign: "center",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                fontSize: "58px",
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
              아직 저장된 먹픽이 없어요
            </h2>

            <p
              style={{
                margin: "0 0 28px",
                color: "#746964",
                lineHeight: 1.7,
              }}
            >
              메뉴를 결정하면 여기에
              기록과 통계가 쌓여요.
            </p>

            <button
              onClick={() =>
                router.push("/preference")
              }
              style={{
                width: "min(100%, 300px)",
                padding: "16px 24px",
                border: 0,
                borderRadius: "14px",
                background: "#ff5a36",
                color: "white",
                fontSize: "16px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              첫 먹픽 시작하기
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "22px",
            }}
          >
            {data.histories.map(
              (history) => {
                const isDeleting =
                  deletingId === history.id;

                return (
                  <article
                    key={history.id}
                    style={{
                      minWidth: 0,
                      display: "flex",
                      flexDirection: "column",
                      background: "#fffdfb",
                      border:
                        "1px solid #eadfd8",
                      borderRadius: "24px",
                      padding:
                        "clamp(20px, 4vw, 26px)",
                      boxSizing: "border-box",
                      overflow: "hidden",
                      opacity: isDeleting
                        ? 0.6
                        : 1,
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        aspectRatio: "4 / 3",
                        maxHeight: "250px",
                        background: "#f5ebe5",
                        borderRadius: "18px",
                        overflow: "hidden",
                        marginBottom: "20px",
                      }}
                    >
                      {history.food ? (
                        <FoodImage
                          food={history.food}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "grid",
                            placeItems: "center",
                            fontSize: "56px",
                          }}
                        >
                          🍽️
                        </div>
                      )}
                    </div>

                    <p
                      style={{
                        margin: "0 0 8px",
                        color: "#ff5a36",
                        fontSize: "13px",
                        fontWeight: 700,
                      }}
                    >
                      {formatDate(
                        history.decidedAt
                      )}
                    </p>

                    <h2
                      style={{
                        margin: "0 0 10px",
                        fontSize: "28px",
                      }}
                    >
                      {history.foodName}
                    </h2>

                    {history.food && (
                      <p
                        style={{
                          margin: 0,
                          color: "#746964",
                          lineHeight: 1.6,
                          wordBreak: "keep-all",
                        }}
                      >
                        {
                          history.food
                            .description
                        }
                      </p>
                    )}

                    <div
                      style={{
                        marginTop: "auto",
                        paddingTop: "24px",
                        display: "grid",
                        gap: "10px",
                      }}
                    >
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() =>
                          router.push(
                            `/final/${history.shareToken}`
                          )
                        }
                        style={{
                          width: "100%",
                          padding: "14px",
                          border:
                            "1px solid #eadfd8",
                          borderRadius: "13px",
                          background: "#fffdfb",
                          color: "#201a17",
                          fontSize: "14px",
                          fontWeight: 700,
                          cursor: isDeleting
                            ? "not-allowed"
                            : "pointer",
                        }}
                      >
                        이 먹픽 다시 보기
                      </button>

                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() =>
                          openNaverMap(
                            history.foodName
                          )
                        }
                        style={{
                          width: "100%",
                          padding: "14px",
                          border: 0,
                          borderRadius: "13px",
                          background: "#03c75a",
                          color: "white",
                          fontSize: "14px",
                          fontWeight: 700,
                          cursor: isDeleting
                            ? "not-allowed"
                            : "pointer",
                        }}
                      >
                        📍 네이버지도에서 찾기
                      </button>

                      <button
                        type="button"
                        disabled={Boolean(
                          deletingId
                        )}
                        onClick={() =>
                          handleDelete(history)
                        }
                        style={{
                          width: "100%",
                          padding: "13px",
                          border:
                            "1px solid #e7c8c2",
                          borderRadius: "13px",
                          background: "#fff7f5",
                          color: "#b54835",
                          fontSize: "14px",
                          fontWeight: 700,
                          cursor: deletingId
                            ? "not-allowed"
                            : "pointer",
                        }}
                      >
                        {isDeleting
                          ? "삭제하는 중..."
                          : "🗑️ 기록 삭제"}
                      </button>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}

        {data.histories.length > 0 && (
          <div
            style={{
              marginTop: "36px",
              textAlign: "center",
            }}
          >
            <button
              type="button"
              onClick={() =>
                router.push("/preference")
              }
              style={{
                width:
                  "min(100%, 320px)",
                padding: "17px 24px",
                border: 0,
                borderRadius: "14px",
                background: "#ff5a36",
                color: "white",
                fontSize: "16px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              새로운 메뉴 추천받기
            </button>
          </div>
        )}
      </section>
    </main>
  );
}