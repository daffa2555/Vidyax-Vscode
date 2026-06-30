#!/usr/bin/env bash
# Installs the Vidyax VS Code extension by copying it into the extensions folder.
# Usage: bash install.sh
set -e

SRC="$(cd "$(dirname "$0")" && pwd)"
NAME="nadev.vidyax-0.0.1"

# Detect VS Code or VSCodium (OSS) extensions dir
if [ -d "$HOME/.vscode/extensions" ]; then
  DEST="$HOME/.vscode/extensions/$NAME"
elif [ -d "$HOME/.vscode-oss/extensions" ]; then
  DEST="$HOME/.vscode-oss/extensions/$NAME"
else
  mkdir -p "$HOME/.vscode/extensions"
  DEST="$HOME/.vscode/extensions/$NAME"
fi

rm -rf "$DEST"
mkdir -p "$DEST"
cp -r "$SRC/package.json" "$SRC/language-configuration.json" "$SRC/syntaxes" "$DEST/"
[ -f "$SRC/README.md" ] && cp "$SRC/README.md" "$DEST/" || true

echo "Installed Vidyax extension -> $DEST"
echo "Now reload VS Code: Ctrl+Shift+P -> 'Developer: Reload Window' (or restart it)."
echo "Open any .vx file to see the highlighting."
