import * as vscode from "vscode";
import { getClassListFromString } from "./get-class-list-from-string";
import { getClassListFromBraces } from "./get-class-list-from-braces";

export const getClassList = (
  document: vscode.TextDocument,
  position: vscode.Position,
) => {
  const classListFromString = getClassListFromString(document, position);

  if (classListFromString) return classListFromString;

  const classListFromBraces = getClassListFromBraces(document, position);

  if (classListFromBraces) return classListFromBraces;

  return null;
};
