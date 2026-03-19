export function formatINR(amount) {
  if (isNaN(amount)) return "₹0";
  return "₹" + Number(amount).toLocaleString("en-IN");
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export const CATEGORY_EMOJIS = {
  food: "🍽",
  travel: "🚗",
  hotel: "🏨",
  shopping: "🛍",
  fun: "🎉",
  other: "📦"
};
