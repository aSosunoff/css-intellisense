import * as vscode from "vscode";
import { getTextBeforeCursor } from "./get-text-before-cursor";
import { getTextAfterCursor } from "./get-text-after-cursor";
import { TextType } from "./TextType";

const doubleQuoteMatcher =
  /\s+(?:class|:class|v-bind:class|className)\s*=\s*"([^"{]*)$/;

const singleQuoteMatcher =
  /\s+(?:class|:class|v-bind:class|className)\s*=\s*'([^'{]*)$/;

export const getClassListFromString = ({
  textAfterCursor,
  textBeforeCursor,
}: TextType) => {
  const doubleQuoteMatch = textBeforeCursor.match(doubleQuoteMatcher);
  const singleQuoteMatch = textBeforeCursor.match(singleQuoteMatcher);

  const match = doubleQuoteMatch || singleQuoteMatch;

  if (!match) return null;

  const valueBeforeCursor = match[1];

  const quote = doubleQuoteMatch ? '"' : "'";
  const closingQuoteIndex = textAfterCursor.indexOf(quote);
  const valueAfterCursor =
    closingQuoteIndex === -1
      ? textAfterCursor
      : textAfterCursor.slice(0, closingQuoteIndex);

  return `${valueBeforeCursor}${valueAfterCursor}`;
};
