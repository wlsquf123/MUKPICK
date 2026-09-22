"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import FoodImage from "../../components/FoodImage";
import SiteHeader from "../../components/SiteHeader";
import type { Food, PreferenceTag } from "../../data/foods";

const tagLabels: Record<PreferenceTag, string> = {
  spicy: "매콤",
  mild: "순한 맛",
  hot: "뜨끈",
  cold: "시원",
  broth: "국물",
  "no-broth": "국물 없이",
  filling: "든든",
  light: "가볍게",
  familiar: "익숙한 맛",
  adventurous: "새로운 맛",
};

const tagEmojis: Record<PreferenceTag, string> = {
  spicy: "🌶️",
  mild: "🙂",
  hot: "🔥",
  cold: "❄️",
  broth: "🍲",
  "no-broth": "🥢",
  filling: "🍚",
  light: "🥗",
  familiar: "🏠",
  adventurous: "✨",
};

export default function ResultPage() {
  const router = useRouter();

  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedTags, setSelectedTags] = useState<PreferenceTag[]>([]);
  const [selectedFoodId, setSelectedFoodId] =
    useState<string | null>(null);

  const [isCreatingRoom, setIsCreatingRoom] =
    useState(false);

  const [isRerolling, setIsRerolling] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const savedRecommendations =
      sessionStorage.getItem("recommendations");

    const savedTags =
      sessionStorage.getItem("selectedTags");

    if (!savedRecommendations || !savedTags) {
      router.push("/preference");
      return;
    }

    const parsedFoods: Food[] =
      JSON.parse(savedRecommendations);

    const parsedTags: PreferenceTag[] =
      JSON.parse(savedTags);

    setFoods(parsedFoods);
    setSelectedTags(parsedTags);

    const savedSelectedFood =
      sessionStorage.getItem("selectedFood");

    if (savedSelectedFood) {
      const selectedFood: Food =
        JSON.parse(savedSelectedFood);

      const isCurrentCandidate =
        parsedFoods.some(
          (food) =>
            food.id === selectedFood.id
        );

      if (isCurrentCandidate) {
        setSelectedFoodId(
          selectedFood.id
        );
      } else {
        sessionStorage.removeItem(
          "selectedFood"
        );
      }
    }
  }, [router]);

  const handleSelectFood = (
    food: Food
  ) => {
    setSelectedFoodId(food.id);

    sessionStorage.setItem(
      "selectedFood",
      JSON.stringify(food)
    );

    setError("");
  };

  const handleReroll =
    async () => {
      try {
        setIsRerolling(true);
        setError("");

        if (selectedTags.length === 0) {
          throw new Error(
            "취향 정보를 찾을 수 없습니다."
          );
        }

        const response =
          await fetch(
            "/api/recommendations",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                selectedTags,

                excludeFoodIds:
                  foods.map(
                    (food) =>
                      food.id
                  ),
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "새로운 추천을 불러오지 못했습니다."
          );
        }

        if (
          !data.recommendations ||
          data.recommendations.length < 2
        ) {
          throw new Error(
            "새로운 후보를 충분히 찾지 못했습니다."
          );
        }

        const newFoods: Food[] =
          data.recommendations;

        setFoods(newFoods);
        setSelectedFoodId(null);

        sessionStorage.setItem(
          "recommendations",
          JSON.stringify(newFoods)
        );

        sessionStorage.removeItem(
          "selectedFood"
        );
      } catch (error) {
        console.error(error);

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(
            "새로운 메뉴를 추천하는 중 오류가 발생했습니다."
          );
        }
      } finally {
        setIsRerolling(false);
      }
    };

  const getVoterToken = () => {
    let voterToken =
      localStorage.getItem(
        "mukpickVoterToken"
      );

    if (!voterToken) {
      voterToken =
        crypto.randomUUID();

      localStorage.setItem(
        "mukpickVoterToken",
        voterToken
      );
    }

    return voterToken;
  };

  const handleCreateRoom =
    async () => {
      if (!selectedFoodId) {
        return;
      }

      try {
        setIsCreatingRoom(true);
        setError("");

        if (selectedTags.length === 0) {
          throw new Error(
            "취향 정보가 없습니다."
          );
        }

        const voterToken =
          getVoterToken();

        const response =
          await fetch(
            "/api/rooms",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                candidateFoodIds:
                  foods.map(
                    (food) =>
                      food.id
                  ),

                preferenceAnswers:
                  selectedTags,

                hostFoodId:
                  selectedFoodId,

                voterToken,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "방 생성에 실패했습니다."
          );
        }

        sessionStorage.setItem(
          "shareToken",
          data.shareToken
        );

        router.push(
          `/share/${data.shareToken}`
        );
      } catch (error) {
        console.error(error);

        setError(
          "같이 결정하기 방을 만들지 못했어요. 다시 시도해주세요."
        );

        setIsCreatingRoom(false);
      }
    };

  if (foods.length < 2) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#fff9f4",
        }}
      >
        추천 결과를 불러오는 중...
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#fff9f4",
        color: "#201a17",
        padding: "32px 16px 60px",
        fontFamily:
          "Arial, sans-serif",
      }}
    >
      <SiteHeader label="추천 결과" />

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
          여기까지 좁혀졌어요
        </p>

        <h1
          style={{
            fontSize:
              "clamp(30px, 6vw, 42px)",
            lineHeight: 1.25,
            marginBottom: "12px",
          }}
        >
          이 둘 중에 뭐가 더 끌려?
        </h1>

        <p
          style={{
            color: "#746964",
            lineHeight: 1.6,
            marginBottom: "40px",
          }}
        >
          선택한 취향을 기준으로 잘 맞는
          메뉴를 골라봤어요.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
            width: "100%",
            alignItems: "stretch",
          }}
        >
          {foods.map((food) => {
            const isSelected =
              selectedFoodId ===
              food.id;

            const matchedTags =
              selectedTags.filter(
                (tag) =>
                  food.tags.includes(
                    tag
                  )
              );

            return (
              <article
                key={food.id}
                style={{
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  background: "#fffdfb",

                  border: isSelected
                    ? "2px solid #ff5a36"
                    : "1px solid #eadfd8",

                  borderRadius: "24px",

                  padding:
                    "clamp(20px, 4vw, 32px)",

                  textAlign: "left",
                  overflow: "hidden",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "4 / 3",
                    maxHeight: "280px",
                    borderRadius: "18px",
                    background: "#f5ebe5",
                    overflow: "hidden",
                    marginBottom: "24px",
                    flexShrink: 0,
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
                    margin:
                      "8px 0 12px",
                  }}
                >
                  {food.name}
                </h2>

                <p
                  style={{
                    color: "#746964",
                    minHeight: "48px",
                    lineHeight: 1.6,
                    margin: "0 0 20px",
                  }}
                >
                  {food.description}
                </p>

                <div
                  style={{
                    padding: "18px",
                    background: "#fff7f2",
                    borderRadius: "16px",
                    minHeight: "180px",
                    boxSizing: "border-box",
                  }}
                >
                  <p
                    style={{
                      margin:
                        "0 0 12px",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#ff5a36",
                    }}
                  >
                    먹픽 추천 이유
                  </p>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    {matchedTags.map(
                      (tag) => (
                        <span
                          key={tag}
                          style={{
                            padding:
                              "7px 10px",
                            borderRadius:
                              "999px",
                            background:
                              "#ffffff",
                            border:
                              "1px solid #f0d9cc",
                            fontSize: "13px",
                            color: "#5f514b",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {tagEmojis[tag]}{" "}
                          {tagLabels[tag]}
                        </span>
                      )
                    )}
                  </div>

                  <p
                    style={{
                      margin: "14px 0 0",
                      color: "#746964",
                      fontSize: "14px",
                    }}
                  >
                    내가 고른 취향과{" "}
                    <strong
                      style={{
                        color: "#ff5a36",
                      }}
                    >
                      {matchedTags.length}개
                    </strong>
                    가 일치해요.
                  </p>
                </div>

                <div
                  style={{
                    marginTop: "auto",
                    paddingTop: "20px",
                  }}
                >
                  <button
                    onClick={() =>
                      handleSelectFood(
                        food
                      )
                    }
                    disabled={
                      isRerolling
                    }
                    style={{
                      width: "100%",
                      padding: "16px",
                      border: 0,
                      borderRadius: "14px",

                      background:
                        isSelected
                          ? "#2b211d"
                          : "#ff5a36",

                      color: "white",
                      fontSize: "16px",
                      fontWeight: 700,

                      cursor:
                        isRerolling
                          ? "not-allowed"
                          : "pointer",

                      opacity:
                        isRerolling
                          ? 0.6
                          : 1,
                    }}
                  >
                    {isSelected
                      ? "내 선택 완료"
                      : "이걸로 할래"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <div
          style={{
            marginTop: "28px",
          }}
        >
          <p
            style={{
              color: "#746964",
              fontSize: "14px",
              marginBottom: "12px",
            }}
          >
            둘 다 지금은 안 끌리나요?
          </p>

          <button
            onClick={handleReroll}
            disabled={
              isRerolling ||
              isCreatingRoom
            }
            style={{
              width: "min(100%, 320px)",
              padding: "14px 28px",
              border:
                "1px solid #eadfd8",
              borderRadius: "14px",
              background: "#fffdfb",
              color: "#2b211d",
              fontSize: "15px",
              fontWeight: 700,

              cursor:
                isRerolling ||
                isCreatingRoom
                  ? "not-allowed"
                  : "pointer",

              opacity:
                isRerolling ||
                isCreatingRoom
                  ? 0.6
                  : 1,
            }}
          >
            {isRerolling
              ? "새 메뉴 찾는 중..."
              : "↻ 다른 메뉴 추천받기"}
          </button>
        </div>

        {selectedFoodId && (
          <div
            style={{
              marginTop: "28px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <button
              onClick={handleCreateRoom}
              disabled={
                isCreatingRoom ||
                isRerolling
              }
              style={{
                width: "min(100%, 320px)",
                padding: "17px 40px",
                border: 0,
                borderRadius: "14px",
                background: "#ff5a36",
                color: "white",
                fontSize: "17px",
                fontWeight: 700,

                cursor:
                  isCreatingRoom ||
                  isRerolling
                    ? "not-allowed"
                    : "pointer",

                opacity:
                  isCreatingRoom ||
                  isRerolling
                    ? 0.6
                    : 1,
              }}
            >
              {isCreatingRoom
                ? "방 만드는 중..."
                : "같이 결정하기"}
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