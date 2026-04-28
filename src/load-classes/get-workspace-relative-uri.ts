import * as vscode from "vscode";

export const getWorkspaceRelativeUri = (path: string) => {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

  if (workspaceFolder) {
    return vscode.Uri.joinPath(workspaceFolder.uri, path);
  }
};
