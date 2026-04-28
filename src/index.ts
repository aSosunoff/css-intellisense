import * as vscode from "vscode";
import { LANGUAGES, TRIGGER_CHARACTERS } from "./constants";
import { getClassList, getUsedClasses } from "./extract";
import { loadClasses } from "./load-classes";
import { classRegistry } from "./class-registry";

export function activate(context: vscode.ExtensionContext) {
  loadClasses(context);

  const completionProvider = vscode.languages.registerCompletionItemProvider(
    LANGUAGES,
    {
      provideCompletionItems(document, position) {
        const classList = getClassList(document, position);

        if (!classList) return undefined;

        const usedClasses = getUsedClasses(classList);

        const { classMap, sourceLabel } = classRegistry.getSnapshot();

        return Object.entries(classMap)
          .filter(([className]) => !usedClasses.has(className))
          .map(([className, { css, description }]) => {
            const item = new vscode.CompletionItem(
              className,
              vscode.CompletionItemKind.Value,
            );

            item.detail = sourceLabel;
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

      const { classMap, sourceLabel } = classRegistry.getSnapshot();
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

      if (sourceLabel) {
        markdown.unshift(...[`**.${sourceLabel}**`, ""]);
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
        loadClasses(context);
      }
    },
  );

  context.subscriptions.push(
    completionProvider,
    hoverProvider,
    configChangeProvider,
  );
}

export function deactivate() {}
