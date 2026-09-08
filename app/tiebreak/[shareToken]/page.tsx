"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getFoodImageUrl } from "../../../lib/foodImage";

import type {
  Food,
  PreferenceTag,
} from "../../../data/foods";

interface RoomData {
  roomId: string;
  shareToken: string;
  status: "voting" | "tiebreak" | "finished";
  preferenceAnswers: string[];
  candidateFoods: Food[];
  finalFoodId: string | null;
}

interface TieBreakOption {
  foodId: string;
  label: string;
  description: string;
}

const tagLabels: Record<PreferenceTag, string> = {
  spicy: "매콤한 맛",
  mild: "순한 맛",
  hot: "뜨끈한 메뉴",
  cold: "시원한 메뉴",
  broth: "국물 있는 메뉴",
  "no-broth": "국물 없는 메뉴",
  filling: "든든한 메뉴",
  light: "가벼운 메뉴",
  familiar: "익숙한 맛",
  adventurous: "새로운 맛",
};

const oppositePairs: [PreferenceTag, PreferenceTag][] = [
  ["spicy", "mild"],
  ["hot", "cold"],
  ["broth", "no-broth"],
  ["filling", "light"],
  ["familiar", "adventurous"],
];

function createTieBreakOptions(
  firstFood: Food,
  secondFood: Food
): TieBreakOption[] {
  for (const [firstTag, secondTag] of oppositePairs) {
    const firstHasFirst =
      firstFood.tags.includes(firstTag);

    const firstHasSecond =
      firstFood.tags.includes(secondTag);

    const secondHasFirst =
      secondFood.tags.includes(firstTag);

    const secondHasSecond =
      secondFood.tags.includes(secondTag);

    if (firstHasFirst && secondHasSecond) {
      return [
        {
          foodId: firstFood.id,
          label: tagLabels[firstTag],
          description: `${firstFood.name} 쪽이 더 끌려요`,
        },
        {
          foodId: secondFood.id,
          label: tagLabels[secondTag],
          description: `${secondFood.name} 쪽이 더 끌려요`,
        },
      ];
    }

    if (firstHasSecond && secondHasFirst) {
      return [
        {
          foodId: firstFood.id,
          label: tagLabels[secondTag],
          description: `${firstFood.name} 쪽이 더 끌려요`,
        },
        {
          foodId: secondFood.id,
          label: tagLabels[firstTag],
          description: `${secondFood.name} 쪽이 더 끌려요`,
        },
      ];
    }
  }

  return [
    {
      foodId: firstFood.id,
      label: firstFood.name,
      description: "지금 이 메뉴가 더 끌려요",
    },
    {
      foodId: secondFood.id,
      label: secondFood.name,
      description: "지금 이 메뉴가 더 끌려요",
    },
  ];
}

export default function TieBreakPage() {
  const params =
    useParams<{ shareToken: string }>();

  const shareToken = params.shareToken;

  const [room, setRoom] =
    useState<RoomData | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedFoodId, setSelectedFoodId] =
    useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(
          `/api/rooms/${shareToken}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

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
          "타이브레이크 정보를 불러오지 못했어요."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (shareToken) {
      fetchRoom();
    }
  }, [shareToken]);

  const getVoterToken = () => {
    let voterToken =
      localStorage.getItem("mukpickVoterToken");

    if (!voterToken) {
      voterToken = crypto.randomUUID();

      localStorage.setItem(
        "mukpickVoterToken",
        voterToken
      );
    }

    return voterToken;
  };

  const handleConfirm = async () => {
    if (!selectedFoodId) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const voterToken = getVoterToken();

      const response = await fetch(
        `/api/rooms/${shareToken}/tiebreak`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            foodId: selectedFoodId,
            voterToken,
          }),
        }
      );

      const data = await response.json();

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
          background: "#fff9f4",
        }}
      >
        마지막 질문을 준비하는 중...
      </main>
    );
  }

  if (
    error && !room
  ) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#fff9f4",
          color: "#c0392b",
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

  const [firstFood, secondFood] =
    room.candidateFoods;

  const options = createTieBreakOptions(
    firstFood,
    secondFood
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#fff9f4",
        color: "#201a17",
        padding: "40px 24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          maxWidth: "1100px",
          margin: "0 auto 70px",
          display: "flex",
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
          }}
        >
          TIE BREAK
        </span>
      </header>

      <section
        style={{
          maxWidth: "800px",
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
          딱 동점이에요
        </p>

        <h1
          style={{
            fontSize: "42px",
            margin: "10px 0 14px",
          }}
        >
          마지막으로 하나만 더 골라볼까요?
        </h1>

        <p
          style={{
            color: "#746964",
            marginBottom: "42px",
          }}
        >
          두 메뉴의 차이 중 지금 더 끌리는 쪽을
          선택해주세요.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          {options.map((option) => {
            const food =
              room.candidateFoods.find(
                (item) =>
                  item.id === option.foodId
              );

            const isSelected =
              selectedFoodId === option.foodId;

            return (
              <button
                key={option.foodId}
                onClick={() =>
                  setSelectedFoodId(
                    option.foodId
                  )
                }
                disabled={isSubmitting}
                style={{
                  minHeight: "250px",
                  padding: "30px",
                  border: isSelected
                    ? "2px solid #ff5a36"
                    : "1px solid #eadfd8",
                  borderRadius: "24px",
                  background: isSelected
                    ? "#fff3ed"
                    : "#fffdfb",
                  cursor: isSubmitting
                    ? "not-allowed"
                    : "pointer",
                  textAlign: "center",
                  color: "#201a17",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "180px",
                    borderRadius: "18px",
                    background: "#f5ebe5",
                    overflow: "hidden",
                    marginBottom: "18px",
                  }}
                >
                  {food ? (
                    <img
                      src={getFoodImageUrl(food)}
                      alt={food.name}
                      loading="lazy"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "grid",
                        placeItems: "center",
                        color: "#746964",
                      }}
                    >
                      이미지 없음
                    </div>
                  )}
                </div>

                <strong
                  style={{
                    display: "block",
                    fontSize: "24px",
                    marginBottom: "10px",
                    color: isSelected
                      ? "#ff5a36"
                      : "#201a17",
                  }}
                >
                  {option.label}
                </strong>

                <span
                  style={{
                    color: "#746964",
                    fontSize: "15px",
                  }}
                >
                  {option.description}
                </span>

                <p
                  style={{
                    marginTop: "18px",
                    fontWeight: 700,
                  }}
                >
                  {food?.name}
                </p>
              </button>
            );
          })}
        </div>

        {selectedFoodId && (
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            style={{
              marginTop: "32px",
              padding: "17px 40px",
              border: 0,
              borderRadius: "14px",
              background: "#ff5a36",
              color: "white",
              fontSize: "17px",
              fontWeight: 700,
              cursor: isSubmitting
                ? "not-allowed"
                : "pointer",
              opacity: isSubmitting ? 0.6 : 1,
            }}
          >
            {isSubmitting
              ? "최종 결정 중..."
              : "이 메뉴로 최종 결정"}
          </button>
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