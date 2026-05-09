import * as vscode from "vscode";
import { CONFIG_NAME, LANGUAGES, TRIGGER_CHARACTERS } from "./constants";
import { getClassList, getUsedClasses } from "./extract";
import { ClassInfo, loadClasses } from "./load-classes";
import { getFileName } from "./load-classes/get-file-name";
import { WithSourceFileName } from "./load-classes";

export function activate(context: vscode.ExtensionContext) {
  let classMap: Record<string, WithSourceFileName<ClassInfo>> = {};

  const runLoadingClasses = async () => {
    const data = await loadClasses();

    classMap = data ? data : {};
  };

  runLoadingClasses();

  const completionProvider = vscode.languages.registerCompletionItemProvider(
    LANGUAGES,
    {
      provideCompletionItems(document, position) {
        const classList = getClassList(document, position);

        if (classList === null) return undefined;

        const usedClasses = getUsedClasses(classList);

        return Object.entries(classMap)
          .filter(([className]) => !usedClasses.has(className))
          .map(([className, { css, description, sourceFileName }]) => {
            const item = new vscode.CompletionItem(
              className,
              vscode.CompletionItemKind.Value,
            );

            item.detail = sourceFileName;
            item.sortText = `!${className}`;
            item.documentation = new vscode.MarkdownString(
              [
                description,
                "```css",
                `.${className} {`,
                `  ${css}`,
                `}`,
                "```",
              ].join("\n"),
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
      const info = classMap[className];

      if (!info) {
        return undefined;
      }

      const markdown = [
        info.description,
        "",
        "```css",
        `.${className} {`,
        `  ${info.css}`,
        `}`,
        "```",
      ];

      if (info.sourceFileName) {
        markdown.unshift(...[`**${info.sourceFileName}**`, ""]);
      }

      return new vscode.Hover(
        new vscode.MarkdownString(markdown.join("\n")),
        range,
      );
    },
  });

  const configChangeProvider = vscode.workspace.onDidChangeConfiguration(
    (event) => {
      if (event.affectsConfiguration("cssIntellisense")) {
        runLoadingClasses();
      }
    },
  );

  const configSaveTextDocumentProvider = vscode.workspace.onDidSaveTextDocument(
    (event) => {
      if (getFileName(event.fileName) === CONFIG_NAME) {
        runLoadingClasses();
      }
    },
  );

  context.subscriptions.push(
    completionProvider,
    hoverProvider,
    configChangeProvider,
    configSaveTextDocumentProvider,
  );
}

export function deactivate() {}
