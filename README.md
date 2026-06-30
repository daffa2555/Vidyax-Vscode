# Vidyax for VS Code

Syntax highlighting and editing support for the **Vidyax** programming language (`.vx`).

## Features

- Syntax highlighting: keywords, strings, numbers, comments, built-in functions, the `ai` module, function names, and assignment targets.
- Line comments with `#`.
- Auto-closing and surrounding pairs: `( )`, `[ ]`, `" "`.
- Auto-indent after a line ending with `:` (blocks).

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

## Notes

This is a declarative (grammar-only) extension, so it needs no Node.js, no npm,
and no compilation — VS Code loads it directly. To publish it to the Marketplace
later, package it with `vsce package` (requires Node.js).
