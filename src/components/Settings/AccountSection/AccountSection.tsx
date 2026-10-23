import * as React from 'react';
import { Button, tokens, Text, Avatar } from '@fluentui/react-components';
import { PersonAccounts24Regular } from '@fluentui/react-icons';
import { makeStyles } from '@griffel/react';
import { signOut, useSession } from 'next-auth/react';

import { accountSectionId } from '../constants';
import { useSettingsSection } from '../context';
import { SettingsSection, SettingItem } from '../SettingShared';

const useStyles = makeStyles({
  profileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  email: {
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase200,
  },
  dangerZone: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '12px',
  },
  dangerTitle: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    margin: 0,
  },
  dangerDescription: {
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase200,
    margin: 0,
  },
  dangerButton: {
    backgroundColor: tokens.colorPaletteRedBackground3,
    color: tokens.colorNeutralForegroundInverted,
    '&:hover': {
      backgroundColor: tokens.colorPaletteRedBackground3,
    },
    '&:active': {
      backgroundColor: tokens.colorPaletteRedBackground3,
    },
  },
});

const sectionKeywords = ['account', 'profile', 'user', 'settings'];
const profileKeywords = ['profile information', 'info', 'user', 'name', 'email', 'avatar'];
const signOutKeywords = ['sign out', 'logout', 'log out', 'exit'];
const recentsKeywords = ['recently viewed', 'history', 'clear recently viewed', 'viewed recipes'];
const dangerKeywords = ['delete', 'remove', 'account', 'danger'];

export const AccountSection: React.FC = () => {
  const styles = useStyles();
  const { data: session } = useSession();
  const user = session?.user;

  const [isClearing, setIsClearing] = React.useState(false);

  const { isVisible, searchTerm } = useSettingsSection(accountSectionId, [
    ...sectionKeywords,
    ...profileKeywords,
    ...signOutKeywords,
    ...recentsKeywords,
    ...dangerKeywords,
  ]);

  const sectionMatches = !searchTerm || sectionKeywords.some(k => k.includes(searchTerm));
  const profileItemMatches = !searchTerm || profileKeywords.some(k => k.includes(searchTerm));
  const signOutItemMatches = !searchTerm || signOutKeywords.some(k => k.includes(searchTerm));
  const recentsItemMatches = !searchTerm || recentsKeywords.some(k => k.includes(searchTerm));
  const dangerItemMatches = !searchTerm || dangerKeywords.some(k => k.includes(searchTerm));

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const clearRecents = async () => {
    if (!confirm('Are you sure you want to clear your recently viewed recipes?')) {
      return;
    }

    setIsClearing(true);
    try {
      const response = await fetch('/api/recentlyViewed', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear recently viewed');
      }

      alert('Successfully cleared recently viewed recipes');
    } catch (error) {
      console.error(error);
      alert('Failed to clear recently viewed recipes');
    } finally {
      setIsClearing(false);
    }
  };

  if (searchTerm && !isVisible) {
    return null;
  }

  return (
    <SettingsSection itemValue={accountSectionId} title="Account" icon={<PersonAccounts24Regular />}>
      {(!searchTerm || profileItemMatches || sectionMatches) && user && (
        <div className={styles.profileInfo}>
          <Avatar name={user.name ?? undefined} image={{ src: user.image ?? undefined }} size={48} color="colorful" />
          <div className={styles.userDetails}>
            <Text weight="semibold">{user.name}</Text>
            <Text className={styles.email}>{user.email}</Text>
          </div>
        </div>
      )}

      {(!searchTerm || signOutItemMatches || sectionMatches) && (
        <SettingItem label="Sign Out" description="Log out of your BookCook account.">
          <Button onClick={handleSignOut}>Sign Out</Button>
        </SettingItem>
      )}

      {(!searchTerm || recentsItemMatches || sectionMatches) && (
        <SettingItem label="Clear Recently Viewed" description="Remove all recipes from your recently viewed list.">
          <Button onClick={clearRecents} disabled={isClearing}>
            {isClearing ? 'Clearing...' : 'Clear Recently Viewed'}
          </Button>
        </SettingItem>
      )}

      {(!searchTerm || dangerItemMatches || sectionMatches) && (
        <div className={styles.dangerZone}>
          <h2 className={styles.dangerTitle}>Danger Zone</h2>
          <p className={styles.dangerDescription}>Deleting your account cannot be undone.</p>
          <Button className={styles.dangerButton} onClick={() => alert('This feature is not yet implemented')}>
            Delete Account
          </Button>
        </div>
      )}
    </SettingsSection>
  );
};
