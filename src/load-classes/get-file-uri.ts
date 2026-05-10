import * as vscode from "vscode";

export const getFileUri = (uri: vscode.Uri, path: string) => {
  if (!path) return undefined;

  return path.startsWith("/")
    ? vscode.Uri.file(path)
    : vscode.Uri.joinPath(uri, path);
};
