import { Link } from '@tiptap/extension-link';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TaskList } from '@tiptap/extension-task-list';
import { Underline } from '@tiptap/extension-underline';
import type { Extensions } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';

import { RecipeTaskItem } from './recipeTaskItem';

export const getEditorExtensions = (placeholder: string): Extensions => [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
  }),
  Placeholder.configure({ placeholder }),
  Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
  Underline,
  TaskList,
  RecipeTaskItem,
];
