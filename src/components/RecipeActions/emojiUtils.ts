import GraphemeSplitter from "grapheme-splitter";

// Default emojis for food categories
export const defaultSuggestedEmojis = [
  "🍕",
  "🍔",
  "🍗",
  "🍖",
  "🍛",
  "🍜",
  "🍝",
  "🍲",
  "🍳",
  "🥗",
  "🥘",
  "🌮",
  "🌯",
  "🍱",
  "🍚",
  "🥟",
  "🍤",
  "🍙",
  "🧁",
  "🍰",
  "🎂",
  "🍮",
  "🍩",
  "🍪",
  "🍫",
  "🍬",
  "🍷",
  "🍸",
  "🍹",
  "☕",
  "🍵",
  "🍼",
];
export const DEFAULT_EMOJI = "🍽️";
const splitter = new GraphemeSplitter();

// Check if a string is a single emoji character
export const isSingleEmoji = (value: string): boolean => {
  if (!value) {
    return false;
  }
  const graphemes = splitter.splitGraphemes(value);
  return (
    graphemes.length === 1 &&
    /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u.test(graphemes[0])
  );
};
