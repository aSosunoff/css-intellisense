import * as vscode from "vscode";
import { getTextBeforeCursor } from "./get-text-before-cursor";
import { getTextAfterCursor } from "./get-text-after-cursor";

const doubleQuoteMatcher =
  /\s+(?:className|:class|v-bind:class)\s*=\s*"\{\{?([^"]*)$/;

const singleQuoteMatcher =
  /\s+(?:className|:class|v-bind:class)\s*=\s*'\{\{?([^']*)$/;

export const getClassListFromBraces = (
  document: vscode.TextDocument,
  position: vscode.Position,
) => {
  const textBeforeCursor = getTextBeforeCursor(document, position);

  const doubleQuoteMatch = textBeforeCursor.match(doubleQuoteMatcher);
  const singleQuoteMatch = textBeforeCursor.match(singleQuoteMatcher);

  const match = doubleQuoteMatch || singleQuoteMatch;

  if (!match) return null;

  const valueBeforeCursor = match[1];

  const textAfterCursor = getTextAfterCursor(document, position);
  const closingBraceIndex = textAfterCursor.indexOf("}");

  const valueAfterCursor =
    closingBraceIndex === -1
      ? textAfterCursor
      : textAfterCursor.slice(0, closingBraceIndex);

  return `${valueBeforeCursor}${valueAfterCursor}`;
};
