import * as vscode from "vscode";
import { getFileName } from "./get-file-name";
import { getContentClassesFile } from "./get-content-classes-file";
import { ClassInfo } from "./ClassInfo";
import { WithSourceFileName } from "./with-source-file-name.types";

export const getClasses = async (
  workspaceFoldersUri: vscode.Uri,
): Promise<Record<string, WithSourceFileName<ClassInfo>> | undefined> => {
  const classesFile = await getContentClassesFile(workspaceFoldersUri);

  if (!classesFile) return;

  if (classesFile.length > 0) {
    const classMapWithSourceFileName = classesFile.map(
      ({ classMap, classesFileUris }) =>
        Object.fromEntries(
          Object.entries(classMap).map(([className, data]) => [
            className,
            {
              ...data,
              sourceFileName: getFileName(classesFileUris.fsPath),
            } satisfies ClassInfo & { sourceFileName: string },
          ]),
        ),
    );

    const classMap = classMapWithSourceFileName.reduce(
      (result, prev) => ({
        ...result,
        ...prev,
      }),
      {},
    );

    return classMap;
  }
};
