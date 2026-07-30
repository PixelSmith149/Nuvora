import fs from "fs";
import path from "path";
import { parse } from "@babel/parser";
import _traverse from "@babel/traverse";
import _generate from "@babel/generator";
import * as t from "@babel/types";

const traverse = _traverse.default || _traverse;
const generate = _generate.default || _generate;

const filePath = process.argv[2];
const namespace = process.argv[3];

if (!filePath || !namespace) {
  console.error("❌ Usage: node scripts/extract-page.mjs <file-path> <namespace>");
  process.exit(1);
}

const fullPath = path.resolve(filePath);
if (!fs.existsSync(fullPath)) {
  console.error(`❌ File not found: ${filePath}`);
  process.exit(1);
}

const code = fs.readFileSync(fullPath, "utf-8");

const ast = parse(code, {
  sourceType: "module",
  plugins: ["jsx", "typescript"],
});

const extractedKeys = {};
let hasUseTranslationsImport = false;
let componentBodyNode = null;

// Noise Guard: Filters out symbols, pure numbers, single characters, or icons
function isValidTranslatableText(text) {
  if (!text || typeof text !== "string") return false;
  const trimmed = text.trim();
  if (trimmed.length < 2) return false;                  // Skip "a", "1", "+"
  if (/^[\d\s\W]+$/.test(trimmed)) return false;          // Skip "123", "...", "✓", "©", "$100"
  if (/^https?:\/\//.test(trimmed)) return false;         // Skip URLs
  if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed)) return false; // Skip emails
  return true;
}

