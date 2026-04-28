import * as vscode from "vscode";
import classes from "./classes.json";

type ClassInfo = {
  description: string;
  css: string;
};

const classMap = classes as Record<string, ClassInfo>;

export function activate(context: vscode.ExtensionContext) {
  const languages = ["vue", "html"];

  const completionProvider = vscode.languages.registerCompletionItemProvider(
    languages,
    {
      provideCompletionItems(document, position) {
        const line = document
          .lineAt(position)
          .text.slice(0, position.character);

        // Подсказываем только внутри class="..."
        if (!/class=["'][^"']*$/.test(line)) {
          return undefined;
        }

        return Object.entries(classMap).map(([className, info]) => {
          const item = new vscode.CompletionItem(
            className,
            vscode.CompletionItemKind.Value,
          );

          item.detail = info.description;
          item.documentation = new vscode.MarkdownString(
            ["```css", `.${className} {`, `  ${info.css}`, `}`, "```"].join(
              "\n",
            ),
          );

          return item;
        });
      },
    },
    " ",
    '"',
    "'",
  );

  const hoverProvider = vscode.languages.registerHoverProvider(languages, {
    provideHover(document, position) {
      const range = document.getWordRangeAtPosition(position, /[A-Za-z0-9_-]+/);

      if (!range) {
        return undefined;
      }

      const className = document.getText(range);
      const info = classMap[className];

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
