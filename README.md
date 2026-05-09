<p align="center">
  <img src="./assets/icon.png" width="120" />
</p>

<h1 align="center">CSS IntelliSense</h1>

<p align="center">
VS Code extension for autocompleting CSS utility classes from a JSON class map.
</p>

---

The extension suggests classes inside `class`, `className`, `:class`, and `v-bind:class` attributes. It also shows hover documentation for known classes and hides classes that are already used in the current class list.

## Requirements

- Node.js and npm for local development and packaging.
- A `css-intellisense-config.json` file in the workspace root.
- One or more class map JSON files referenced from `css-intellisense-config.json`.

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

Object-style class bindings are supported in quoted Vue attributes and JSX `className={{ ... }}` expressions.

## Class Map Format

Create a JSON file with class names as keys. Each value should contain:

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

Create `css-intellisense-config.json` in the workspace root:

```json
{
  "classesFilePath": ["classes.json"]
}
```

`classesFilePath` is an array of paths to class map JSON files. Paths can be relative to the workspace root or absolute POSIX-style paths.
Class maps are merged in load order, so later files override classes with the same name from earlier files.

Example with a custom file:

```json
{
  "classesFilePath": ["config/css-classes.json"]
}
```

Example with multiple custom files:

```json
{
  "classesFilePath": [
    "config/base-classes.json",
    "config/project-classes.json"
  ]
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

1. Add `css-intellisense-config.json` to your workspace root and point `classesFilePath` to one or more class map files.
2. Open a supported file type.
3. Type inside `class`, `className`, `:class`, or `v-bind:class`.
4. Use completion suggestions to insert a class.
5. Hover over a known class to see its description and CSS declaration.

The class map is reloaded automatically when `css-intellisense-config.json` is saved. If you edit a referenced class map file, reload the VS Code window to force the extension to read the updated file.

## Packaging

To build a VSIX package, install `vsce` if needed:

```sh
npm install -g @vscode/vsce
```

Then package the extension:

```sh
vsce package
```

The repository also includes `npm run pack`, which compiles, rebuilds `assets/icon.png`, and runs `vsce package`. That script requires `vsce` to be available on your `PATH` and uses `npx sharp-cli` to rebuild the icon.

Install the generated `.vsix` file in VS Code through `Extensions: Install from VSIX...`.
