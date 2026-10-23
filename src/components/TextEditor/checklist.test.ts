import {
  ListItemNode,
  ListNode,
  $isListNode,
  $isListItemNode,
} from "@lexical/list";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  CHECK_LIST,
} from "@lexical/markdown";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableNode, TableCellNode, TableRowNode } from "@lexical/table";
import { $getRoot, createEditor } from "lexical";

import {
  recipeTransformers,
  recipeShortcutTransformers,
} from "./textEditorConfig";

function importMarkdown(markdown: string) {
  const editor = createEditor({
    namespace: "checklist-test",
    nodes: [
      ListNode,
      ListItemNode,
      HeadingNode,
      QuoteNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      HorizontalRuleNode,
    ],
    onError: (error) => {
      throw error;
    },
  });
  editor.update(
    () => $convertFromMarkdownString(markdown, recipeTransformers),
    { discrete: true },
  );
  return editor;
}

describe("recipe checklists", () => {
  it("registers the same checklist rule for shortcuts and persistence", () => {
    expect(recipeShortcutTransformers).toContain(CHECK_LIST);
    expect(recipeTransformers).toContain(CHECK_LIST);
  });

  it.each(["[] Mix flour", "[ ] Mix flour", "- [ ] Mix flour"])(
    "imports %s as an unchecked task",
    (markdown) => {
      const editor = importMarkdown(markdown);
      editor.read(() => {
        const list = $getRoot().getFirstChild();
        expect($isListNode(list) && list.getListType()).toBe("check");
        const item = $isListNode(list) ? list.getFirstChild() : null;
        expect($isListItemNode(item) && item.getChecked()).toBe(false);
        expect($convertToMarkdownString(recipeTransformers)).toBe(
          "- [ ] Mix flour",
        );
      });
    },
  );

  it("preserves checked states across serialization and reload", () => {
    const editor = importMarkdown("- [x] Mix flour\n- [ ] Bake");
    const markdown = editor.read(() =>
      $convertToMarkdownString(recipeTransformers),
    );
    expect(markdown).toBe("- [x] Mix flour\n- [ ] Bake");
    expect(
      importMarkdown(markdown).read(() =>
        $convertToMarkdownString(recipeTransformers),
      ),
    ).toBe(markdown);
  });

  it("preserves ordinary lists and literal brackets inside paragraphs", () => {
    const editor = importMarkdown("- Flour\n- Sugar\n\nUse [] to add a task");
    expect(
      editor.read(() => $convertToMarkdownString(recipeTransformers)),
    ).toBe("- Flour\n- Sugar\n\nUse [] to add a task");
  });
});
