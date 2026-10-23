import * as React from "react";
import type {
  SearchBoxChangeEvent,
  InputOnChangeData,
} from "@fluentui/react-components";
import {
  SearchBox,
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  Text,
} from "@fluentui/react-components";
import * as emoji from "node-emoji";

import { useStyles } from "./ChangeEmojiDialog.styles";
import {
  DEFAULT_EMOJI,
  defaultSuggestedEmojis,
  isSingleEmoji,
} from "./emojiUtils";

export type ChangeEmojiDialogProps = {
  isOpen: boolean;
  currentEmoji: string;
  onSave: (newEmoji: string) => void;
  onClose: () => void;
};

const ChangeEmojiDialog: React.FC<ChangeEmojiDialogProps> = ({
  isOpen,
  currentEmoji,
  onSave,
  onClose,
}) => {
  const styles = useStyles();
  const [inputValue, setInputValue] = React.useState<string>("");
  const [selectedEmoji, setSelectedEmoji] =
    React.useState<string>(DEFAULT_EMOJI);
  const [displayedEmojis, setDisplayedEmojis] = React.useState<string[]>(
    defaultSuggestedEmojis,
  );
  const [isSearching, setIsSearching] = React.useState<boolean>(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const debounceTimeout = React.useRef<NodeJS.Timeout | null>(null);

  // Reset state when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      // Initialize state with memoized values to prevent unnecessary re-renders
      const initialEmoji = isSingleEmoji(currentEmoji)
        ? currentEmoji
        : DEFAULT_EMOJI;
      setSelectedEmoji(initialEmoji);
      setDisplayedEmojis(defaultSuggestedEmojis);
      setIsSearching(false);

      // Focus without timeout for faster response
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      });
    }
  }, [isOpen, currentEmoji]);

  // Handle input changes for emoji search
  const handleInputChange = (
    _e: SearchBoxChangeEvent,
    data: InputOnChangeData,
  ) => {
    const newValue = data.value;
    setInputValue(newValue);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      const trimmedValue = newValue.trim().toLowerCase();

      if (isSingleEmoji(trimmedValue)) {
        setSelectedEmoji(trimmedValue);
        setIsSearching(false);
        setDisplayedEmojis(defaultSuggestedEmojis);
      } else if (trimmedValue === "") {
        setSelectedEmoji("");
        setIsSearching(false);
        setDisplayedEmojis(defaultSuggestedEmojis);
      } else {
        setIsSearching(true);
        const searchResults = emoji.search(trimmedValue);
        setDisplayedEmojis(searchResults.map((result) => result.emoji));
      }
    }, 150);
  };

  const handleEmojiGridSelect = React.useCallback(
    (emojiChar: string) => {
      setSelectedEmoji(emojiChar);
      setIsSearching(false);

      if (isSingleEmoji(emojiChar)) {
        onSave(emojiChar);
        onClose();
      }
    },
    [onSave, onClose],
  );

  const emojiGrid = React.useMemo(() => {
    return displayedEmojis.length > 0 ? (
      <div className={styles.emojiGrid}>
        {displayedEmojis.map((emojiChar, index) => (
          <div
            key={`${emojiChar}-${index}`}
            className={`${styles.emojiButton} ${selectedEmoji === emojiChar ? styles.selectedEmoji : ""}`}
            onClick={() => handleEmojiGridSelect(emojiChar)}
            role="button"
            tabIndex={0}
            aria-label={`Select emoji ${emojiChar}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleEmojiGridSelect(emojiChar);
              }
            }}
          >
            {emojiChar}
          </div>
        ))}
      </div>
    ) : isSearching ? (
      <Text className={styles.noResultsText}>No emojis found</Text>
    ) : null;
  }, [
    displayedEmojis,
    handleEmojiGridSelect,
    isSearching,
    selectedEmoji,
    styles.emojiButton,
    styles.emojiGrid,
    styles.noResultsText,
    styles.selectedEmoji,
  ]);

  const gridTitle = isSearching
    ? `Results for "${inputValue}"`
    : "Common food emojis";

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(ev, data) => {
        ev.stopPropagation();
        return !data.open && onClose();
      }}
      modalType="modal"
      surfaceMotion={null}
    >
      <DialogSurface
        className={styles.dialogSurface}
        onClick={(ev) => {
          ev.stopPropagation();
        }}
      >
        <DialogTitle className={styles.dialogTitle}>
          Change Recipe Emoji
        </DialogTitle>
        <DialogBody className={styles.dialogBody}>
          <SearchBox
            placeholder="Filter..."
            appearance="filled-darker"
            onChange={handleInputChange}
            value={inputValue}
            ref={inputRef}
            aria-label="Recipe emoji search or selection"
            maxLength={50}
          />
          <div className={styles.gridContainer}>
            <Text className={styles.emojiSectionTitle}>{gridTitle}</Text>
            {emojiGrid}
          </div>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default ChangeEmojiDialog;
