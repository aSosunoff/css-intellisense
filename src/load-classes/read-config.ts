import * as vscode from "vscode";
import { readFileJson } from "./read-class-map";
import { fileExists } from "./file-exists";

export const readConfig = async <T>(configUri: vscode.Uri) => {
  const hasFile = await fileExists(configUri);

  if (!hasFile) return;

  const config = await readFileJson<T>(configUri);

  return config;
};
