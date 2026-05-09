import { getConfiguredFileUri } from "./get-configured-file-uri";

export const getConfiguredFilesUri = (filePath: string[]) =>
  filePath.flatMap((path) => {
    const uri = getConfiguredFileUri(path);

    return uri ? [uri] : [];
  });
