"use client";

import { useState } from "react";

import type { Food } from "../data/foods";
import { getFoodImageUrl } from "../lib/foodImage";

interface FoodImageProps {
  food: Food;
}

export default function FoodImage({
  food,
}: FoodImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "grid",
          placeItems: "center",
          background: "#f5ebe5",
          fontSize: "64px",
        }}
      >
        🍽️
      </div>
    );
  }

  return (
    <img
      src={getFoodImageUrl(food)}
      alt={food.name}
      loading="lazy"
      onError={() => setHasError(true)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
      }}
    />
  );
}