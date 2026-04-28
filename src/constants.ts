import classes from "./classes.json";

type ClassInfo = {
  description: string;
  css: string;
};

export const CLASS_MAP = classes as Record<string, ClassInfo>;
export const LANGUAGES = ["html", "vue", "javascriptreact", "typescriptreact"];
export const TRIGGER_CHARACTERS = [
  " ",
  '"',
  "'",
  ...Array.from(
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_",
  ),
];
