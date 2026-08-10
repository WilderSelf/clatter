// The override panel — Unit 4.2.
//
// `sheet-overrides` shows every field of the push-profile record and lets the
// player change any of them on top of the chosen preset. It is generated from
// `src/settings/profile-fields.ts`, which walks the record itself, so nothing
// here names a field of a push profile and a field added to that record is
// drawn without an edit to this file.
//
// The panel decides no rule. It reports a new override and `src/shell/state.ts`
// merges it into the preset through `mergeProfile` in the rules core.
//
// Constraint 8. Every label and every value is set through Preact children, so
// the text is escaped by the framework and no string is written as markup.

import type { PushProfile, PushProfileOverride } from '../rules/push-profile';
import type { FieldValue, ProfileField } from '../settings/profile-fields';
import { isUnchanged, profileFields, withFieldValue } from '../settings/profile-fields';

/** The word a row carries while it differs from the preset. */
const CHANGED_WORD = 'changed';

function Toggle({
  field,
  onChange,
}: {
  field: ProfileField;
  onChange: (value: FieldValue) => void;
}) {
  return (
    <label class="choice">
      <input
        type="checkbox"
        checked={field.value === true}
        onChange={(event) => onChange(event.currentTarget.checked)}
      />
      {field.label}
    </label>
  );
}

function Number_({
  field,
  onChange,
}: {
  field: ProfileField;
  onChange: (value: FieldValue) => void;
}) {
  return (
    <label class="ovr-line">
      <span class="ovr-label">{field.label}</span>
      <input
        class="ovr-input"
        type="number"
        min={0}
        step={1}
        value={String(field.value)}
        onInput={(event) => {
          const held = event.currentTarget.valueAsNumber;
          // An empty box reads NaN. It is a box being typed in and not a value,
          // so the record keeps what it holds until a number arrives.
          if (globalThis.Number.isInteger(held) && held >= 0) onChange(held);
        }}
      />
    </label>
  );
}

function Choice({
  field,
  onChange,
}: {
  field: ProfileField;
  onChange: (value: FieldValue) => void;
}) {
  return (
    <label class="ovr-line">
      <span class="ovr-label">{field.label}</span>
      <select
        class="ovr-input"
        value={String(field.value)}
        onChange={(event) => onChange(event.currentTarget.value)}
      >
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * A set of values, one checkbox per member of the domain.
 *
 * The new list is built in the domain's own order, so the record never depends
 * on the order the player pressed the boxes in.
 */
function ValueSet({
  field,
  onChange,
}: {
  field: ProfileField;
  onChange: (value: FieldValue) => void;
}) {
  const held = Array.isArray(field.value) ? field.value : [];
  return (
    <fieldset class="ovr-set">
      <legend>{field.label}</legend>
      {field.options.map((option) => (
        <label key={option.value} class="choice">
          <input
            type="checkbox"
            checked={held.includes(option.value)}
            onChange={(event) =>
              onChange(
                field.options
                  .map((each) => each.value)
                  .filter((value) =>
                    value === option.value ? event.currentTarget.checked : held.includes(value),
                  ),
              )
            }
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}

/** A field the panel cannot edit: the identity of the profile. */
function Text({ field }: { field: ProfileField }) {
  return (
    <p class="ovr-line ovr-read">
      <span class="ovr-label">{field.label}</span>
      <span class="ovr-text">{String(field.value)}</span>
    </p>
  );
}

function Row({ field, onChange }: { field: ProfileField; onChange: (value: FieldValue) => void }) {
  return (
    <div
      class={field.changed ? 'ovr-row changed' : 'ovr-row'}
      data-el={field.id}
      data-field={field.path.join('.')}
      data-kind={field.kind}
    >
      {field.kind === 'toggle' ? <Toggle field={field} onChange={onChange} /> : null}
      {field.kind === 'number' ? <Number_ field={field} onChange={onChange} /> : null}
      {field.kind === 'choice' ? <Choice field={field} onChange={onChange} /> : null}
      {field.kind === 'set' ? <ValueSet field={field} onChange={onChange} /> : null}
      {field.kind === 'text' ? <Text field={field} /> : null}
      {field.changed ? <span class="ovr-tag">{CHANGED_WORD}</span> : null}
    </div>
  );
}

/**
 * The whole panel.
 *
 * `base` is the preset the player chose. `override` is what sits on top of it.
 * Every row reads the merged value, so the panel shows the rules in force.
 */
export function OverridePanel({
  base,
  override,
  onChange,
  onReset,
}: {
  base: PushProfile;
  override: PushProfileOverride;
  onChange: (next: PushProfileOverride) => void;
  onReset: () => void;
}): preact.JSX.Element {
  const fields = profileFields(base, override);
  const unchanged = isUnchanged(base, override);
  return (
    <fieldset class="field ovr" data-el="sheet-overrides">
      <legend>The rules in force</legend>
      <p class="sheet-note">
        Every field of the chosen rule set. A change here sits on top of it and clears the table.
      </p>
      {fields.map((field) => (
        <Row
          key={field.id}
          field={field}
          onChange={(value) => onChange(withFieldValue(base, override, field.path, value))}
        />
      ))}
      <button
        class="btn"
        type="button"
        data-el="overrides-reset"
        disabled={unchanged}
        onClick={onReset}
      >
        Use the rule set unchanged
      </button>
    </fieldset>
  );
}
