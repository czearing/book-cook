import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import {
  DotsThreeIcon,
  FloppyDiskIcon,
  ArrowCounterClockwiseIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useRouter } from "next/router";

import styles from "./RecipePageActions.module.css";
import { Button } from "../Button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../Dialog";

import { useDeleteRecipe } from "../../clientToServer/delete/useDeleteRecipe";

export type RecipePageActionStatus = "idle" | "saving" | "error";

type RecipePageActionsProps = {
  recipeId: string;
  title: string;
  isDirty: boolean;
  status: RecipePageActionStatus;
  onSave: () => void;
  onDiscard: () => void;
};

/** Page-owned recipe actions, with explicit confirmation before permanent deletion. */
export const RecipePageActions = ({
  recipeId,
  title,
  isDirty,
  status,
  onSave,
  onDiscard,
}: RecipePageActionsProps): ReactElement => {
  const router = useRouter();
  const deletion = useDeleteRecipe();
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const busy = status === "saving" || deletion.isPending;

  useEffect(() => {
    if (confirmDelete) {
      cancelRef.current?.focus();
    }
  }, [confirmDelete]);

  const handleDelete = (): void => {
    setDeleteError(null);
    deletion.mutate(recipeId, {
      onSuccess: () => {
        const onNavigationFailure = (): void => {
          setDeleteError(
            "Recipe deleted, but navigation failed. Open Recipes to continue.",
          );
        };
        void router
          .push("/recipes")
          .then((navigated) => {
            if (!navigated) {
              onNavigationFailure();
            }
          })
          .catch(onNavigationFailure);
      },
      onError: () => setDeleteError("Delete failed. Please try again."),
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen || !busy) {
          setOpen(nextOpen);
          setConfirmDelete(false);
          setDeleteError(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          aria-label="Recipe options"
          title="Recipe options"
          variant="ghost"
          shape="square"
          icon={<DotsThreeIcon size={24} aria-hidden="true" />}
        />
      </DialogTrigger>
      <DialogContent size="sm" withCloseButton={!busy} aria-busy={busy}>
        <DialogHeader>
          <DialogTitle>
            {confirmDelete ? "Delete recipe?" : "Recipe options"}
          </DialogTitle>
          <DialogDescription>
            {confirmDelete
              ? `Permanently delete "${title || "Untitled Recipe"}"? This cannot be undone.`
              : isDirty
                ? "You have unsaved changes."
                : "No unsaved changes."}
          </DialogDescription>
        </DialogHeader>
        {confirmDelete ? (
          <>
            {deleteError && <p role="alert">{deleteError}</p>}
            <DialogFooter>
              <Button
                ref={cancelRef}
                variant="secondary"
                disabled={busy}
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </Button>
              <Button
                aria-label={
                  deletion.isPending ? "Deleting recipe" : "Delete recipe"
                }
                variant="destructive"
                disabled={busy || deletion.isSuccess}
                isLoading={deletion.isPending}
                onClick={handleDelete}
              >
                {deletion.isPending ? "Deleting recipe" : "Delete recipe"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <DialogBody>
            {status === "error" && (
              <p role="alert">
                Save failed. Your changes are still here. Please try again.
              </p>
            )}
            <Button
              aria-label={
                status === "saving" ? "Saving changes" : "Save changes"
              }
              variant="primary"
              fullWidth
              startIcon={<FloppyDiskIcon aria-hidden="true" />}
              disabled={!isDirty || busy}
              isLoading={status === "saving"}
              onClick={onSave}
            >
              {status === "saving" ? "Saving changes" : "Save changes"}
            </Button>
            <Button
              variant="secondary"
              fullWidth
              startIcon={<ArrowCounterClockwiseIcon aria-hidden="true" />}
              disabled={!isDirty || busy}
              onClick={onDiscard}
            >
              Discard changes
            </Button>
            <div className={styles.dangerZone}>
              <Button
                variant="destructive"
                fullWidth
                startIcon={<TrashIcon aria-hidden="true" />}
                disabled={busy}
                onClick={() => setConfirmDelete(true)}
              >
                Delete recipe
              </Button>
            </div>
          </DialogBody>
        )}
      </DialogContent>
    </Dialog>
  );
};
