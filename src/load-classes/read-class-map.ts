import * as vscode from "vscode";
import { ClassInfo } from "./ClassInfo";

export const readFileJson = async <T>(uri: vscode.Uri) => {
  const bytes = await vscode.workspace.fs.readFile(uri);
  const text = new TextDecoder("utf-8").decode(bytes);

  return JSON.parse(text) as T;
};
