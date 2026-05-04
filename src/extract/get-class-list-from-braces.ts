import * as vscode from "vscode";
import { getTextBeforeCursor } from "./get-text-before-cursor";
import { getTextAfterCursor } from "./get-text-after-cursor";
import { TextType } from "./TextType";

const doubleQuoteMatcher = /\s+(?::class|v-bind:class)\s*=\s*"\{([^}]*)$/;

const singleQuoteMatcher = /\s+(?::class|v-bind:class)\s*=\s*'\{([^}]*)$/;

const jsxObjectExpressionMatcher = /\s+className\s*=\s*\{\{([^}]*)$/;

export const getClassListFromBraces = ({
  textAfterCursor,
  textBeforeCursor,
}: TextType) => {
  const doubleQuoteMatch = textBeforeCursor.match(doubleQuoteMatcher);
  const singleQuoteMatch = textBeforeCursor.match(singleQuoteMatcher);
  const jsxObjectExpressionMatch = textBeforeCursor.match(
    jsxObjectExpressionMatcher,
  );

  const match =
    doubleQuoteMatch || singleQuoteMatch || jsxObjectExpressionMatch;

  if (!match) return null;

  const valueBeforeCursor = match[1];

  const closingBraceIndex = textAfterCursor.indexOf("}");

  const valueAfterCursor =
    closingBraceIndex === -1
      ? textAfterCursor
      : textAfterCursor.slice(0, closingBraceIndex);

  return `${valueBeforeCursor}${valueAfterCursor}`;
};
