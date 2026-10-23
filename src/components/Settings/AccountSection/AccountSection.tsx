import { useState } from "react";
import { UserIcon } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession, signOut } from "next-auth/react";

import { Section, SettingItem } from "../FlatSection";
import styles from "../Settings.module.css";
import layout from "../SettingsLayout.module.css";

import { Avatar } from "../../Avatar";

export function AccountSection() {
  const { data: session } = useSession();
  const user = session?.user;
  const queryClient = useQueryClient();
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState("");

  const handleClearRecents = async () => {
    if (!confirm("Clear your recently viewed recipes?")) {
      return;
    }
    setIsClearing(true);
    setError("");
    try {
      const response = await fetch("/api/user/recentlyViewed", {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to clear history. Please try again.");
      }
      await queryClient.invalidateQueries({ queryKey: ["recentlyViewed"] });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Failed to clear history. Please try again.",
      );
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Section value="account" title="Account" icon={<UserIcon size={18} />}>
      <SettingItem
        label="Profile"
        description="Your account details."
        fullWidth
      >
        {user && (
          <div className={layout.profile}>
            <Avatar
              name={user.name ?? "Account"}
              imageURL={user.image ?? undefined}
              size="sm"
            />
            <div className={styles.profileName}>{user.name}</div>
            <div className={styles.profileEmail}>{user.email}</div>
          </div>
        )}
      </SettingItem>
      <SettingItem
        label="Recently Viewed"
        description="Remove all recipes from your recently viewed list."
      >
        <button
          className={styles.btn}
          onClick={handleClearRecents}
          disabled={isClearing}
        >
          {isClearing ? "Clearing..." : "Clear History"}
        </button>
      </SettingItem>
      {error && (
        <p role="alert" className={styles.errorText}>
          {error}
        </p>
      )}
      <SettingItem
        label="Sign Out"
        description="Log out of your Book Cook account."
      >
        <button
          className={styles.btn}
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Sign Out
        </button>
      </SettingItem>
      <SettingItem label="Danger Zone" description="">
        <div className={styles.dangerZone}>
          <p className={styles.dangerTitle}>Delete Account</p>
          <p className={styles.dangerDescription}>
            Permanently delete your account and all data. This cannot be undone.
          </p>
          <button
            className={`${styles.btn} ${styles.btnDanger}`}
            onClick={() => alert("Account deletion is not yet available.")}
          >
            Delete Account
          </button>
        </div>
      </SettingItem>
    </Section>
  );
}
