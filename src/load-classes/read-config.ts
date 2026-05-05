import * as vscode from "vscode";
import { getWorkspaceRelativeUri } from "./get-workspace-relative-uri";
import { readFileJson } from "./read-class-map";
import { fileExists } from "./file-exists";

export const readConfig = async <T>(configFileName: string) => {
  const uri = getWorkspaceRelativeUri(configFileName);

  if (!uri) return;

  const hasFile = await fileExists(uri);

  if (!hasFile) return;

  try {
    const content = await readFileJson<T>(uri);

    return content;
  } catch {
    vscode.window.showWarningMessage(
      `CSS IntelliSense: failed to read ${configFileName}`,
    );
  }
};
