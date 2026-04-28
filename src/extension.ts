import * as vscode from "vscode";
import classes from "./classes.json";

type ClassInfo = {
  description: string;
  css: string;
};

const classMap = classes as Record<string, ClassInfo>;

function getClassAttributeValue(
  document: vscode.TextDocument,
  position: vscode.Position,
) {
  const documentText = document.getText();
  const cursorOffset = document.offsetAt(position);
  const textBeforeCursor = documentText.slice(0, cursorOffset);

  const doubleQuoteMatch = textBeforeCursor.match(/class\s*=\s*"([^"]*)$/);
  const singleQuoteMatch = textBeforeCursor.match(/class\s*=\s*'([^']*)$/);
  const match = doubleQuoteMatch ?? singleQuoteMatch;

  if (!match) {
    return undefined;
  }

  const quote = doubleQuoteMatch ? '"' : "'";
  const textAfterCursor = documentText.slice(cursorOffset);
  const closingQuoteIndex = textAfterCursor.indexOf(quote);
  const valueAfterCursor =
    closingQuoteIndex === -1
      ? textAfterCursor
      : textAfterCursor.slice(0, closingQuoteIndex);

  return `${match[1]}${valueAfterCursor}`;
}

function getUsedClasses(classAttributeValue: string) {
  return new Set(classAttributeValue.trim().split(/\s+/).filter(Boolean));
}

export function activate(context: vscode.ExtensionContext) {
  const languages = ["vue", "html"];

  const completionProvider = vscode.languages.registerCompletionItemProvider(
    languages,
    {
      provideCompletionItems(document, position) {
        const classAttributeValue = getClassAttributeValue(document, position);

        if (classAttributeValue === undefined) {
          return undefined;
        }

        const usedClasses = getUsedClasses(classAttributeValue);

        return Object.entries(classMap)
          .filter(([className]) => !usedClasses.has(className))
          .map(([className, info]) => {
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
