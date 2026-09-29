// Short blocklist (PT-BR + EN), matched as substrings after normalization.
const BLOCKLIST = [
  "porra", "caralho", "buceta", "boceta", "cacete", "putaria", "filhodaputa", "putinha","viado", "bosta", "merda",
  "foda", "arrombad", "cuzao", "piroca", "xoxota", "vagabund", "corno",
  "fuck", "shit", "bitch", "cunt", "pussy", "nigg", "faggot", "whore", "slut", "nazi", "hitler",
];

const LEET: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s" };

export function normalizeNickname(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[013457@$]/g, (c) => LEET[c])
    .replace(/[^a-z]/g, "");
}

export function isOffensive(nickname: string): boolean {
  const normalized = normalizeNickname(nickname);
  return BLOCKLIST.some((word) => normalized.includes(word));
}
