import { ClassInfo } from "./ClassInfo";

export type WithSourceFileName<T extends ClassInfo> = T & {
  sourceFileName: string;
};
