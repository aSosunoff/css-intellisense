import * as vscode from "vscode";
import { LANGUAGES, TRIGGER_CHARACTERS } from "./constants";
import { getClassList, getUsedClasses } from "./extract";
import { ClassInfo, loadClasses } from "./load-classes";
import bundledClasses from "./classes.json";

export function activate(context: vscode.ExtensionContext) {
  let classMap: Record<string, ClassInfo>;
  let sourceLabel: string = "";

  const runLoadingClasses = async () => {
    const registry = await loadClasses();

    sourceLabel = registry.sourceLabel;

    if (registry.classMap) {
      classMap = registry.classMap;
    } else {
      classMap =
        context.extensionMode === vscode.ExtensionMode.Development
          ? bundledClasses
          : {};
    }
  };

  runLoadingClasses();

  const completionProvider = vscode.languages.registerCompletionItemProvider(
    LANGUAGES,
    {
      provideCompletionItems(document, position) {
        const classList = getClassList(document, position);

        if (!classList) return undefined;

        const usedClasses = getUsedClasses(classList);

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
        runLoadingClasses();
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
