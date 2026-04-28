import * as vscode from "vscode";

export const getTextAfterCursor = (
  document: vscode.TextDocument,
  position: vscode.Position,
) => {
  const documentText = document.getText();
  const cursorOffset = document.offsetAt(position);
  const textAfterCursor = documentText.slice(cursorOffset);
  return textAfterCursor;
};