// Key Generator: Handles duplicates safely
function makeUniqueKey(rawText, prefix = "") {
  let clean = rawText
    .trim()
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(/\s+/)
    .slice(0, 5)
    .map((word, i) =>
      i === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join("");

  if (!clean) clean = "text";
  let finalKey = prefix ? `${prefix}_${clean}` : clean;

  let count = 1;
  while (extractedKeys[finalKey] && extractedKeys[finalKey] !== rawText.trim()) {
    finalKey = `${prefix ? `${prefix}_${clean}` : clean}_${count++}`;
  }

  return finalKey;
}

// 1. AST Traversal
traverse(ast, {
  ImportDeclaration(pathNode) {
    if (pathNode.node.source.value === "next-intl") {
      hasUseTranslationsImport = true;
    }
  },

  // FIX #1: Precise React Component Body Detection
  // Avoids locking onto helper functions or utility arrows defined at top of file
  "FunctionDeclaration|ArrowFunctionExpression|FunctionExpression"(pathNode) {
    if (componentBodyNode) return; // Already targeted main component

    const parent = pathNode.parentPath;
    const node = pathNode.node;

    // Check 1: Direct Default or Named Export
    const isExported = parent.isExportDeclaration() || parent.parentPath?.isExportDeclaration();

    // Check 2: Function name is Capitalized (React Component convention e.g., Function AccountPage)
    let isCapitalized = false;
    if (node.id && /^[A-Z]/.test(node.id.name)) {
      isCapitalized = true;
    } else if (parent.isVariableDeclarator() && t.isIdentifier(parent.node.id) && /^[A-Z]/.test(parent.node.id.name)) {
      isCapitalized = true;
    }

    if (isExported || isCapitalized) {
      if (t.isBlockStatement(node.body)) {
        componentBodyNode = node.body;
      }
    }
  },

  // JSX Direct Text extraction
  JSXElement(pathNode) {
    pathNode.get("children").forEach((child) => {
      if (child.isJSXText()) {
        const rawValue = child.node.value;
        const trimmed = rawValue.trim();

        if (!isValidTranslatableText(trimmed)) return;

        const key = makeUniqueKey(trimmed);
        extractedKeys[key] = trimmed;

        const hasLeadingSpace = /^\s/.test(rawValue);
        const hasTrailingSpace = /\s$/.test(rawValue);

        const tExpression = t.jsxExpressionContainer(
          t.callExpression(t.identifier("t"), [t.stringLiteral(key)])
        );

        const nodesToInsert = [];
        if (hasLeadingSpace) nodesToInsert.push(t.jsxText(" "));
        nodesToInsert.push(tExpression);
        if (hasTrailingSpace) nodesToInsert.push(t.jsxText(" "));

        child.replaceWithMultiple(nodesToInsert);
      }
    });
  },

  // Attributes: placeholder, title, alt, aria-label
  JSXAttribute(pathNode) {
    const attrName = pathNode.node.name.name;
    if (["placeholder", "aria-label", "title", "alt"].includes(attrName)) {
      if (t.isStringLiteral(pathNode.node.value)) {
        const text = pathNode.node.value.value.trim();
        if (isValidTranslatableText(text)) {
          const key = makeUniqueKey(text, attrName);
          extractedKeys[key] = text;

          pathNode.node.value = t.jsxExpressionContainer(
            t.callExpression(t.identifier("t"), [t.stringLiteral(key)])
          );
        }
      }
    }
  },

  // FIX #8 & #2: Handle dynamic text inside `{}` like {isAdmin ? "Admin" : "User"}
  JSXExpressionContainer(pathNode) {
    const expr = pathNode.node.expression;

    // Handle Ternary: {isSuccess ? "Saved successfully" : "Failed to save"}
    if (t.isConditionalExpression(expr)) {
      ["consequent", "alternate"].forEach((field) => {
        if (t.isStringLiteral(expr[field])) {
          const text = expr[field].value.trim();
          if (isValidTranslatableText(text)) {
            const key = makeUniqueKey(text);
            extractedKeys[key] = text;
            expr[field] = t.callExpression(t.identifier("t"), [t.stringLiteral(key)]);
          }
        }
      });
    }

    // Handle Logical expressions: {showWarning && "Warning: Check settings"}
    if (t.isLogicalExpression(expr) && t.isStringLiteral(expr.right)) {
      const text = expr.right.value.trim();
      if (isValidTranslatableText(text)) {
        const key = makeUniqueKey(text);
        extractedKeys[key] = text;
        expr.right = t.callExpression(t.identifier("t"), [t.stringLiteral(key)]);
      }
    }
  },
});

if (Object.keys(extractedKeys).length === 0) {
  console.log("⚠️ No new translatable text found in this file.");
  process.exit(0);
}

// 2. Inject next-intl Import if missing
if (!hasUseTranslationsImport) {
  ast.program.body.unshift(
    t.importDeclaration(
      [t.importSpecifier(t.identifier("useTranslations"), t.identifier("useTranslations"))],
      t.stringLiteral("next-intl")
    )
  );
}

// 3. Inject `const t = useTranslations("Namespace")` safely into main component
if (componentBodyNode) {
  const alreadyHasHook = componentBodyNode.body.some(
    (stmt) =>
      t.isVariableDeclaration(stmt) &&
      stmt.declarations.some((d) => t.isIdentifier(d.id, { name: "t" }))
  );

  if (!alreadyHasHook) {
    const hookCall = t.variableDeclaration("const", [
      t.variableDeclarator(
        t.identifier("t"),
        t.callExpression(t.identifier("useTranslations"), [t.stringLiteral(namespace)])
      ),
    ]);
    componentBodyNode.body.unshift(hookCall);
  }
}

// 4. Output refactored code
const outputCode = generate(ast, { retainLines: true }, code).code;
fs.writeFileSync(fullPath, outputCode, "utf-8");
console.log(`✅ Refactored ${filePath} with useTranslations("${namespace}")`);

// 5. Safely merge into messages/en.json preserving existing keys
const enPath = path.resolve("./messages/en.json");
let enJson = {};
if (fs.existsSync(enPath)) {
  try {
    enJson = JSON.parse(fs.readFileSync(enPath, "utf-8"));
  } catch (err) {
    console.error("⚠️ Failed to parse messages/en.json. Rebuilding structure.");
  }
}

enJson[namespace] = {
  ...(enJson[namespace] || {}),
  ...extractedKeys,
};

fs.writeFileSync(enPath, JSON.stringify(enJson, null, 2), "utf-8");
console.log(`✅ Extracted ${Object.keys(extractedKeys).length} keys to messages/en.json [${namespace}]`);