// The saved pools — Unit 4.3, the list on the screen.
//
// `sheet-presets` names a pool, recalls one, reorders the list and deletes a
// row. It sits behind the one disclosure, which Decision 11 of
// `docs/design/0012-settled-decisions.md` settles and section 4 of
// `docs/design/0002-screen-design.md` lists.
//
// The panel decides nothing and stores nothing. `src/settings/settings.ts`
// holds the four operations and answers a record or a refusal, and
// `src/app.tsx` writes the answer to the store.
//
// **Constraint 8 is the whole point of this file.** A preset name is text the
// player typed and storage keeps every byte of it, markup included. Every name
// here reaches the screen as a Preact child or as an attribute value, so the
// framework writes it as a text node and never as markup. No string in this
// file is escaped, stripped or trimmed either: the name the player saved is the
// name the list draws.

import { useState } from 'preact/hooks';
import type { PoolPreset, PresetRefusal } from '../settings/settings';
import { MAX_POOL_PRESETS, MAX_PRESET_NAME_CHARS } from '../settings/settings';

/**
 * One sentence per refusal the store can answer.
 *
 * The record is total over `PresetRefusal`, so a fifth refusal added to the
 * store is a type error here until it has words. Every sentence names the cause
 * rather than the act, because the player has to know what to change. The two
 * caps are read from the constants that enforce them, so no cap is retyped.
 */
export const PRESET_REFUSAL_TEXT: Readonly<Record<PresetRefusal, string>> = {
  emptyName: 'The name is empty. Type a name for this pool.',
  nameTooLong: `The name is too long. Use ${MAX_PRESET_NAME_CHARS} characters or fewer.`,
  atPresetLimit: `You hold ${MAX_POOL_PRESETS} saved pools. Delete one before you save another.`,
  noSuchPreset: 'The list holds no pool under that name.',
};

/** The refusals that are about the name in the field, and not about the list. */
export const NAME_REFUSALS: readonly PresetRefusal[] = ['emptyName', 'nameTooLong'];

/** What the panel says when an operation went through. */
export const PRESET_SAVED_TEXT = 'The pool is saved.';
export const PRESET_MOVED_TEXT = 'The pool moved.';
export const PRESET_DELETED_TEXT = 'The pool is deleted.';

/**
 * A stored pool the six tiles cannot hold. It is unwritable through the
 * interface and reaches the store only by hand, so it names its own cause
 * rather than blaming the player.
 */
export const UNUSABLE_POOL_TEXT = 'This saved pool holds dice the builder cannot hold.';

/** Step mode saves no pool, and the ledger row of Unit 4.3 says why. */
export const STEP_MODE_TEXT = 'A saved pool holds pool dice. Choose pool dice to save one.';

/** The list before the player has saved anything. */
export const NO_PRESETS_TEXT = 'You have saved no pool yet.';

/** The words that mark the row the builder holds. */
export const IN_THE_BUILDER_TEXT = 'in the builder';

/**
 * One saved pool.
 *
 * Every control carries a role, an accessible name and a state. The name is the
 * player's own text, which is why each accessible name holds it and each
 * control is addressed by its place in the list.
 *
 * The two move controls are disabled at the two ends of the list, because a
 * first row cannot move up and a last row cannot move down. That is a position
 * and not a refusal. Nothing else is ever disabled: a refusal is a sentence
 * that names its cause, and a control that went dim names nothing.
 */
