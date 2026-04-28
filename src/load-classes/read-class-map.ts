import * as vscode from "vscode";
import { ClassInfo } from "./ClassInfo";

export const readClassMap = async (uri: vscode.Uri) => {
  const bytes = await vscode.workspace.fs.readFile(uri);
  const text = new TextDecoder("utf-8").decode(bytes);

  return JSON.parse(text) as Record<string, ClassInfo>;
};
