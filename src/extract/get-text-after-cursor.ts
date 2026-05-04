import * as vscode from "vscode";
import { MAX_CONTEXT_LENGTH } from "./constants";

export const getTextAfterCursor = (
  document: vscode.TextDocument,
  position: vscode.Position,
) => {
  const cursorOffset = document.offsetAt(position);
  const lastLine = document.lineAt(document.lineCount - 1);
  const documentEndOffset = document.offsetAt(lastLine.range.end);
  const endOffset = Math.min(
    documentEndOffset,
    cursorOffset + MAX_CONTEXT_LENGTH,
  );
  const endPosition = document.positionAt(endOffset);

  return document.getText(new vscode.Range(position, endPosition));
};
