import ts from "typescript";

import fs from "node:fs";
import path from "node:path";

const fixedLength =
  /(?:^|[^\w-])(-?\d*\.?\d+)(?:px|rem|em|pt|pc|cm|mm|in|q)\b/gi;
const hasFixedLength = (value: string) =>
  [...value.matchAll(fixedLength)].some((match) => Number(match[1]) !== 0);
const heightProperties = new Set([
  "height",
  "minHeight",
  "maxHeight",
  "blockSize",
  "minBlockSize",
  "maxBlockSize",
]);

function fixedHeights(source: string, filename: string): string[] {
  const file = ts.createSourceFile(
    filename,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const violations: string[] = [];
  function visit(node: ts.Node) {
    if (
      ts.isPropertyAssignment(node) &&
      heightProperties.has(node.name.getText(file).replace(/['"]/g, ""))
    ) {
      const value = node.initializer;
      if (
        ((ts.isStringLiteral(value) ||
          ts.isNoSubstitutionTemplateLiteral(value)) &&
          hasFixedLength(value.text)) ||
        (ts.isTemplateExpression(value) &&
          [value.head, ...value.templateSpans.map((span) => span.literal)].some(
            (literal) => hasFixedLength(literal.text),
          )) ||
        (ts.isNumericLiteral(value) && Number(value.text) !== 0)
      ) {
        const { line } = file.getLineAndCharacterOfPosition(
          node.getStart(file),
        );
        violations.push(`${filename}:${line + 1}: ${node.getText(file)}`);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  return violations;
}

function sourceFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return sourceFiles(filename);
    }
    return /\.[jt]sx?$/.test(filename) &&
      !/\.(test|spec)\.[jt]sx?$/.test(filename)
      ? [filename]
      : [];
  });
}

test("fixed heights use sizing tokens throughout application source", () => {
  const root = path.join(process.cwd(), "src");
  const violations = sourceFiles(root)
    .filter(
      (filename) =>
        filename !== path.join(root, "components", "theme", "sizingTokens.ts"),
    )
    .flatMap((filename) =>
      fixedHeights(
        fs.readFileSync(filename, "utf8"),
        path.relative(process.cwd(), filename),
      ),
    );
  expect(violations).toEqual([]);
});

test("the audit catches fixed heights in nested and inline styles", () => {
  expect(
    fixedHeights(
      `const styles = { height: "36px", "@media": { minHeight: 44 } };
    const view = <div style={{ maxHeight: "calc(200px + 1rem)" }} />;
    const template = { height: \`32px\`, maxHeight: \`calc(\${sizing.control} + 2px)\` };`,
      "fixture.tsx",
    ),
  ).toHaveLength(5);
});

test("the audit allows tokens, intrinsic layout, zero, and image dimensions", () => {
  expect(
    fixedHeights(
      `const styles = { height: sizing.control, minHeight: 0,
    maxHeight: "100%", blockSize: "auto", lineHeight: "20px", height: "0px" };
    const image = <img height={200} />;`,
      "fixture.tsx",
    ),
  ).toEqual([]);
});
