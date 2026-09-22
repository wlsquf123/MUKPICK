"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import type {
  Food,
  PreferenceTag,
} from "../../../data/foods";
import FoodImage from "../../../components/FoodImage";

interface RoomData {
  roomId: string;
  shareToken: string;
  status: "voting" | "tiebreak" | "finished";
  preferenceAnswers: string[];
  candidateFoods: Food[];
  finalFoodId: string | null;
}

interface DifferenceAxis {
  title: string;
  description: string;
  left: PreferenceTag;
  right: PreferenceTag;
}

const differenceAxes: DifferenceAxis[] = [
  {
    title: "지금 더 당기는 맛은?",
    description: "마지막으로 맛의 방향을 골라볼까요?",
    left: "spicy",
    right: "mild",
  },
  {
    title: "어떤 온도가 더 끌려?",
    description: "뜨끈한 메뉴와 시원한 메뉴 중 골라봐요.",
    left: "hot",
    right: "cold",
  },
  {
    title: "국물이 있는 게 좋아?",
    description: "국물 유무로 마지막 결정을 해볼까요?",
    left: "broth",
    right: "no-broth",
  },
  {
    title: "오늘은 얼마나 먹고 싶어?",
    description: "든든한 한 끼와 가벼운 한 끼 중 골라봐요.",
    left: "filling",
    right: "light",
  },
  {
    title: "어떤 느낌이 더 끌려?",
    description: "익숙한 맛과 새로운 맛 중 마지막 선택!",
    left: "familiar",
    right: "adventurous",
  },
];

const tagLabels: Record<PreferenceTag, string> = {
  spicy: "🌶️ 매콤",
  mild: "🙂 순한 맛",
  hot: "🔥 뜨끈",
  cold: "❄️ 시원",
  broth: "🍲 국물",
  "no-broth": "🥢 국물 없이",
  filling: "🍚 든든",
  light: "🥗 가볍게",
  familiar: "🏠 익숙한 맛",
  adventurous: "✨ 새로운 맛",
};

