type FoodImageInfo = {
  id: string;
  illustrationKey: string;
};

const foodImageFiles: Record<string, string> = {
  // 기존 음식
  jjamppong:
    "Jjamppong (Korean Chines seafood noodle soup).jpg",

  malatang: "Malatang.jpg",

  naengmyeon: "Naengmyeon.jpg",

  gimbap: "Gimbap.jpg",

  tteokbokki: "Tteokbokki.JPG",

  donkatsu: "Tonkatsu.jpg",

  pho: "Pho, popular Vietnamese noodle soup.jpg",

  bibimbap: "The Bibimbap.jpg",

  salad: "Salads.jpg",

  curry: "Japanese curry rice.jpg",

  // 추가 음식
  "kimchi-jjigae": "Gimchi-jjigae.jpg",

  jeyuk: "Jeyuk-bokkeum.jpg",

  sushi: "SUSHI.jpg",

  udon: "Udon (Kitsune udon).jpg",

  pasta: "Pasta (1).jpg",

  poke: "Poké Bowl.jpg",

  // 한식
  samgyeopsal: "Samgyeopsal.jpg",

  bulgogi: "Bulgogi.JPG",

  "doenjang-jjigae": "Doenjang-jjigae.jpg",

  seolleongtang: "Seolleongtang.jpg",

  galbitang: "Galbi-tang.jpg",

  samgyetang: "Samgye tang.jpg",

  dakgalbi: "Dak-galbi.jpg",

  bossam: "Korean cuisine-Bossam-01.jpg",

  jokbal: "Jokbal.jpg",

  kalguksu: "Kal-guksu.jpg",

  sujebi: "Sujebi.jpg",

  kongguksu: "Kongguksu (soybean cold noodle).jpg",

  "bibim-naengmyeon": "Bibim-naengmyeon.jpg",

  ramyeon: "Korea Ramyeon.jpg",

  "sundubu-jjigae": "Sundubu Jjgae.jpg",

  mandu: "Korean mandu dumplings.jpg",

  "kimchi-fried-rice": "Kimchi fried rice.jpg",

  // 일식 / 양식
  omurice: "Omurice.jpg",

  "fried-chicken": "Fried Chicken img.jpg",

  "yangnyeom-chicken": "Korean Yangnyeom chicken.jpg",

  dakgangjeong: "Dak-gangjeong.jpg",

  hamburger: "HamburgerHamburger.jpg",

  pizza: "Pizza image.jpg",

  sandwich: "Sandwich.jpg",

  steak: "Steak.jpg",

  risotto: "Risotto.jpg",

  // 멕시코식
  taco: "NCI Visuals Food Taco.jpg",

  burrito: "Burrito.JPG",

  quesadilla: "The Quesadilla.jpg",

  // 동남아 / 아시아
  "pad-thai": "Pad thai.jpg",

  "tom-yum": "Tom yum.jpg",

  "nasi-goreng": "Nasi-Goreng.jpg",

  "banh-mi": "Vietnamese Bánh mì (Banh Mi) Sandwich.jpg",

  "japanese-ramen": "Ramen.jpg",

  soba: "Soba.jpg",

  katsudon: "Katsudon.jpg",

  gyudon: "Gyūdon.jpg",

  "mapo-tofu": "MapoTofu.jpg",

  jajangmyeon: "Jajangmyeon photo.jpg",

  tangsuyuk: "Tangsuyuk.jpg",
};

export function getFoodImageUrl(
  food: FoodImageInfo
): string {
  const fileName =
    foodImageFiles[food.illustrationKey];

  if (!fileName) {
    return "";
  }

  return (
    "https://commons.wikimedia.org/wiki/" +
    "Special:Redirect/file/" +
    encodeURIComponent(fileName)
  );
}