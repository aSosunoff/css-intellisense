import * as vscode from "vscode";

export const getUriFileName = (uri: vscode.Uri) =>
  uri.fsPath.split(/[\\/]/).pop() || uri.fsPath;
