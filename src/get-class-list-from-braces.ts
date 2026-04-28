import * as vscode from "vscode";
import { findLastMatch } from "./find-last-match";
import { getTextBeforeCursor } from "./get-text-before-cursor";
import { getTextAfterCursor } from "./get-text-after-cursor";

const doubleQuoteMatcher = /\s+(?::class|v-bind:class)\s*=\s*"\{/g;

const singleQuoteMatcher = /\s+(?::class|v-bind:class)\s*=\s*'\{/g;

export const getClassListFromBraces = (
  document: vscode.TextDocument,
  position: vscode.Position,
) => {
  const textBeforeCursor = getTextBeforeCursor(document, position);

  const doubleQuoteMatch = doubleQuoteMatcher.test(textBeforeCursor);
  const singleQuoteMatch = singleQuoteMatcher.test(textBeforeCursor);

  const hasMatch = doubleQuoteMatch ?? singleQuoteMatch;

  if (!hasMatch) return null;

  const matcher = doubleQuoteMatch ? doubleQuoteMatcher : singleQuoteMatcher;

  const bindingStartMatch = findLastMatch(textBeforeCursor, matcher);

  if (!bindingStartMatch || bindingStartMatch.index === undefined) return null;

  const expressionStart = bindingStartMatch.index + bindingStartMatch[0].length;
  const textAfterCursor = getTextAfterCursor(document, position);
  const documentText = document.getText();
  const cursorOffset = document.offsetAt(position);
  const expressionBeforeCursor = documentText.slice(
    expressionStart,
    cursorOffset,
  );
  const closingBraceIndex = textAfterCursor.indexOf("}");
  const expressionAfterCursor =
    closingBraceIndex === -1
      ? textAfterCursor
      : textAfterCursor.slice(0, closingBraceIndex);

  return `${expressionBeforeCursor}${expressionAfterCursor}`;
};
