# Vidyax for VS Code

Official language support for **Vidyax** — an AI-first programming language (`.vx`).

## Features
- **Syntax highlighting** for `.vx` files
- **Run button** (▶) — run your Vidyax file directly (Ctrl+Alt+R)
- **Language server** — powered by `vidyax lsp`, so the editor always matches the CLI:
  - **Live diagnostics** — errors underlined as you type
  - **Completion** — keywords, all built-in functions (with docs), and names in your file
  - **Hover** — signature and description for built-in functions
  - **Outline** — functions and top-level variables in the symbol list

## Requirements
This extension needs the **Vidyax interpreter** installed and available on your
PATH (the `vidyax` command). Without it, Run and live error checking won't work.

Install Vidyax from: https://github.com/daffa2555/Vidyax

## Usage
1. Open or create a `.vx` file
2. Write Vidyax code — errors show up live
3. Press the ▶ button (or Ctrl+Alt+R) to run

## About
Built by NaDev. Vidyax is open source: https://github.com/daffa2555/Vidyax

## Install (no build needed)

```bash
bash install.sh
```

Then reload VS Code: `Ctrl+Shift+P` -> **Developer: Reload Window** (or restart it).
Open any `.vx` file and the highlighting kicks in.

### Manual install

Copy this folder into your VS Code extensions directory:

```bash
cp -r vidyax-vscode ~/.vscode/extensions/nadev.vidyax-0.0.1
```

(For VSCodium use `~/.vscode-oss/extensions/` instead.)

## What gets highlighted

| Token            | Examples                                   |
|------------------|--------------------------------------------|
| Control keywords | if, elif, else, rpt, for, in, break, continue, return |
| Declaration      | func, use                                  |
| Logic operators  | and, or, not                               |
| Constants        | true, false, null                          |
| Built-in funcs   | print, ask, len, range, upper, split, ...  |
| AI module        | ai                                         |
| Strings/numbers  | "text", 42, 3.14                           |
| Comments         | # like this                                |

## Files

```
package.json                 # extension manifest (declares the .vx language + grammar)
language-configuration.json  # comments, brackets, indentation
syntaxes/vax.tmLanguage.json # the TextMate grammar (the actual highlighting rules)
install.sh                   # one-command installer
```

## Building from source

The language-server client needs its npm dependency installed first:

```bash
npm install          # fetches vscode-languageclient
vsce package         # builds the .vsix (bundles node_modules)
```

Grammar highlighting still works without any of this; the language-server
features (diagnostics, completion, hover) require the `vidyax` CLI on PATH.
