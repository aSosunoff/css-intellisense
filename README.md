<p align="center">
  <img src="./assets/icon.svg" width="120" />
</p>

<h1 align="center">CSS IntelliSense</h1>

<p align="center">
VS Code extension for autocompleting CSS utility classes from a JSON class map.
</p>

---

The extension suggests classes inside `class`, `className`, `:class`, and `v-bind:class` attributes, shows hover documentation for known classes, and does not suggest classes that are already used in the current class list.

## Requirements

- Node.js and npm for local development and packaging.
- A class map JSON file in the workspace, or the bundled fallback classes from `src/classes.json`.

## Supported Files

The extension activates in:

- HTML
- Vue
- React JSX
- React TSX

Supported attribute examples:

```html
<div class="bg-white font-size-5"></div>
<div :class="{ 'bg-white': isActive }"></div>
<div v-bind:class="{ 'font-size-5': isLarge }"></div>
```

```tsx
<div className="bg-white font-size-5" />
<div className={{ "bg-white": isActive }} />
```

## Class Map Format

Create a JSON file with class names as keys. Each class must contain:

- `description`: text shown in completion and hover documentation.
- `css`: CSS declaration shown in the documentation block.

Example `classes.json`:

```json
{
  "bg-white": {
    "description": "White background color.",
    "css": "background: white;"
  },
  "font-size-5": {
    "description": "Sets font size to 20px.",
    "css": "font-size: 20px;"
  }
}
```

## Configuration

The extension can load classes in three ways:

1. If `cssIntellisense.classesFilePath` is set, it loads that file.
2. Otherwise it searches the workspace for a file named by `cssIntellisense.classesFileName`.
3. If no file is found or the file cannot be read, it uses bundled classes from `src/classes.json`.

Settings:

```json
{
  "cssIntellisense.classesFileName": "classes.json",
  "cssIntellisense.classesFilePath": ""
}
```

`cssIntellisense.classesFilePath` can be relative to the workspace root or absolute.

Example with a custom file:

```json
{
  "cssIntellisense.classesFilePath": "config/css-classes.json"
}
```

## Installation For Development

Install dependencies:

```sh
npm install
```

Compile the extension:

```sh
npm run compile
```

Open this repository in VS Code, then press `F5` to start an Extension Development Host. Open an HTML, Vue, JSX, or TSX file there and type inside a supported class attribute.

## Using The Extension

1. Add `classes.json` to your workspace root, or configure `cssIntellisense.classesFilePath`.
2. Open a supported file type.
3. Type inside `class`, `className`, `:class`, or `v-bind:class`.
4. Use completion suggestions to insert a class.
5. Hover over a known class to see its description and CSS declaration.

The class map is reloaded automatically when `cssIntellisense` settings change. If you edit the JSON file itself, reload the VS Code window to force the extension to read the updated file.

## Packaging

To build a VSIX package, install `vsce` if needed:

```sh
npm install -g @vscode/vsce
```

Then package the extension:

```sh
vsce package
```

Install the generated `.vsix` file in VS Code through `Extensions: Install from VSIX...`.
