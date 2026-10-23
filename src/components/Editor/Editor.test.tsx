import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { Editor } from './Editor';

const taskHTML = '<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p>Chop onions</p></li></ul>';

describe('recipe editor checkboxes', () => {
  it('reports checked HTML when a named checkbox is toggled', async () => {
    const onChange = jest.fn();
    render(<Editor value={taskHTML} onChange={onChange} />);
    const checkbox = await screen.findByRole('checkbox', {
      name: 'Chop onions',
    });
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);

    await waitFor(() => expect(checkbox).toBeChecked());
    expect(onChange).toHaveBeenLastCalledWith(expect.stringContaining('data-checked="true"'));
    fireEvent.click(checkbox);
    await waitFor(() => expect(checkbox).not.toBeChecked());
    expect(onChange).toHaveBeenLastCalledWith(expect.stringContaining('data-checked="false"'));
  });

  it('does not change task state or emit updates in read-only mode', async () => {
    const onChange = jest.fn();
    const { rerender } = render(<Editor value={taskHTML} onChange={onChange} readOnly />);
    const checkbox = await screen.findByRole('checkbox', {
      name: 'Chop onions',
    });
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
    expect(onChange).not.toHaveBeenCalled();

    rerender(<Editor value={taskHTML} onChange={onChange} />);
    onChange.mockClear();
    fireEvent.click(checkbox);
    await waitFor(() => expect(checkbox).toBeChecked());
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('updates accessible checkbox names and state when external content changes', async () => {
    const onChange = jest.fn();
    const { rerender } = render(<Editor value={taskHTML} onChange={onChange} />);
    await screen.findByRole('checkbox', { name: 'Chop onions' });
    rerender(
      <Editor
        value={taskHTML.replace('Chop onions', 'Cook onions').replace('data-checked="false"', 'data-checked="true"')}
        onChange={onChange}
      />,
    );
    expect(await screen.findByRole('checkbox', { name: 'Cook onions' })).toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
  });
});
