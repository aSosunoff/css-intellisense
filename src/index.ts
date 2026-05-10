import * as vscode from "vscode";
import { CONFIG_NAME, LANGUAGES, TRIGGER_CHARACTERS } from "./constants";
import { getClassList, getUsedClasses } from "./extract";
import { ClassInfo, getClasses } from "./load-classes";
import { getFileName } from "./load-classes/get-file-name";
import { WithSourceFileName } from "./load-classes";

export function activate(context: vscode.ExtensionContext) {
  let workspaceRecord: {
    [k: string]: Record<string, WithSourceFileName<ClassInfo>> | null;
  };

  const getClassMap = (documentUri: vscode.Uri) => {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(documentUri);

    if (!workspaceFolder) return {};

    const data = workspaceRecord[workspaceFolder.uri.fsPath];

    return data ? data : {};
  };

  const runLoadingClasses = async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (workspaceFolders) {
      const result = await Promise.allSettled(
        workspaceFolders.map(async ({ uri }) => {
          const data = await getClasses(uri);
          const classMap = data ? data : null;
          return {
            workspaceFolderPath: uri.path,
            classMap,
          };
        }),
      );

      const workspaceRecordEntries: Array<
        [string, Record<string, WithSourceFileName<ClassInfo>> | null]
      > = result.flatMap((item) =>
        item.status === "fulfilled"
          ? [[item.value.workspaceFolderPath, item.value.classMap]]
          : [],
      );

      workspaceRecord = Object.fromEntries(workspaceRecordEntries);
    }
  };

  runLoadingClasses();

  const completionProvider = vscode.languages.registerCompletionItemProvider(
    LANGUAGES,
    {
      provideCompletionItems(document, position) {
        const classList = getClassList(document, position);

        if (classList === null) return undefined;

        const usedClasses = getUsedClasses(classList);

        const classMap = getClassMap(document.uri);

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
      const classMap = getClassMap(document.uri);
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
