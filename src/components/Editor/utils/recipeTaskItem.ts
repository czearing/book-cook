import { TaskItem } from '@tiptap/extension-task-item';
import type { NodeViewRenderer } from '@tiptap/react';

/** Keep Tiptap's task behavior while naming each native checkbox for assistive technology. */
export const RecipeTaskItem = TaskItem.extend({
  addNodeView(): NodeViewRenderer {
    const createNodeView = this.parent?.();
    if (!createNodeView) {
      throw new Error('TaskItem must provide a node view');
    }

    return props => {
      const nodeView = createNodeView(props);
      if (!(nodeView.dom instanceof HTMLElement)) {
        throw new Error('TaskItem must render an HTML element');
      }
      const checkbox = nodeView.dom.querySelector('input[type="checkbox"]');
      if (!checkbox) {
        throw new Error('TaskItem must render a checkbox');
      }
      checkbox.setAttribute('aria-label', props.node.textContent || 'New task');

      return {
        ...nodeView,
        // Accessible-name changes must not cause ProseMirror to rebuild the input.
        ignoreMutation: mutation =>
          (mutation.type !== 'selection' && checkbox.contains(mutation.target)) ||
          (nodeView.ignoreMutation?.(mutation) ?? false),
        update: (node, decorations, innerDecorations) => {
          const updated = nodeView.update?.(node, decorations, innerDecorations) ?? false;
          if (updated) {
            checkbox.setAttribute('aria-label', node.textContent || 'New task');
          }
          return updated;
        },
      };
    };
  },
});
