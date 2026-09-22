"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

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

export default function FinalPage() {
  const params = useParams<{ shareToken: string }>();
  const shareToken = params.shareToken;

  const { status: sessionStatus } =
    useSession();

  const [data, setData] =
    useState<ResultsData | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
    같은 화면에서 기록 저장 API가
    반복 호출되는 것을 방지
  */
  const historySaveAttempted =
    useRef(false);

  /*
    최종 결과 조회
  */
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(
          `/api/rooms/${shareToken}/results`,
          {
            cache: "no-store",
          }
        );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "최종 결과를 불러오지 못했습니다."
          );
        }

        setData(result);
      } catch (error) {
        console.error(error);

        setError(
          "최종 결과를 불러오지 못했어요."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (shareToken) {
      fetchResults();
    }
  }, [shareToken]);

  /*
    로그인한 사용자가 Final 페이지에 들어오면
    내 먹픽 기록에 자동 저장
  */
  useEffect(() => {
    if (
      sessionStatus !== "authenticated"
    ) {
      return;
    }

    if (
      !data ||
      data.status !== "finished" ||
      !data.finalFoodId
    ) {
      return;
    }

    if (historySaveAttempted.current) {
      return;
    }

    historySaveAttempted.current = true;

    const savePickHistory = async () => {
      try {
        const response = await fetch(
          "/api/pick-history",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              shareToken,
            }),
          }
        );

        const result =
          await response.json();

        if (!response.ok) {
          console.error(
            "먹픽 기록 저장 실패:",
            result.message
          );
          return;
        }

        console.log(
          "먹픽 기록 저장 완료:",
          result.history
        );
      } catch (error) {
        console.error(
          "먹픽 기록 저장 오류:",
          error
        );
      }
    };

    savePickHistory();
  }, [
    sessionStatus,
    data,
    shareToken,
  ]);

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
          padding: "24px",
          background: "#fff9f4",
          color: "#c0392b",
          textAlign: "center",
        }}
      >
        {error ||
          "최종 결과가 없습니다."}
      </main>
    );
  }

  /*
    최종 결정 전 Final 직접 접근 방지
  */
  if (data.status !== "finished") {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#fff9f4",
          display: "grid",
          placeItems: "center",
          padding: "24px 16px",
          fontFamily: "Arial, sans-serif",
          color: "#201a17",
        }}
      >
        <section
          style={{
            width: "100%",
            maxWidth: "520px",
            padding:
              "clamp(26px, 6vw, 42px)",
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
              fontSize:
                "clamp(48px, 12vw, 60px)",
              marginBottom: "20px",
            }}
          >
            ⏳
          </div>

          <p
            style={{
              color: "#ff5a36",
              fontWeight: 700,
            }}
          >
            아직 결정 중이에요
          </p>

          <h1
            style={{
              fontSize:
                "clamp(26px, 7vw, 32px)",
              lineHeight: 1.3,
              margin: "10px 0 14px",
            }}
          >
            최종 메뉴가 아직
            정해지지 않았어요
          </h1>

          <p
            style={{
              color: "#746964",
              lineHeight: 1.6,
              marginBottom: "28px",
            }}
          >
            투표 결과를 확인하고
            최종 메뉴가 결정된 후
            다시 확인해주세요.
          </p>

          <button
            onClick={() => {
              window.location.href =
                `/live/${shareToken}`;
            }}
            style={{
              width:
                "min(100%, 300px)",
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
            투표 결과로 돌아가기
          </button>
        </section>
      </main>
    );
  }

  if (!data.finalFoodId) {
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
        최종 메뉴 정보를 찾을 수 없어요.
      </main>
    );
  }

  const winner =
    data.results.find(
      (item) =>
        item.foodId ===
        data.finalFoodId
    );

  if (!winner || !winner.food) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          background: "#fff9f4",
          color: "#746964",
          textAlign: "center",
        }}
      >
        최종 메뉴 정보를 찾을 수 없어요.
      </main>
    );
  }

  const winnerFood = winner.food;

  const handleOpenNaverMap = () => {
    const query =
      encodeURIComponent(
        winnerFood.name
      );

    window.open(
      `https://map.naver.com/p/search/${query}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

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
          justifyContent:
            "space-between",
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
          FINAL DECISION
        </span>
      </header>

      <section
        style={{
          width: "100%",
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
            fontSize:
              "clamp(30px, 7vw, 44px)",
            lineHeight: 1.25,
            margin: "0 0 14px",
            wordBreak: "keep-all",
          }}
        >
          오늘은 {winnerFood.name} 어때요?
        </h1>

        <p
          style={{
            color: "#746964",
            lineHeight: 1.6,
            marginBottom: "40px",
          }}
        >
          고민 끝! 이제 맛있게 먹으러 가면 돼요.
        </p>

        <article
          style={{
            width: "100%",
            background: "#fffdfb",
            border:
              "2px solid #ff5a36",
            borderRadius: "28px",
            padding:
              "clamp(20px, 5vw, 36px)",
            textAlign: "left",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "100%",
              aspectRatio: "16 / 10",
              maxHeight: "360px",
              background: "#f5ebe5",
              borderRadius: "20px",
              overflow: "hidden",
              marginBottom: "28px",
            }}
          >
            <FoodImage
              food={winnerFood}
            />
          </div>

          <p
            style={{
              color: "#ff5a36",
              fontWeight: 700,
              margin: 0,
            }}
          >
            {winnerFood.category}
          </p>

          <h2
            style={{
              fontSize:
                "clamp(28px, 7vw, 36px)",
              lineHeight: 1.25,
              margin: "8px 0 14px",
            }}
          >
            {winnerFood.name}
          </h2>

          <p
            style={{
              color: "#746964",
              lineHeight: 1.7,
              margin: 0,
              wordBreak: "keep-all",
            }}
          >
            {winnerFood.description}
          </p>

          <div
            style={{
              marginTop: "28px",
              paddingTop: "22px",
              borderTop:
                "1px solid #eadfd8",
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              justifyContent:
                "space-between",
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

        {/* 네이버 지도 */}
        <div
          style={{
            marginTop: "28px",
          }}
        >
          <p
            style={{
              margin: "0 0 12px",
              color: "#746964",
              fontSize: "14px",
            }}
          >
            메뉴가 정해졌다면 이제 먹으러 갈 곳을 찾아볼까요?
          </p>

          <button
            onClick={handleOpenNaverMap}
            style={{
              width:
                "min(100%, 420px)",
              padding: "17px 28px",
              border: 0,
              borderRadius: "14px",
              background: "#03c75a",
              color: "white",
              fontSize: "17px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            📍 네이버지도에서{" "}
            {winnerFood.name} 찾기
          </button>
        </div>

        {/* 로그인 사용자 기록 안내 */}
        {sessionStatus ===
          "authenticated" && (
          <p
            style={{
              margin: "18px 0 0",
              color: "#9a8f89",
              fontSize: "13px",
            }}
          >
            ✓ 이 결과는 내 먹픽 기록에 저장돼요.
          </p>
        )}

        <div
          style={{
            marginTop: "28px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "12px",
          }}
        >
          <button
            onClick={() => {
              window.location.href = "/";
            }}
            style={{
              flex: "1 1 180px",
              maxWidth: "300px",
              minHeight: "54px",
              padding: "16px 24px",
              border:
                "1px solid #eadfd8",
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
              window.location.href =
                "/preference";
            }}
            style={{
              flex: "1 1 180px",
              maxWidth: "300px",
              minHeight: "54px",
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
            다시 추천받기
          </button>
        </div>
      </section>
    </main>
  );
}