function PresetRow({
  preset,
  index,
  count,
  current,
  onRecall,
  onMove,
  onDelete,
}: {
  preset: PoolPreset;
  index: number;
  count: number;
  current: boolean;
  onRecall: () => void;
  onMove: (toIndex: number) => void;
  onDelete: () => void;
}) {
  const first = index === 0;
  const last = index === count - 1;
  return (
    <li class="pre-row" data-el={`preset-row-${index}`} data-name={preset.name}>
      {/* The name, as a Preact child. This is the `textContent` rendering
          Constraint 8 asks for: the framework writes one text node and no
          markup in the name can make an element. */}
      <span class="pre-name" data-el={`preset-name-${index}`}>
        {preset.name}
      </span>
      {/* The row the builder holds, marked by words and by a frame, never by
          colour alone. The words sit outside the control, so the visible label
          of that control stays inside its accessible name. */}
      {current ? <span class="pre-here">{IN_THE_BUILDER_TEXT}</span> : null}
      <span class="pre-acts">
        <button
          class="pre-btn"
          type="button"
          data-el={`preset-recall-${index}`}
          aria-label={`Recall ${preset.name}`}
          aria-current={current ? 'true' : 'false'}
          aria-disabled="false"
          onClick={onRecall}
        >
          Recall
        </button>
        <button
          class="pre-btn"
          type="button"
          data-el={`preset-up-${index}`}
          aria-label={`Move ${preset.name} up`}
          aria-disabled={first ? 'true' : 'false'}
          disabled={first}
          onClick={() => onMove(index - 1)}
        >
          Up
        </button>
        <button
          class="pre-btn"
          type="button"
          data-el={`preset-down-${index}`}
          aria-label={`Move ${preset.name} down`}
          aria-disabled={last ? 'true' : 'false'}
          disabled={last}
          onClick={() => onMove(index + 1)}
        >
          Down
        </button>
        <button
          class="pre-btn"
          type="button"
          data-el={`preset-delete-${index}`}
          aria-label={`Delete ${preset.name}`}
          aria-disabled="false"
          onClick={onDelete}
        >
          Delete
        </button>
      </span>
    </li>
  );
}

/**
 * The whole panel.
 *
 * `note` is what the last operation answered, and it is empty until the player
 * presses something. It sits in a live region built with the sheet and filled
 * afterwards, so a reader is already watching it when a refusal arrives.
 *
 * `onSave` answers true when the store took the pool, which is when the field
 * is cleared. A refused save keeps the text, because the player has to correct
 * it rather than type it again.
 */
export function PresetPanel({
  mode,
  presets,
  note,
  invalid,
  isCurrent,
  onSave,
  onRecall,
  onMove,
  onDelete,
}: {
  mode: 'pool' | 'step';
  presets: readonly PoolPreset[];
  note: string;
  invalid: boolean;
  isCurrent: (preset: PoolPreset) => boolean;
  onSave: (name: string) => boolean;
  onRecall: (preset: PoolPreset) => void;
  onMove: (preset: PoolPreset, toIndex: number) => void;
  onDelete: (preset: PoolPreset) => void;
}): preact.JSX.Element {
  const [name, setName] = useState('');
  return (
    <fieldset class="field" data-el="sheet-presets">
      <legend>Saved pools</legend>
      {mode === 'step' ? (
        <p class="sheet-note" data-el="preset-step-note">
          {STEP_MODE_TEXT}
        </p>
      ) : (
        <>
          <label class="ovr-line">
            <span class="ovr-label">Name for this pool</span>
            {/* No length limit is set on the field. The cap is counted in code
                points and a field that stopped the player at it would put the
                refusal out of reach of the interface, where the cap has to be
                provable. */}
            <input
              class="ovr-input pre-field"
              type="text"
              data-el="preset-name"
              value={name}
              aria-invalid={invalid ? 'true' : 'false'}
              onInput={(event) => setName(event.currentTarget.value)}
            />
          </label>
          <button
            class="btn"
            type="button"
            data-el="preset-save"
            aria-disabled="false"
            onClick={() => {
              if (onSave(name)) setName('');
            }}
          >
            Save this pool
          </button>
          <ul class="pre-list" data-el="preset-list">
            {presets.map((preset, index) => (
              <PresetRow
                key={preset.name}
                preset={preset}
                index={index}
                count={presets.length}
                current={isCurrent(preset)}
                onRecall={() => onRecall(preset)}
                onMove={(toIndex) => onMove(preset, toIndex)}
                onDelete={() => onDelete(preset)}
              />
            ))}
          </ul>
          {presets.length === 0 ? <p class="sheet-note">{NO_PRESETS_TEXT}</p> : null}
        </>
      )}
      <p class="sheet-note" data-el="preset-note" role="status">
        {note}
      </p>
    </fieldset>
  );
}