export default function TieBreakPage() {
  const params = useParams<{ shareToken: string }>();
  const shareToken = params.shareToken;

  const [room, setRoom] =
    useState<RoomData | null>(null);

  const [selectedFoodId, setSelectedFoodId] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(
          `/api/rooms/${shareToken}`,
          {
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "방 정보를 불러오지 못했습니다."
          );
        }

        setRoom(data);
      } catch (error) {
        console.error(error);

        setError(
          "동점 후보 정보를 불러오지 못했어요."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (shareToken) {
      fetchRoom();
    }
  }, [shareToken]);

  const getDifferenceAxis = (
    foods: Food[]
  ) => {
    if (foods.length < 2) {
      return null;
    }

    const first = foods[0];
    const second = foods[1];

    return (
      differenceAxes.find((axis) => {
        const firstLeft =
          first.tags.includes(axis.left);

        const firstRight =
          first.tags.includes(axis.right);

        const secondLeft =
          second.tags.includes(axis.left);

        const secondRight =
          second.tags.includes(axis.right);

        return (
          (firstLeft && secondRight) ||
          (firstRight && secondLeft)
        );
      }) ?? null
    );
  };

  const getFoodAxisTag = (
    food: Food,
    axis: DifferenceAxis | null
  ) => {
    if (!axis) {
      return null;
    }

    if (food.tags.includes(axis.left)) {
      return axis.left;
    }

    if (food.tags.includes(axis.right)) {
      return axis.right;
    }

    return null;
  };

  const handleSubmit = async () => {
    if (!selectedFoodId) {
      setError(
        "마지막으로 하나를 선택해주세요."
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const voterToken =
        localStorage.getItem(
          "mukpickVoterToken"
        );

      if (!voterToken) {
        throw new Error(
          "호스트 정보를 찾을 수 없습니다."
        );
      }

      const response = await fetch(
        `/api/rooms/${shareToken}/tiebreak`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            foodId: selectedFoodId,
            voterToken,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "최종 메뉴 결정에 실패했습니다."
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
          "최종 메뉴를 결정하는 중 오류가 발생했습니다."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
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
          textAlign: "center",
        }}
      >
        동점 후보를 확인하는 중...
      </main>
    );
  }

  if (error && !room) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          background: "#fff9f4",
          color: "#c0392b",
          textAlign: "center",
        }}
      >
        {error}
      </main>
    );
  }

  if (
    !room ||
    room.candidateFoods.length < 2
  ) {
    return null;
  }

  const differenceAxis =
    getDifferenceAxis(
      room.candidateFoods
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
          TIE BREAK
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
          딱 동점이에요!
        </p>

        <h1
          style={{
            fontSize:
              "clamp(30px, 6vw, 42px)",
            lineHeight: 1.25,
            margin: "10px 0 14px",
          }}
        >
          {differenceAxis
            ? differenceAxis.title
            : "마지막으로 하나만 골라줘!"}
        </h1>

        <p
          style={{
            color: "#746964",
            lineHeight: 1.6,
            marginBottom: "40px",
          }}
        >
          {differenceAxis
            ? differenceAxis.description
            : "두 메뉴 중 지금 더 끌리는 메뉴를 골라주세요."}
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
          {room.candidateFoods.map(
            (food) => {
              const isSelected =
                selectedFoodId === food.id;

              const axisTag =
                getFoodAxisTag(
                  food,
                  differenceAxis
                );

              return (
                <article
                  key={food.id}
                  onClick={() => {
                    if (!isSubmitting) {
                      setSelectedFoodId(
                        food.id
                      );
                      setError("");
                    }
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    minWidth: 0,
                    background: "#fffdfb",
                    border: isSelected
                      ? "2px solid #ff5a36"
                      : "1px solid #eadfd8",
                    borderRadius: "24px",
                    padding:
                      "clamp(20px, 4vw, 30px)",
                    textAlign: "left",
                    boxSizing: "border-box",
                    overflow: "hidden",
                    cursor: isSubmitting
                      ? "not-allowed"
                      : "pointer",
                    transition:
                      "transform 0.15s ease, border 0.15s ease",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "4 / 3",
                      maxHeight: "270px",
                      borderRadius: "18px",
                      background: "#f5ebe5",
                      overflow: "hidden",
                      marginBottom: "22px",
                    }}
                  >
                    <FoodImage
                      food={food}
                    />
                  </div>

                  <p
                    style={{
                      color: "#ff5a36",
                      fontWeight: 700,
                      margin: 0,
                    }}
                  >
                    {food.category}
                  </p>

                  <h2
                    style={{
                      fontSize:
                        "clamp(25px, 5vw, 30px)",
                      margin: "8px 0 12px",
                    }}
                  >
                    {food.name}
                  </h2>

                  <p
                    style={{
                      color: "#746964",
                      lineHeight: 1.6,
                    }}
                  >
                    {food.description}
                  </p>

                  <div
                    style={{
                      marginTop: "auto",
                      paddingTop: "20px",
                    }}
                  >
                    {axisTag && (
                      <div
                        style={{
                          padding: "14px 16px",
                          background: "#fff7f2",
                          borderRadius: "14px",
                          color: "#ff5a36",
                          fontWeight: 700,
                          textAlign: "center",
                        }}
                      >
                        {tagLabels[axisTag]}
                      </div>
                    )}
                  
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={(event) => {
                        event.stopPropagation();
                      
                        setSelectedFoodId(food.id);
                        setError("");
                      }}
                      style={{
                        width: "100%",
                        marginTop: "16px",
                        padding: "16px",
                        border: 0,
                        borderRadius: "14px",
                        background: isSelected
                          ? "#2b211d"
                          : "#ff5a36",
                        color: "white",
                        fontSize: "16px",
                        fontWeight: 700,
                        cursor: isSubmitting
                          ? "not-allowed"
                          : "pointer",
                        opacity: isSubmitting ? 0.6 : 1,
                      }}
                    >
                      {isSelected
                        ? "이 메뉴로 선택"
                        : "이쪽이 더 끌려"}
                    </button>
                  </div>
                                  </article>
                                );
                              }
                            )}
                          </div>

        {selectedFoodId && (
          <div
            style={{
              marginTop: "32px",
            }}
          >
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
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
                cursor: isSubmitting
                  ? "not-allowed"
                  : "pointer",
                opacity: isSubmitting
                  ? 0.6
                  : 1,
              }}
            >
              {isSubmitting
                ? "최종 결정 중..."
                : "이 메뉴로 최종 결정"}
            </button>
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
      </section>
    </main>
  );
}