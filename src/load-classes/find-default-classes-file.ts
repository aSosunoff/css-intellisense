import * as vscode from "vscode";

export const findDefaultClassesFile = async (fileName: string) => {
  if (fileName) {
    const files = await vscode.workspace.findFiles(
      `**/${fileName}`,
      "**/{node_modules,dist,.git}/**",
      1,
    );

    return files[0];
  }
};
