import { AccountSection } from "./AccountSection/AccountSection";
import { PreferenceSections } from "./PreferenceSections";
import styles from "./Settings.module.css";
import { SharingSection } from "./SharingSection/SharingSection";

export const SettingsPage = () => (
  <div className={styles.page}>
    <div className={styles.pageHeader}>
      <h1 className={styles.pageTitle}>Settings</h1>
      <p className={styles.pageSubtitle}>
        Manage your account and application preferences
      </p>
    </div>
    <PreferenceSections />
    <SharingSection />
    <AccountSection />
  </div>
);
