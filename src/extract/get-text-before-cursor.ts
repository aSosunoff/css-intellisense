import * as vscode from "vscode";

export const getTextBeforeCursor = (
  document: vscode.TextDocument,
  position: vscode.Position,
) => {
  const documentText = document.getText();
  const cursorOffset = document.offsetAt(position);
  const textBeforeCursor = documentText.slice(0, cursorOffset);
  return textBeforeCursor;
};
