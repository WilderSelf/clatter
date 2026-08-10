# The branding gate

The gate stops a trademark from reaching a public repository. Public history is permanent, so a
miss cannot be reverted.

## Files

| File | Role |
|---|---|
| `scripts/gen-forbidden-hashes.mjs` | Builds the hash file from a plaintext term list. |
| `scripts/forbidden-hashes.json` | Salt, algorithm, `maxNgram`, sorted digests, allow-list. Committed. |
| `scripts/check-branding.mjs` | The gate. Exit 0 clean, 1 on a hit, 2 on a usage error, 3 when its own file counts do not balance. |
| `scripts/check-branding-count.sh` | Runs the gate, then checks the file count is not short. |
| `scripts/check-branding.test.mjs` | Red-proofs for all four surfaces, the denominator and the binary skip. |

The plaintext term list is **never committed**. It stays outside the repository. The hash file
holds no term.

## Run it

```sh
sh scripts/check-branding-count.sh                       # all four surfaces, plus the denominator
node scripts/check-branding.mjs --surface tracked        # one surface
node scripts/check-branding.mjs --base <ref>             # commit messages since <ref>
node scripts/check-branding.mjs --metadata-file meta.json
node scripts/check-branding.mjs --file <path>            # one path, used by the editor hook
```

CI writes the metadata file with `gh api repos/{owner}/{repo}`. The gate never calls `gh`, so it
runs with no network.

## What the gate counts

Every run prints one counts line and the wrapper checks it.

```
branding-gate: files_scanned=110 binary_skipped=47 unreadable=0 enumerated=157
```

`enumerated` is the number of paths the gate opened. The other three numbers put each path in
exactly one class. The gate adds the three, compares the total against `enumerated`, and exits 3
when the two disagree. `check-branding-count.sh` then compares `files_scanned` plus
`binary_skipped` against `git ls-files` plus `find dist -type f`. A skipped binary file still
counts towards that total. An unreadable file counts towards neither total, so it turns the
wrapper red.

## Binary files are skipped, and the skip is printed

The gate calls a file binary when a NUL byte sits in the first 8000 bytes. The rule reads the
content, because an extension can lie. The window matches the one git uses for the same decision.

A binary file gets no byte-level text scan. Decoded image bytes make thousands of junk fragments,
and one such fragment hashed to a term on the list on 2026-08-09.

**The gate does not read the metadata chunks of any binary format.** A PNG `tEXt` chunk, a PNG
`iTXt` chunk and a JPEG EXIF field can all hold text, and the gate reads none of them. It prints
that hole on every run that skips a file, with the count and the extensions:

```
branding-gate: binary metadata NOT scanned in 47 files (PNG tEXt, PNG iTXt, JPEG EXIF and the like): .jpg .png
```

A chunk parser was the alternative. This repository writes every image itself with a script, so no
foreign metadata arrives, and a parser per format is code with no present need. Add one when the
repository takes in an image it did not draw.

## Regenerate the hashes

```sh
node scripts/gen-forbidden-hashes.mjs <path-to-the-plaintext-list> [output-path]
```

The output path defaults to `scripts/forbidden-hashes.json`. The generator carries the existing
allow-list over. Every run makes a new salt, so every digest changes.

## The allow-list

`allowlist` holds `{term, reason}` objects in plaintext. Those entries are ordinary English words
that collide or over-match. They are not trademarks, so plaintext is correct for them. Add an entry
only with a reason.

## Run the tests

```sh
node --test scripts/check-branding.test.mjs
```

The run needs no secret. The tests write a synthetic term list of invented marks, generate a
throwaway hash file from it, and prove every red against that. The gate is generic, so a red on a
synthetic mark proves the mechanism. The real list is never committed, so a suite that needed it
could never go green in CI.

One extra check reads the real list and scans the tracked tree for a plaintext term. Set
`CLATTER_FORBIDDEN_TERMS` to run it. Without the variable that one test skips with a printed
reason.

```sh
CLATTER_FORBIDDEN_TERMS=<path-to-the-plaintext-list> node --test scripts/check-branding.test.mjs
```

## Editor hook — owner installs this

Project settings are deny-listed to the agent. Paste this block into `.claude/settings.json`. It
runs the gate over a file after a `Write` or an `Edit`. A hit exits 2, which blocks the turn and
returns the message.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "f=$(jq -r '.tool_input.file_path // empty'); if [ -n \"$f\" ]; then node \"$CLAUDE_PROJECT_DIR/scripts/check-branding.mjs\" --file \"$f\" >&2 || exit 2; fi"
          }
        ]
      }
    ]
  }
}
```

## Known limits

- The salt stops a rainbow-table lookup. It does not stop a dictionary attack against a short term.
  The gate needs the salt at run time, so the salt must ship with the digests.
- The tokeniser keeps ASCII letters and digits only. A term written with a diacritic does not match.
- Binary content gets no text scan, and no binary metadata chunk is read. See the section above.
- A binary format that writes no NUL byte in its first 8000 bytes reads as text. The gate then
  tokenises it and can report a junk hit.
- `CLATTER_BRANDING_SKIP_EXT` makes the gate skip one extension. It drops the file before the gate
  opens it, so the file leaves `enumerated` as well, and the wrapper reports the shortfall. It
  exists only to prove the file count check can go red. Never set it in CI.
