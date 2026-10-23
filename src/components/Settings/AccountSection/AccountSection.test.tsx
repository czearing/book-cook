import { Accordion } from '@fluentui/react-components';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { signOut, useSession } from 'next-auth/react';

import { AccountSection } from './AccountSection';
import { SettingsSearchContext } from '../context/SettingsSearchContext';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

const renderAccount = (searchTerm = '') =>
  render(
    <SettingsSearchContext.Provider
      value={{
        searchTerm,
        addVisibleSection: jest.fn(),
        removeVisibleSection: jest.fn(),
      }}
    >
      <Accordion defaultOpenItems={['account']}>
        <AccountSection />
      </Accordion>
    </SettingsSearchContext.Provider>,
  );

describe('account settings', () => {
  beforeEach(() => {
    jest.mocked(useSession).mockReturnValue({
      data: {
        user: { name: 'Account tester', email: 'account@example.test' },
        expires: '2099-01-01',
      },
      status: 'authenticated',
      update: jest.fn(),
    });
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    jest.spyOn(window, 'confirm').mockReturnValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('shows identity without redundant profile copy', () => {
    renderAccount();
    expect(screen.getByText('Account tester')).toBeVisible();
    expect(screen.getByText('account@example.test')).toBeVisible();
    expect(screen.queryByText('Profile Information')).not.toBeInTheDocument();
    expect(screen.queryByText(/Your account details/)).not.toBeInTheDocument();
  });

  it('keeps the delete notification under a semantic danger heading', () => {
    renderAccount();
    const heading = screen.getByRole('heading', { name: 'Danger Zone' });
    const button = screen.getByRole('button', { name: 'Delete Account' });
    expect(heading.parentElement).toContainElement(button);
    fireEvent.click(button);
    expect(window.alert).toHaveBeenCalledWith('This feature is not yet implemented');
  });

  it('preserves account keyword filtering', () => {
    renderAccount('delete');
    expect(screen.getByRole('button', { name: 'Delete Account' })).toBeVisible();
    expect(screen.queryByText('account@example.test')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sign Out' })).not.toBeInTheDocument();
  });

  it('preserves profile search and hides unrelated controls', () => {
    renderAccount('email');
    expect(screen.getByText('account@example.test')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Delete Account' })).not.toBeInTheDocument();
  });

  it('hides the section for unmatched searches', () => {
    renderAccount('unrelated');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders actions safely when the session is unavailable', () => {
    jest.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    });
    renderAccount();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Out' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Delete Account' })).toBeVisible();
  });

  it('signs out with the existing home redirect', async () => {
    renderAccount();
    fireEvent.click(screen.getByRole('button', { name: 'Sign Out' }));
    await waitFor(() => expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/' }));
  });

  it('cancels history clearing without a request', () => {
    window.confirm = jest.fn(() => false);
    const fetchMock = jest.fn();
    const originalFetch = global.fetch;
    global.fetch = fetchMock;
    try {
      renderAccount();
      fireEvent.click(screen.getByRole('button', { name: 'Clear Recently Viewed' }));
      expect(fetchMock).not.toHaveBeenCalled();
    } finally {
      global.fetch = originalFetch;
    }
  });

  it.each([true, false])('preserves history clearing feedback for ok=%s', async ok => {
    const originalFetch = global.fetch;
    let finish: (response: Response) => void = () => {
      throw new Error('Fetch has not started');
    };
    const fetchMock = jest.fn(
      () =>
        new Promise<Response>(resolve => {
          finish = resolve;
        }),
    );
    global.fetch = fetchMock;
    const errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      renderAccount();
      fireEvent.click(screen.getByRole('button', { name: 'Clear Recently Viewed' }));
      expect(screen.getByRole('button', { name: 'Clearing...' })).toBeDisabled();
      expect(fetchMock).toHaveBeenCalledWith('/api/recentlyViewed', {
        method: 'DELETE',
      });
      finish({ ok } as Response);
      await waitFor(() =>
        expect(window.alert).toHaveBeenCalledWith(
          ok ? 'Successfully cleared recently viewed recipes' : 'Failed to clear recently viewed recipes',
        ),
      );
      expect(screen.getByRole('button', { name: 'Clear Recently Viewed' })).toBeEnabled();
      if (!ok) {
        expect(errorLog).toHaveBeenCalledWith(new Error('Failed to clear recently viewed'));
      }
    } finally {
      global.fetch = originalFetch;
    }
  });
});
