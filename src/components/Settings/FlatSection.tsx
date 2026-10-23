import type { ReactNode } from "react";

import styles from "./Settings.module.css";
import layout from "./SettingsLayout.module.css";

export function Section({
  value,
  title,
  icon,
  children,
}: {
  value: string;
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={layout.section} aria-labelledby={`settings-${value}`}>
      <h2 id={`settings-${value}`} className={layout.heading}>
        <span aria-hidden>{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function SettingItem({
  label,
  description,
  children,
  fullWidth = false,
}: {
  label: string;
  description: string;
  children: ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={`${styles.settingItem} ${layout.item} ${fullWidth ? styles.settingItemFullWidth : ""}`}
    >
      <div className={styles.settingInfo}>
        <div className={styles.settingLabel}>{label}</div>
        <div className={styles.settingDescription}>{description}</div>
      </div>
      <div
        className={
          fullWidth ? styles.settingControlFullWidth : styles.settingControl
        }
      >
        {children}
      </div>
    </div>
  );
}
