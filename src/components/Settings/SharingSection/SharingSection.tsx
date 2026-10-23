import { useState } from "react";
import { UsersIcon } from "@phosphor-icons/react";

import { Section, SettingItem } from "../FlatSection";
import styles from "../Settings.module.css";

import { useDeleteSharedUser } from "../../../clientToServer/delete/useDeleteSharedUser";
import { useSharedUsers } from "../../../clientToServer/fetch/useSharedUsers";
import { useShareWithUser } from "../../../clientToServer/post/useShareWithUser";
import { Avatar } from "../../Avatar";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SharingSection() {
  const [shareEmail, setShareEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [shareError, setShareError] = useState("");
  const { data: sharedUsers = [], isLoading: isLoadingUsers } =
    useSharedUsers();
  const { mutate: addUser, isPending: isAdding } = useShareWithUser();
  const { mutate: removeUser, isPending: isRemoving } = useDeleteSharedUser();

  const handleShare = () => {
    setEmailError("");
    setShareError("");
    if (!shareEmail || isAdding) {
      return;
    }
    if (!EMAIL_RE.test(shareEmail)) {
      setEmailError("Enter a valid email address.");
      return;
    }
    addUser(shareEmail, {
      onSuccess: () => setShareEmail(""),
      onError: (error) =>
        setShareError(
          error instanceof Error
            ? error.message
            : "Failed to share. Please try again.",
        ),
    });
  };

  const handleRemove = (email: string) => {
    removeUser(email, {
      onError: (error) =>
        setShareError(
          error instanceof Error
            ? error.message
            : "Failed to remove access. Please try again.",
        ),
    });
  };

  return (
    <Section value="sharing" title="Sharing" icon={<UsersIcon size={18} />}>
      <SettingItem
        label="Share with Another User"
        description="Enter an email address to share your recipe book."
        fullWidth
      >
        <div className={styles.shareRow}>
          <input
            aria-label="Share with Another User"
            className={styles.shareInput}
            type="email"
            placeholder="user@example.com"
            value={shareEmail}
            onChange={(event) => {
              setShareEmail(event.target.value);
              setEmailError("");
              setShareError("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleShare();
              }
            }}
            disabled={isAdding}
            aria-invalid={Boolean(emailError)}
          />
          <button
            className={styles.btn}
            onClick={handleShare}
            disabled={!shareEmail || isAdding}
          >
            {isAdding ? "Sharing…" : "Share"}
          </button>
        </div>
        {emailError && (
          <div role="alert" className={styles.errorText}>
            {emailError}
          </div>
        )}
        {shareError && (
          <div role="alert" className={styles.errorText}>
            {shareError}
          </div>
        )}
        <div className={styles.sharedUsersList}>
          {isLoadingUsers ? (
            <div className={styles.emptyState}>Loading…</div>
          ) : sharedUsers.length === 0 ? (
            <div className={styles.emptyState}>
              {"You haven't shared your recipes with anyone yet."}
            </div>
          ) : (
            sharedUsers.map((email) => (
              <div key={email} className={styles.sharedUserItem}>
                <div className={styles.sharedUserInfo}>
                  <Avatar name={email.split("@")[0]} size="sm" />
                  {email}
                </div>
                <button
                  className={`${styles.btn} ${styles.btnDanger}`}
                  onClick={() => handleRemove(email)}
                  disabled={isRemoving}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </SettingItem>
    </Section>
  );
}
