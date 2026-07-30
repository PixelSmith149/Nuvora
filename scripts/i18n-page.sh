#!/usr/bin/env bash

FILE_PATH=$1
NAMESPACE=$2

if [ -z "$FILE_PATH" ] || [ -z "$NAMESPACE" ]; then
  echo "❌ Error: Missing arguments."
  echo "Usage: bash scripts/i18n-page.sh <file-path> <namespace>"
  echo "Example: bash scripts/i18n-page.sh src/app/account/page.tsx Account"
  exit 1
fi

echo "🚀 Step 1: Extracting text from $FILE_PATH into en.json..."
node scripts/extract-page.mjs "$FILE_PATH" "$NAMESPACE"

echo "🌍 Step 2: Auto-translating en.json into all target languages..."
node scripts/translate.mjs

echo "✨ All done! Page transformed and fully localized."