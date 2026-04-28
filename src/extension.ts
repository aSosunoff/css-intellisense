import * as vscode from "vscode";
import { CLASS_MAP, LANGUAGES, TRIGGER_CHARACTERS } from "./constants";
import { getClassList } from "./get-class-list";

function getUsedClasses(classList: string) {
  const usedClasses = new Set<string>();

  for (const className of classList.trim().split(/\s+/).filter(Boolean)) {
    usedClasses.add(className);
  }

  for (const match of classList.matchAll(/["']([^"']+)["']/g)) {
    for (const className of match[1].trim().split(/\s+/).filter(Boolean)) {
      usedClasses.add(className);
    }
  }

  return usedClasses;
}

export function activate(context: vscode.ExtensionContext) {
  const completionProvider = vscode.languages.registerCompletionItemProvider(
    LANGUAGES,
    {
      provideCompletionItems(document, position) {
        const classList = getClassList(document, position);

        if (!classList) return undefined;

        const usedClasses = getUsedClasses(classList);

        return Object.entries(CLASS_MAP)
          .filter(([className]) => !usedClasses.has(className))
          .map(([className, info]) => {
            const item = new vscode.CompletionItem(
              className,
              vscode.CompletionItemKind.Value,
            );

            item.detail = info.description;
            item.sortText = `!${className}`;
            item.documentation = new vscode.MarkdownString(
              ["```css", `.${className} {`, `  ${info.css}`, `}`, "```"].join(
                "\n",
              ),
            );

            return item;
          });
      },
    },
    ...TRIGGER_CHARACTERS,
  );

  const hoverProvider = vscode.languages.registerHoverProvider(LANGUAGES, {
    provideHover(document, position) {
      const range = document.getWordRangeAtPosition(position, /[A-Za-z0-9_-]+/);

      if (!range) {
        return undefined;
      }

      const className = document.getText(range);
      const info = CLASS_MAP[className];

      if (!info) {
        return undefined;
      }

      return new vscode.Hover(
        new vscode.MarkdownString(
          [
            `**.${className}**`,
            "",
            info.description,
            "",
            "```css",
            `.${className} {`,
            `  ${info.css}`,
            `}`,
            "```",
          ].join("\n"),
        ),
        range,
      );
    },
  });

  context.subscriptions.push(completionProvider, hoverProvider);
}

export function deactivate() {}
