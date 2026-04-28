import * as vscode from "vscode";
import classes from "./classes.json";

type ClassInfo = {
  description: string;
  css: string;
};

const classMap = classes as Record<string, ClassInfo>;
const languages = ["html", "vue", "javascriptreact", "typescriptreact"];
const triggerCharacters = [
  " ",
  '"',
  "'",
  ...Array.from(
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_",
  ),
];

function findLastMatch(text: string, pattern: RegExp) {
  let lastMatch: RegExpExecArray | undefined;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    lastMatch = match;
  }

  return lastMatch;
}

function getClassExpression(
  document: vscode.TextDocument,
  position: vscode.Position,
) {
  const documentText = document.getText();
  const cursorOffset = document.offsetAt(position);
  const textBeforeCursor = documentText.slice(0, cursorOffset);

  const doubleQuoteMatch = textBeforeCursor.match(
    /(?:class|:class|v-bind:class|className)\s*=\s*"([^"]*)$/,
  );
  const singleQuoteMatch = textBeforeCursor.match(
    /(?:class|:class|v-bind:class|className)\s*=\s*'([^']*)$/,
  );
  const match = doubleQuoteMatch ?? singleQuoteMatch;

  if (match) {
    const quote = doubleQuoteMatch ? '"' : "'";
    const textAfterCursor = documentText.slice(cursorOffset);
    const closingQuoteIndex = textAfterCursor.indexOf(quote);
    const valueAfterCursor =
      closingQuoteIndex === -1
        ? textAfterCursor
        : textAfterCursor.slice(0, closingQuoteIndex);

    return `${match[1]}${valueAfterCursor}`;
  }

  const bindingStartMatch = findLastMatch(
    textBeforeCursor,
    /(?::class|v-bind:class)\s*=\s*\{/g,
  );

  if (!bindingStartMatch || bindingStartMatch.index === undefined) {
    return undefined;
  }

  const expressionStart = bindingStartMatch.index + bindingStartMatch[0].length;
  const textAfterCursor = documentText.slice(cursorOffset);
  const expressionBeforeCursor = documentText.slice(
    expressionStart,
    cursorOffset,
  );
  const closingBraceIndex = textAfterCursor.indexOf("}");
  const expressionAfterCursor =
    closingBraceIndex === -1
      ? textAfterCursor
      : textAfterCursor.slice(0, closingBraceIndex);

  return `${expressionBeforeCursor}${expressionAfterCursor}`;
}

function getUsedClasses(classExpression: string) {
  const usedClasses = new Set<string>();

  for (const className of classExpression.trim().split(/\s+/).filter(Boolean)) {
    usedClasses.add(className);
  }

  for (const match of classExpression.matchAll(/["']([^"']+)["']/g)) {
    for (const className of match[1].trim().split(/\s+/).filter(Boolean)) {
      usedClasses.add(className);
    }
  }

  return usedClasses;
}

export function activate(context: vscode.ExtensionContext) {
  const completionProvider = vscode.languages.registerCompletionItemProvider(
    languages,
    {
      provideCompletionItems(document, position) {
        const classExpression = getClassExpression(document, position);

        if (classExpression === undefined) {
          return undefined;
        }

        const usedClasses = getUsedClasses(classExpression);

        return Object.entries(classMap)
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
    ...triggerCharacters,
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
