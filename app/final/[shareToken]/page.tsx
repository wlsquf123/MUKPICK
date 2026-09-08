"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getFoodImageUrl } from "../../../lib/foodImage";

import type { Food } from "../../../data/foods";

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

export default function FinalPage() {
  const params = useParams<{ shareToken: string }>();
  const shareToken = params.shareToken;

  const [data, setData] = useState<ResultsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
              "최종 결과를 불러오지 못했습니다."
          );
        }

        setData(result);
      } catch (error) {
        console.error(error);
        setError("최종 결과를 불러오지 못했어요.");
      } finally {
        setIsLoading(false);
      }
    };

    if (shareToken) {
      fetchResults();
    }
  }, [shareToken]);

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
        최종 메뉴를 확인하는 중...
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
          background: "#fff9f4",
          color: "#c0392b",
        }}
      >
        {error || "최종 결과가 없습니다."}
      </main>
    );
  }

  const winnerFoodId =
    data.finalFoodId ?? data.leadingFoodId;

  const winner = data.results.find(
    (item) => item.foodId === winnerFoodId
  );

  if (!winner || !winner.food) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#fff9f4",
          color: "#746964",
        }}
      >
        아직 최종 메뉴가 결정되지 않았어요.
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
          margin: "0 auto 60px",
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
          FINAL DECISION
        </span>
      </header>

      <section
        style={{
          maxWidth: "760px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: "#ff5a36",
            fontWeight: 700,
            marginBottom: "12px",
          }}
        >
          오늘의 메뉴 결정 완료!
        </p>

        <h1
          style={{
            fontSize: "44px",
            margin: "0 0 14px",
          }}
        >
          오늘은 {winner.food.name} 어때요?
        </h1>

        <p
          style={{
            color: "#746964",
            marginBottom: "40px",
          }}
        >
          고민 끝! 이제 맛있게 먹으러 가면 돼요.
        </p>

        <article
          style={{
            background: "#fffdfb",
            border: "2px solid #ff5a36",
            borderRadius: "28px",
            padding: "36px",
            textAlign: "left",
          }}
        >
          <div
              style={{
                height: "300px",
                background: "#f5ebe5",
                borderRadius: "20px",
                overflow: "hidden",
                marginBottom: "28px",
              }}
            >
              <img
                src={getFoodImageUrl(winner.food)}
                alt={winner.food.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>

          <p
            style={{
              color: "#ff5a36",
              fontWeight: 700,
              margin: 0,
            }}
          >
            {winner.food.category}
          </p>

          <h2
            style={{
              fontSize: "36px",
              margin: "8px 0 14px",
            }}
          >
            {winner.food.name}
          </h2>

          <p
            style={{
              color: "#746964",
              lineHeight: 1.7,
            }}
          >
            {winner.food.description}
          </p>

          <div
            style={{
              marginTop: "28px",
              paddingTop: "22px",
              borderTop: "1px solid #eadfd8",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                color: "#746964",
              }}
            >
              최종 투표
            </span>

            <strong
              style={{
                fontSize: "24px",
                color: "#ff5a36",
              }}
            >
              {winner.voteCount}표
            </strong>
          </div>
        </article>

        <div
          style={{
            marginTop: "28px",
            display: "flex",
            justifyContent: "center",
            gap: "12px",
          }}
        >
          <button
            onClick={() => {
              window.location.href = "/";
            }}
            style={{
              padding: "16px 30px",
              border: "1px solid #eadfd8",
              borderRadius: "14px",
              background: "#fffdfb",
              color: "#201a17",
              fontSize: "16px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            처음으로
          </button>

          <button
            onClick={() => {
              window.location.href = "/preference";
            }}
            style={{
              padding: "16px 30px",
              border: 0,
              borderRadius: "14px",
              background: "#ff5a36",
              color: "white",
              fontSize: "16px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            다시 추천받기
          </button>
        </div>
      </section>
    </main>
  );
}