import * as vscode from "vscode";
import { getFileUri } from "./get-file-uri";

export const getConfiguredFilesUri = (
  workspaceUri: vscode.Uri,
  filePath: string[],
) =>
  filePath.flatMap((path) => {
    const uri = getFileUri(workspaceUri, path);

    return uri ? [uri] : [];
  });
