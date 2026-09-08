import { foods, type Food, type PreferenceTag } from "../data/foods";

export function getRecommendations(
  selectedTags: PreferenceTag[],
  excludeFoodIds: string[] = []
): Food[] {
  const scoredFoods = foods
    .filter((food) => !excludeFoodIds.includes(food.id))
    .map((food) => {
      const score = selectedTags.reduce((total, tag) => {
        return food.tags.includes(tag) ? total + 1 : total;
      }, 0);

      return {
        food,
        score,
      };
    })
    .sort((a, b) => b.score - a.score);

  const highestScore = scoredFoods[0]?.score ?? 0;

  const topFoods = scoredFoods.filter(
    (item) => item.score >= Math.max(highestScore - 1, 0)
  );

  const shuffled = [...topFoods].sort(() => Math.random() - 0.5);

  return shuffled.slice(0, 2).map((item) => item.food);
}