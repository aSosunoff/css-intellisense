export const findLastMatch = (text: string, pattern: RegExp) => {
  let lastMatch: RegExpExecArray | undefined;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    lastMatch = match;
  }

  return lastMatch;
};
