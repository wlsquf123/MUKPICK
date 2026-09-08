"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import FoodImage from "../../../components/FoodImage";

import type { Food } from "../../../data/foods";

interface RoomData {
  roomId: string;
  shareToken: string;
  status: "voting" | "tiebreak" | "finished";
  preferenceAnswers: string[];
  candidateFoods: Food[];
  finalFoodId: string | null;
}

export default function SharePage() {
  const params = useParams<{ shareToken: string }>();
  const shareToken = params.shareToken;

  const [room, setRoom] = useState<RoomData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isHost, setIsHost] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    setShareUrl(window.location.href);

    const savedShareToken = sessionStorage.getItem("shareToken");

    if (savedShareToken === shareToken) {
      setIsHost(true);
    }

    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/rooms/${shareToken}`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "방 정보를 불러오지 못했습니다."
          );
        }

        setRoom(data);
      } catch (error) {
        console.error(error);
        setError("방 정보를 불러오지 못했어요.");
      } finally {
        setIsLoading(false);
      }
    };

    if (shareToken) {
      fetchRoom();
    }
  }, [shareToken]);

  const getVoterToken = () => {
    let voterToken = localStorage.getItem("mukpickVoterToken");

    if (!voterToken) {
      voterToken = crypto.randomUUID();

      localStorage.setItem(
        "mukpickVoterToken",
        voterToken
      );
    }

    return voterToken;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(error);
      setError("링크를 복사하지 못했어요.");
    }
  };

  const handleVote = async (foodId: string) => {
    if (isVoting || hasVoted) {
      return;
    }

    try {
      setIsVoting(true);
      setError("");

      const voterToken = getVoterToken();

      const response = await fetch(
        `/api/rooms/${shareToken}/votes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            foodId,
            voterToken,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "투표에 실패했습니다."
        );
      }

      setSelectedFoodId(foodId);
      setHasVoted(true);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("투표 중 오류가 발생했습니다.");
      }
    } finally {
      setIsVoting(false);
    }
  };

  const handleMoveToLive = () => {
    window.location.href = `/live/${shareToken}`;
  };

  if (isLoading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#fff9f4",
          display: "grid",
          placeItems: "center",
        }}
      >
        방 정보를 불러오는 중...
      </main>
    );
  }

  if (error && !room) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#fff9f4",
          display: "grid",
          placeItems: "center",
          color: "#c0392b",
        }}
      >
        {error}
      </main>
    );
  }

  if (!room) {
    return null;
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
          같이 결정하기
        </span>
      </header>

      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        {isHost ? (
          <>
            <p
              style={{
                color: "#ff5a36",
                fontWeight: 700,
              }}
            >
              방이 준비됐어요
            </p>

            <h1
              style={{
                fontSize: "42px",
                margin: "10px 0 14px",
              }}
            >
              친구에게 이 링크를 보내주세요
            </h1>

            <p
              style={{
                color: "#746964",
                marginBottom: "32px",
              }}
            >
              친구는 질문을 다시 하지 않고 바로 투표할 수 있어요.
            </p>

            <div
              style={{
                display: "flex",
                gap: "12px",
                maxWidth: "700px",
                margin: "0 auto 20px",
              }}
            >
              <div
                style={{
                  flex: 1,
                  padding: "16px 20px",
                  background: "#fffdfb",
                  border: "1px solid #eadfd8",
                  borderRadius: "14px",
                  textAlign: "left",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  color: "#746964",
                }}
              >
                {shareUrl}
              </div>

              <button
                onClick={handleCopyLink}
                style={{
                  padding: "0 28px",
                  border: 0,
                  borderRadius: "14px",
                  background: "#ff5a36",
                  color: "white",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {copied ? "복사 완료!" : "링크 복사"}
              </button>
            </div>

            <button
              onClick={handleMoveToLive}
              style={{
                marginBottom: "40px",
                padding: "16px 32px",
                border: 0,
                borderRadius: "14px",
                background: "#2b211d",
                color: "white",
                fontSize: "16px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              투표 결과 보기
            </button>
          </>
        ) : (
          <>
            <p
              style={{
                color: "#ff5a36",
                fontWeight: 700,
              }}
            >
              친구가 메뉴 선택을 부탁했어요
            </p>

            <h1
              style={{
                fontSize: "42px",
                margin: "10px 0 14px",
              }}
            >
              둘 중 뭐가 더 끌려?
            </h1>

            <p
              style={{
                color: "#746964",
                marginBottom: "40px",
              }}
            >
              하나만 골라 투표해주세요.
            </p>
          </>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
          }}
        >
          {room.candidateFoods.map((food) => {
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
                  padding: "28px",
                  textAlign: "left",
                }}
              >
                <div
                 style={{
                    height: "220px",
                    borderRadius: "18px",
                    background: "#f5ebe5",
                    overflow: "hidden",
                    marginBottom: "22px",
                    }}
                >
                <FoodImage food={food} />
                </div>

                <p
                  style={{
                    color: "#ff5a36",
                    fontWeight: 700,
                    marginBottom: "8px",
                  }}
                >
                  {food.category}
                </p>

                <h2
                  style={{
                    fontSize: "28px",
                    margin: "0 0 12px",
                  }}
                >
                  {food.name}
                </h2>

                <p
                  style={{
                    color: "#746964",
                    minHeight: "48px",
                  }}
                >
                  {food.description}
                </p>

                {!isHost && (
                  <button
                    onClick={() =>
                      handleVote(food.id)
                    }
                    disabled={isVoting || hasVoted}
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
                      fontWeight: 700,
                      fontSize: "16px",
                      cursor:
                        isVoting || hasVoted
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        hasVoted && !isSelected
                          ? 0.45
                          : 1,
                    }}
                  >
                    {isSelected
                      ? "내 투표 완료"
                      : "이 메뉴에 투표"}
                  </button>
                )}
              </article>
            );
          })}
        </div>

        {hasVoted && (
          <>
            <div
              style={{
                marginTop: "32px",
                padding: "22px",
                background: "#fffdfb",
                border: "1px solid #eadfd8",
                borderRadius: "18px",
              }}
            >
              <strong
                style={{
                  color: "#ff5a36",
                  fontSize: "18px",
                }}
              >
                투표가 완료됐어요!
              </strong>
            </div>

            <button
              onClick={handleMoveToLive}
              style={{
                marginTop: "16px",
                padding: "16px 32px",
                border: 0,
                borderRadius: "14px",
                background: "#2b211d",
                color: "white",
                fontSize: "16px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              투표 결과 보기
            </button>
          </>
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