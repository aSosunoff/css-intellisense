import * as vscode from "vscode";
import { getWorkspaceRelativeUri } from "./get-workspace-relative-uri";

export const getConfiguredFileUri = (path: string) => {
  if (path) {
    return path.startsWith("/")
      ? vscode.Uri.file(path)
      : getWorkspaceRelativeUri(path);
  }
};
