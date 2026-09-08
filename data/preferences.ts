import type { PreferenceTag } from "./foods";

export interface PreferenceQuestion {
  id: string;
  question: string;
  left: {
    label: string;
    tag: PreferenceTag;
  };
  right: {
    label: string;
    tag: PreferenceTag;
  };
}

export const preferenceQuestions: PreferenceQuestion[] = [
  {
    id: "spicy",
    question: "지금 더 당기는 맛은?",
    left: {
      label: "매콤하게",
      tag: "spicy",
    },
    right: {
      label: "안 맵게",
      tag: "mild",
    },
  },
  {
    id: "temperature",
    question: "온도는 어느 쪽이 좋아?",
    left: {
      label: "뜨끈하게",
      tag: "hot",
    },
    right: {
      label: "시원하게",
      tag: "cold",
    },
  },
  {
    id: "broth",
    question: "국물은?",
    left: {
      label: "국물 있는 게 좋아",
      tag: "broth",
    },
    right: {
      label: "국물 없이",
      tag: "no-broth",
    },
  },
  {
    id: "filling",
    question: "오늘은 얼마나 먹고 싶어?",
    left: {
      label: "든든하게",
      tag: "filling",
    },
    right: {
      label: "가볍게",
      tag: "light",
    },
  },
  {
    id: "novelty",
    question: "어떤 느낌이 더 끌려?",
    left: {
      label: "익숙한 맛",
      tag: "familiar",
    },
    right: {
      label: "새로운 맛",
      tag: "adventurous",
    },
  },
];