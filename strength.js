// Пресметка на јачина на лозинка → скор 1–10.
// Се извршува ЛОКАЛНО во прелистувачот. Лозинката не напушта уредот.
// Логиката е во духот на стандардните проверувачи: должина + разновидност
// на знаци (мали букви, големи букви, бројки, симболи), минус казни за
// чести слаби обрасци.
function scorePassword(pw) {
  if (!pw) {
    return { score: 0, label: "Empty", hints: ["Enter a password"] };
  }

  let points = 0;
  const hints = [];

  // 1) Length
  if (pw.length >= 16) points += 4;
  else if (pw.length >= 12) points += 3;
  else if (pw.length >= 8) points += 2;
  else if (pw.length >= 6) points += 1;
  else hints.push("Use at least 8 characters");

  // 2) Character diversity
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasDigit = /[0-9]/.test(pw);
  const hasSymbol = /[^A-Za-z0-9]/.test(pw);
  const classes = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;
  points += classes;

  if (!hasUpper) hints.push("Add an uppercase letter");
  if (!hasLower) hints.push("Add a lowercase letter");
  if (!hasDigit) hints.push("Add a number");
  if (!hasSymbol) hints.push("Add a special character (!?@#...)");

  // 3) Bonus
  if (pw.length >= 12 && classes >= 3) points += 2;

  // 4) Penalties
  if (/^[0-9]+$/.test(pw)) {
    points -= 2;
    hints.push("Numbers only are easy to guess");
  }
  if (/(.)\1\1/.test(pw)) {
    points -= 1;
    hints.push("Avoid repeated characters (aaa, 111)");
  }
  if (/^(?:1234|abcd|qwerty|password|0000|1111)/i.test(pw)) {
    points -= 2;
    hints.push("Avoid common/predictable passwords");
  }

  // Normalize
  let score = Math.max(1, Math.min(10, points));

  const labels = {
    weak: "Weak",
    medium: "Medium",
    strong: "Strong",
    veryStrong: "Very Strong",
  };
  let label;
  if (score <= 3) label = labels.weak;
  else if (score <= 6) label = labels.medium;
  else if (score <= 8) label = labels.strong;
  else label = labels.veryStrong;

  return { score, label, hints };
}

// направи достапно и во прелистувач и (евентуално) во Node
if (typeof module !== "undefined" && module.exports) {
  module.exports = { scorePassword };
}
