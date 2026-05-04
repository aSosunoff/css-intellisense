import * as vscode from "vscode";
import { getClassListFromString } from "./get-class-list-from-string";
import { getClassListFromBraces } from "./get-class-list-from-braces";
import { getTextBeforeCursor } from "./get-text-before-cursor";
import { getTextAfterCursor } from "./get-text-after-cursor";

export const getClassList = (
  document: vscode.TextDocument,
  position: vscode.Position,
) => {
  const textBeforeCursor = getTextBeforeCursor(document, position);
  const textAfterCursor = getTextAfterCursor(document, position);

  const classListFromString = getClassListFromString({
    textBeforeCursor,
    textAfterCursor,
  });

  if (classListFromString) return classListFromString;

  const classListFromBraces = getClassListFromBraces({
    textBeforeCursor,
    textAfterCursor,
  });

  if (classListFromBraces) return classListFromBraces;

  return null;
};
