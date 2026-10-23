import { Editor } from '@tiptap/react';
import DOMPurify from 'dompurify';

import { getEditorExtensions } from './getEditorExtensions';

describe('recipe editor task lists', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = new Editor({ extensions: getEditorExtensions('Write a recipe') });
  });

  afterEach(() => editor.destroy());

  const typeText = (text: string): void => {
    for (const character of text) {
      const { from, to } = editor.state.selection;
      const handled = editor.view.someProp('handleTextInput', handler => handler(editor.view, from, to, character));
      if (!handled) {
        editor.commands.insertContent(character);
      }
    }
  };

  it.each(['[] ', '[ ] '])('creates an unchecked task from %j', prefix => {
    typeText(prefix);
    expect(editor.getJSON().content?.[0]).toMatchObject({
      type: 'taskList',
      content: [{ type: 'taskItem', attrs: { checked: false } }],
    });
  });

  it('creates a checked task from [x]', () => {
    typeText('[x] ');
    expect(editor.getJSON().content?.[0]).toMatchObject({
      type: 'taskList',
      content: [{ type: 'taskItem', attrs: { checked: true } }],
    });
  });

  it.each(['[]', 'mix [] ', '[a] '])('preserves non-shortcut text %j', text => {
    typeText(text);
    expect(editor.getJSON().content?.[0]?.type).toBe('paragraph');
    expect(editor.getText()).toBe(text);
  });

  it.each([
    ['- ', 'bulletList'],
    ['- [ ] ', 'bulletList'],
    ['1. ', 'orderedList'],
    ['# ', 'heading'],
  ])('preserves the %j shortcut', (prefix, type) => {
    typeText(prefix);
    expect(editor.getJSON().content?.[0]?.type).toBe(type);
  });

  it('retains task content and checked states through sanitized HTML', () => {
    editor.commands.setContent(
      '<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p>Chop</p></li>' +
        '<li data-type="taskItem" data-checked="true"><p><strong>Cook</strong></p></li></ul>',
    );
    const saved = DOMPurify.sanitize(editor.getHTML());
    editor.commands.clearContent();
    editor.commands.setContent(saved);
    expect(editor.getJSON().content?.[0]).toMatchObject({
      type: 'taskList',
      content: [
        { type: 'taskItem', attrs: { checked: false } },
        { type: 'taskItem', attrs: { checked: true } },
      ],
    });
    expect(editor.getHTML()).toContain('<strong>Cook</strong>');
    expect(editor.getText()).toContain('Chop');
  });
});
