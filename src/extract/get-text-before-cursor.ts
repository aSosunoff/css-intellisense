import * as vscode from "vscode";
import { MAX_CONTEXT_LENGTH } from "./constants";

export const getTextBeforeCursor = (
  document: vscode.TextDocument,
  position: vscode.Position,
) => {
  const cursorOffset = document.offsetAt(position);
  const startOffset = Math.max(0, cursorOffset - MAX_CONTEXT_LENGTH);
  const startPosition = document.positionAt(startOffset);

  return document.getText(new vscode.Range(startPosition, position));
};
