"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import type { Food, PreferenceTag } from "../../data/foods";
import FoodImage from "../../components/FoodImage";

export default function ResultPage() {
  const router = useRouter();

  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedRecommendations =
      sessionStorage.getItem("recommendations");

    if (!savedRecommendations) {
      router.push("/preference");
      return;
    }

    const parsedFoods: Food[] = JSON.parse(savedRecommendations);

    setFoods(parsedFoods);

    const savedSelectedFood =
      sessionStorage.getItem("selectedFood");

    if (savedSelectedFood) {
      const selectedFood: Food = JSON.parse(savedSelectedFood);

      const isCurrentCandidate = parsedFoods.some(
        (food) => food.id === selectedFood.id
      );

      if (isCurrentCandidate) {
        setSelectedFoodId(selectedFood.id);
      } else {
        sessionStorage.removeItem("selectedFood");
      }
    }
  }, [router]);

  const handleSelectFood = (food: Food) => {
    setSelectedFoodId(food.id);

    sessionStorage.setItem(
      "selectedFood",
      JSON.stringify(food)
    );

    setError("");
  };

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

  const handleCreateRoom = async () => {
    if (!selectedFoodId) {
      return;
    }

    try {
      setIsCreatingRoom(true);
      setError("");

      const savedTags =
        sessionStorage.getItem("selectedTags");

      if (!savedTags) {
        throw new Error("취향 정보가 없습니다.");
      }

      const preferenceAnswers: PreferenceTag[] =
        JSON.parse(savedTags);

      const voterToken = getVoterToken();

      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidateFoodIds: foods.map(
            (food) => food.id
          ),
          preferenceAnswers,
          hostFoodId: selectedFoodId,
          voterToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "방 생성에 실패했습니다."
        );
      }

      sessionStorage.setItem(
        "shareToken",
        data.shareToken
      );

      router.push(`/share/${data.shareToken}`);
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
        padding: "40px 24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          maxWidth: "1100px",
          margin: "0 auto 65px",
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
          오늘 메뉴 같이 고르기
        </span>
      </header>

      <section
        style={{
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
            fontSize: "42px",
            marginBottom: "12px",
          }}
        >
          이 둘 중에 뭐가 더 끌려?
        </h1>

        <p
          style={{
            color: "#746964",
            marginBottom: "40px",
          }}
        >
          먼저 하나 골라보고, 애매하면 친구한테 링크를 보내보세요.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
          }}
        >
          {foods.map((food) => {
            const isSelected =
              selectedFoodId === food.id;

            return (
              <article
                key={food.id}
                style={{
                  background: "#fffdfb",
                  border: isSelected
                    ? "2px solid #ff5a36"
                    : "1px solid #eadfd8",
                  borderRadius: "24px",
                  padding: "32px",
                  textAlign: "left",
                  overflow: "hidden",
                  transition:
                    "border 0.2s ease, transform 0.2s ease",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "240px",
                    borderRadius: "18px",
                    background: "#f5ebe5",
                    overflow: "hidden",
                    marginBottom: "24px",
                  }}
                >
                  <FoodImage food={food} />
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
                    fontSize: "30px",
                    margin: "8px 0 12px",
                  }}
                >
                  {food.name}
                </h2>

                <p
                  style={{
                    color: "#746964",
                    minHeight: "48px",
                    lineHeight: 1.6,
                  }}
                >
                  {food.description}
                </p>

                <button
                  onClick={() =>
                    handleSelectFood(food)
                  }
                  style={{
                    width: "100%",
                    marginTop: "20px",
                    padding: "16px",
                    border: 0,
                    borderRadius: "14px",
                    background: isSelected
                      ? "#2b211d"
                      : "#ff5a36",
                    color: "white",
                    fontSize: "16px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {isSelected
                    ? "내 선택 완료"
                    : "이걸로 할래"}
                </button>
              </article>
            );
          })}
        </div>

        {selectedFoodId && (
          <div
            style={{
              marginTop: "32px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <button
              onClick={handleCreateRoom}
              disabled={isCreatingRoom}
              style={{
                padding: "17px 40px",
                border: 0,
                borderRadius: "14px",
                background: "#ff5a36",
                color: "white",
                fontSize: "17px",
                fontWeight: 700,
                cursor: isCreatingRoom
                  ? "not-allowed"
                  : "pointer",
                opacity: isCreatingRoom
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