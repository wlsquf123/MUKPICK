"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

import type { Food } from "../../../data/foods";
import FoodImage from "../../../components/FoodImage";
import SiteHeader from "../../../components/SiteHeader";

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

  const [room, setRoom] =
    useState<RoomData | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isNotFound, setIsNotFound] =
    useState(false);

  const [error, setError] =
    useState("");

  const [isHost, setIsHost] =
    useState(false);

  const [shareUrl, setShareUrl] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  const [selectedFoodId, setSelectedFoodId] =
    useState<string | null>(null);

  const [isVoting, setIsVoting] =
    useState(false);

  const [hasVoted, setHasVoted] =
    useState(false);

    useEffect(() => {
      const isLocal =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
    
      const baseUrl = isLocal
        ? window.location.origin
        : "https://mukpick.vercel.app";
    
      setShareUrl(
        `${baseUrl}/share/${shareToken}`
      );

    const savedShareToken =
      sessionStorage.getItem(
        "shareToken"
      );

    const host =
      savedShareToken === shareToken;

    setIsHost(host);

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

        if (response.status === 404) {
          setIsNotFound(true);
          return;
        }

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
          "방 정보를 불러오지 못했어요."
        );
      } finally {
        setIsLoading(false);
      }
    };

    const checkVoteStatus =
      async () => {
        if (host) {
          return;
        }

        const voterToken =
          localStorage.getItem(
            "mukpickVoterToken"
          );

        if (!voterToken) {
          return;
        }

        try {
          const response =
            await fetch(
              `/api/rooms/${shareToken}/votes?voterToken=${encodeURIComponent(
                voterToken
              )}`,
              {
                cache: "no-store",
              }
            );

          if (
            response.status === 404
          ) {
            return;
          }

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.message ||
                "투표 상태를 확인하지 못했습니다."
            );
          }

          if (data.hasVoted) {
            setHasVoted(true);

            setSelectedFoodId(
              data.foodId
            );
          }
        } catch (error) {
          console.error(
            "투표 상태 확인 오류:",
            error
          );
        }
      };

    if (shareToken) {
      fetchRoom();
      checkVoteStatus();
    }
  }, [shareToken]);

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

  const handleCopyLink =
    async () => {
      try {
        await navigator.clipboard.writeText(
          shareUrl
        );

        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch (error) {
        console.error(error);

        setError(
          "링크를 복사하지 못했어요."
        );
      }
    };

  const handleVote = async (
    foodId: string
  ) => {
    if (
      isVoting ||
      hasVoted ||
      room?.status !== "voting"
    ) {
      return;
    }

    try {
      setIsVoting(true);
      setError("");

      const voterToken =
        getVoterToken();

      const response =
        await fetch(
          `/api/rooms/${shareToken}/votes`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              foodId,
              voterToken,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "투표에 실패했습니다."
        );
      }

      setSelectedFoodId(foodId);
      setHasVoted(true);
    } catch (error) {
      console.error(error);

      if (
        error instanceof Error
      ) {
        setError(error.message);
      } else {
        setError(
          "투표 중 오류가 발생했습니다."
        );
      }
    } finally {
      setIsVoting(false);
    }
  };

  const handleMoveToLive = () => {
    window.location.href =
      `/live/${shareToken}`;
  };

  const handleMoveToFinal = () => {
    window.location.href =
      `/final/${shareToken}`;
  };

  if (isLoading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#fff9f4",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          textAlign: "center",
        }}
      >
        방 정보를 불러오는 중...
      </main>
    );
  }

  if (isNotFound) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#fff9f4",
          display: "grid",
          placeItems: "center",
          padding: "24px 16px",
          fontFamily:
            "Arial, sans-serif",
          color: "#201a17",
        }}
      >
        <section
          style={{
            width: "100%",
            maxWidth: "500px",

            padding:
              "clamp(28px, 6vw, 44px)",

            background: "#fffdfb",

            border:
              "1px solid #eadfd8",

            borderRadius: "24px",

            boxSizing: "border-box",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "58px",
              marginBottom: "20px",
            }}
          >
            🔗
          </div>

          <p
            style={{
              margin: "0 0 10px",
              color: "#ff5a36",
              fontWeight: 700,
            }}
          >
            링크를 찾을 수 없어요
          </p>

          <h1
            style={{
              margin: "0 0 14px",

              fontSize:
                "clamp(27px, 7vw, 34px)",

              lineHeight: 1.3,

              wordBreak: "keep-all",
            }}
          >
            존재하지 않는 먹픽 방이에요
          </h1>

          <p
            style={{
              margin: "0 0 28px",

              color: "#746964",

              lineHeight: 1.7,

              wordBreak: "keep-all",
            }}
          >
            공유 주소가 잘못되었거나
            사용할 수 없는 링크일 수 있어요.
            주소를 다시 확인해주세요.
          </p>

          <button
            onClick={() => {
              window.location.href = "/";
            }}
            style={{
              width:
                "min(100%, 280px)",

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
            먹픽 처음으로
          </button>
        </section>
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
          padding: "24px",
          color: "#c0392b",
          textAlign: "center",
        }}
      >
        {error}
      </main>
    );
  }

  if (!room) {
    return null;
  }

  const isFinished =
    room.status === "finished";

  const isTieBreak =
    room.status === "tiebreak";

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
      <SiteHeader label="같이 결정하기" />

      <section
        style={{
          width: "100%",
          maxWidth: "900px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        {/* 이미 최종 결정된 방 */}
        {isFinished ? (
          <>
            <div
              style={{
                fontSize: "54px",
                marginBottom: "14px",
              }}
            >
              🎉
            </div>

            <p
              style={{
                color: "#ff5a36",
                fontWeight: 700,
                marginBottom: "10px",
              }}
            >
              메뉴 결정 완료!
            </p>

            <h1
              style={{
                fontSize:
                  "clamp(30px, 6vw, 42px)",

                lineHeight: 1.25,

                margin: "0 0 14px",
              }}
            >
              이미 최종 메뉴가 정해졌어요
            </h1>

            <p
              style={{
                color: "#746964",
                lineHeight: 1.6,
                marginBottom: "28px",
              }}
            >
              투표가 모두 끝났어요.
              어떤 메뉴가 선택됐는지 확인해보세요.
            </p>

            <button
              onClick={
                handleMoveToFinal
              }
              style={{
                width:
                  "min(100%, 300px)",

                marginBottom: "40px",

                padding:
                  "17px 30px",

                border: 0,

                borderRadius: "14px",

                background: "#ff5a36",

                color: "white",

                fontSize: "17px",

                fontWeight: 700,

                cursor: "pointer",
              }}
            >
              최종 결과 보기
            </button>
          </>
        ) : isHost ? (
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
                fontSize:
                  "clamp(30px, 6vw, 42px)",

                lineHeight: 1.25,

                margin:
                  "10px 0 14px",
              }}
            >
              친구에게 이 링크를 보내주세요
            </h1>

            <p
              style={{
                color: "#746964",
                lineHeight: 1.6,
                marginBottom: "32px",
              }}
            >
              친구는 질문을 다시 하지 않고
              바로 투표할 수 있어요.
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                width: "100%",
                maxWidth: "700px",
                margin:
                  "0 auto 20px",
              }}
            >
              <div
                style={{
                  flex:
                    "1 1 280px",

                  minWidth: 0,

                  padding:
                    "16px 20px",

                  background:
                    "#fffdfb",

                  border:
                    "1px solid #eadfd8",

                  borderRadius:
                    "14px",

                  textAlign: "left",

                  overflow: "hidden",

                  whiteSpace:
                    "nowrap",

                  textOverflow:
                    "ellipsis",

                  color: "#746964",

                  boxSizing:
                    "border-box",
                }}
              >
                {shareUrl}
              </div>

              <button
                onClick={
                  handleCopyLink
                }
                style={{
                  flex:
                    "1 0 130px",

                  minHeight:
                    "54px",

                  padding:
                    "0 28px",

                  border: 0,

                  borderRadius:
                    "14px",

                  background:
                    "#ff5a36",

                  color: "white",

                  fontWeight:
                    700,

                  cursor:
                    "pointer",
                }}
              >
                {copied
                  ? "복사 완료!"
                  : "링크 복사"}
              </button>
            </div>

            {shareUrl && (
              <div
                style={{
                  width: "100%",

                  maxWidth:
                    "360px",

                  margin:
                    "28px auto",

                  padding:
                    "28px 20px",

                  background:
                    "#fffdfb",

                  border:
                    "1px solid #eadfd8",

                  borderRadius:
                    "24px",

                  textAlign:
                    "center",

                  boxSizing:
                    "border-box",
                }}
              >
                <p
                  style={{
                    margin:
                      "0 0 8px",

                    color:
                      "#ff5a36",

                    fontWeight:
                      700,

                    fontSize:
                      "14px",
                  }}
                >
                  QR로 바로 참여하기
                </p>

                <h2
                  style={{
                    margin:
                      "0 0 20px",

                    fontSize:
                      "22px",
                  }}
                >
                  휴대폰으로 스캔해주세요
                </h2>

                <div
                  style={{
                    display:
                      "inline-flex",

                    maxWidth:
                      "100%",

                    padding:
                      "16px",

                    background:
                      "#ffffff",

                    borderRadius:
                      "18px",

                    boxSizing:
                      "border-box",
                  }}
                >
                  <QRCodeSVG
                    value={shareUrl}
                    size={190}
                    level="M"
                  />
                </div>

                <p
                  style={{
                    margin:
                      "18px 0 0",

                    color:
                      "#746964",

                    fontSize:
                      "13px",

                    lineHeight:
                      1.6,
                  }}
                >
                  QR을 스캔하면 같은 후보
                  2개에 바로 투표할 수 있어요.
                </p>
              </div>
            )}

            <button
              onClick={
                handleMoveToLive
              }
              style={{
                marginBottom:
                  "40px",

                padding:
                  "16px 32px",

                border: 0,

                borderRadius:
                  "14px",

                background:
                  "#2b211d",

                color: "white",

                fontSize:
                  "16px",

                fontWeight:
                  700,

                cursor:
                  "pointer",
              }}
            >
              투표 결과 보기
            </button>
          </>
        ) : isTieBreak ? (
          <>
            <p
              style={{
                color: "#ff5a36",
                fontWeight: 700,
              }}
            >
              투표가 마무리되고 있어요
            </p>

            <h1
              style={{
                fontSize:
                  "clamp(30px, 6vw, 42px)",

                lineHeight: 1.25,

                margin:
                  "10px 0 14px",
              }}
            >
              두 메뉴가 동점이에요
            </h1>

            <p
              style={{
                color: "#746964",
                marginBottom: "40px",
              }}
            >
              호스트가 마지막 메뉴를 결정하고 있어요.
            </p>
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
                fontSize:
                  "clamp(30px, 6vw, 42px)",

                lineHeight: 1.25,

                margin:
                  "10px 0 14px",
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

        {/* 후보 음식 */}
        <div
          style={{
            display: "grid",

            gridTemplateColumns:
              "repeat(auto-fit, minmax(280px, 1fr))",

            gap: "24px",

            width: "100%",

            alignItems:
              "stretch",
          }}
        >
          {room.candidateFoods.map(
            (food) => {
              const isSelected =
                selectedFoodId ===
                food.id;

              return (
                <article
                  key={food.id}
                  style={{
                    minWidth: 0,

                    background:
                      "#fffdfb",

                    border:
                      isSelected
                        ? "2px solid #ff5a36"
                        : "1px solid #eadfd8",

                    borderRadius:
                      "24px",

                    padding:
                      "clamp(20px, 4vw, 28px)",

                    textAlign:
                      "left",

                    overflow:
                      "hidden",

                    boxSizing:
                      "border-box",

                    display:
                      "flex",

                    flexDirection:
                      "column",

                    height:
                      "100%",
                  }}
                >
                  <div
                    style={{
                      width:
                        "100%",

                      aspectRatio:
                        "4 / 3",

                      maxHeight:
                        "260px",

                      borderRadius:
                        "18px",

                      background:
                        "#f5ebe5",

                      overflow:
                        "hidden",

                      marginBottom:
                        "22px",
                    }}
                  >
                    <FoodImage
                      food={food}
                    />
                  </div>

                  <p
                    style={{
                      color:
                        "#ff5a36",

                      fontWeight:
                        700,

                      margin:
                        "0 0 8px",
                    }}
                  >
                    {food.category}
                  </p>

                  <h2
                    style={{
                      fontSize:
                        "28px",

                      margin:
                        "0 0 12px",
                    }}
                  >
                    {food.name}
                  </h2>

                  <p
                    style={{
                      color:
                        "#746964",

                      lineHeight:
                        1.6,

                      marginBottom:
                        0,
                    }}
                  >
                    {food.description}
                  </p>

                  {/* 투표 중인 친구에게만 버튼 표시 */}
                  {!isHost &&
                    room.status ===
                      "voting" && (
                      <div
                        style={{
                          marginTop:
                            "auto",

                          paddingTop:
                            "20px",
                        }}
                      >
                        <button
                          onClick={() =>
                            handleVote(
                              food.id
                            )
                          }
                          disabled={
                            isVoting ||
                            hasVoted
                          }
                          style={{
                            width:
                              "100%",

                            padding:
                              "16px",

                            border: 0,

                            borderRadius:
                              "14px",

                            background:
                              isSelected
                                ? "#2b211d"
                                : "#ff5a36",

                            color:
                              "white",

                            fontWeight:
                              700,

                            fontSize:
                              "16px",

                            cursor:
                              isVoting ||
                              hasVoted
                                ? "not-allowed"
                                : "pointer",

                            opacity:
                              hasVoted &&
                              !isSelected
                                ? 0.45
                                : 1,
                          }}
                        >
                          {isSelected
                            ? "내 투표 완료"
                            : "이 메뉴에 투표"}
                        </button>
                      </div>
                    )}
                </article>
              );
            }
          )}
        </div>

        {hasVoted &&
          !isFinished &&
          !isTieBreak && (
            <>
              <div
                style={{
                  marginTop:
                    "32px",

                  padding:
                    "22px",

                  background:
                    "#fffdfb",

                  border:
                    "1px solid #eadfd8",

                  borderRadius:
                    "18px",
                }}
              >
                <strong
                  style={{
                    color:
                      "#ff5a36",

                    fontSize:
                      "18px",
                  }}
                >
                  투표가 완료됐어요!
                </strong>
              </div>

              <button
                onClick={
                  handleMoveToLive
                }
                style={{
                  marginTop:
                    "16px",

                  padding:
                    "16px 32px",

                  border: 0,

                  borderRadius:
                    "14px",

                  background:
                    "#2b211d",

                  color: "white",

                  fontSize:
                    "16px",

                  fontWeight:
                    700,

                  cursor:
                    "pointer",
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