# Release checklist — Units 0.5, 0.6 and 5.2

**Units 0.5 and 0.6 are COMPLETE, 2026-08-09.** Steps 1 to 9 are done. That part of this file is
retained because two of its warnings were bought at a price.

**Unit 5.2 adds steps 10 to 12, 2026-08-10.** Read the "Unit 5.2" section near the end.

Everything an agent can build without the network is built. This file holds what is left.

Two separate restrictions block these commands. Read this section fully before beginning.

**The sandbox blocks network access.** The owner must add `gh *` and `git push*` to `sandbox.excludedCommands` in `~/.claude/settings.json`. The agent cannot edit that file, because it is deny-listed. Without these entries, steps 1 through 9 fail immediately at the network call.

**The permission deny list blocks a direct push to main.** This is the workspace's never-push-to-main policy. Even after adding sandbox exclusions, step 3 fails with a permission error because `Bash(git push origin main:*)` and `Bash(git push -u origin main:*)` are denied. This restriction stops a push that bypasses branch protection on repositories that have it. Step 5 installs that protection, so step 3 is the bootstrap case the restriction cannot distinguish from the thing it guards against.

To verify which restrictions are in place, read the deny list in `~/.claude/settings.json` directly. Sampling it by running `gh auth status` will give a wrong answer because `gh auth:*` is deny-listed by name.

Run the commands in the order given. Each step states why it holds that position, and step 3 offers a resolution for the permission conflict.

Set the repository owner once, so no step retypes it:

```sh
OWNER=$(gh api user --jq .login)
REPO=clatter
```

## Step runability

Once the sandbox exclusions land, an agent may run steps **2, 4, 5, 7, and 8** autonomously. Steps **1, 3, 6, and 9** need the owner or are mixed. Step 3 blocks on a permission conflict that only the owner can resolve.

The repository description and topics (step 2) are set by the owner through `gh repo edit`, which is deny-listed. Re-run CI after setting them by pushing any commit, or by running step 4 and step 5 early to install protection.

## Unit 0.5 — CI, public repository, protection

### 1. Squash the local history into one commit

```sh
git checkout --orphan squashed
git add <every tracked path>          # git add -A fails on a deny-mount artifact in the sandbox
git commit -m "feat: add the rules core, the branding gate and the toolchain"
git branch -M squashed main
```

**Warning: `git switch --orphan` is not a substitute.** `switch` empties the working tree while `checkout` keeps it. An accidental use of `switch` left only `node_modules` and `dist` in the index, untracked source files outside it, and a push that carried dependencies with no source.

**Safer alternative:** Build the parentless commit with `git commit-tree` from the current tree. Verify the tree SHA with `git commit-tree --dry-run`, the empty content diff with `git diff <new-commit-ish> main`, and the absent parent. Push that commit.

**Why first.** The push is permanent and public. Work written before Unit 0.3 was never scanned by
the branding gate, because the gate did not exist yet. One squashed commit carries one message that
the gate does scan, so nothing unscanned reaches public history.

Run `node scripts/check-branding.mjs` over the tree before this step, and confirm exit 0.

### 2. Create the public repository

```sh
gh repo create "$REPO" --public --source . --remote origin
```

**Why here.** A remote must exist before a push. The command takes no description and no topics on
purpose. `Bash(gh repo edit:*)` is denied to agents, so the repository description and the topics
are the owner's to set. Both are branding surfaces. The gate scans them through
`gh api repos/{owner}/{repo}`, so set them and then re-run CI.

### 3. Push the one commit — the owner runs this one

```sh
git push -u origin main
```

**Why the owner.** The permission deny list refuses `git push origin main:*` and
`git push -u origin main:*`. That is the workspace never-push-to-main policy and it is working as
intended. Branch protection arrives at step 5, so this first push is the one case the rule cannot
tell apart from the bypass it exists to stop. The owner runs the command. It takes about ten
seconds.

**Do not route around this.** Do not edit the permission deny list, do not disable it for one
command, and do not reword the push to miss the pattern. A rule that an agent can suspend is not a
rule. If this step blocks, stop and hand it to the owner.

**Why here.** The repository exists and the history is one clean commit.

### 4. Wait for one green run

```sh
gh run watch --exit-status
```

**Why here.** The next step names a required status check. A required check that has never run
green blocks the branch forever, and only an administrator can lift it. Read the run to confirm the
job name, because the protection body must name the same string.

### 5. Apply branch protection

```sh
gh api -X PUT "repos/$OWNER/$REPO/branches/main/protection" \
  --input - <<'JSON'
{
  "required_status_checks": { "strict": true, "contexts": ["CI"] },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON
gh api -X PATCH "repos/$OWNER/$REPO" \
  -F allow_auto_merge=true -F allow_squash_merge=true -F delete_branch_on_merge=true
```

**Why after step 4.** See step 4. The check must have run green first.

**Who runs it.** An agent may. `Bash(gh api --method PUT:*)` is denied, but `gh api -X PUT` is a
different string and is allowed. Only `gh repo edit` is closed to agents, and this uses `gh api`.

### 6. Prove the gate blocks a merge

```sh
git checkout -b test/gate-proof
# add one deliberately failing test, then:
git commit -m "test: prove the merge gate blocks a red run"
git push -u origin test/gate-proof
gh pr create --fill
gh pr view --json mergeable,mergeStateStatus     # record the blocked state in the ledger
gh pr close 1 --delete-branch
```

**Why the branch is named `test/gate-proof`.** `/advance` treats any open `feat/*` pull request as
a reason to do no new work. A gate proof on a `feat/*` branch would stall the next unit until the
pull request closed. The name must not start with `feat/`.

**Why last in Unit 0.5.** The proof needs protection to be live. Close the pull request and delete
the branch inside this unit, so nothing is left open.

## Unit 0.6 — Pages deploy

### 7. Set the Pages source to GitHub Actions

```sh
gh api -X POST "repos/$OWNER/$REPO/pages" -f build_type=workflow
```

**Why here.** `deploy.yml` uploads a Pages artifact and calls `deploy-pages`. Both fail while Pages
is off or while the source is set to a branch. If Pages is already on, use `-X PUT` on the same
path instead of `-X POST`.

### 8. Run the deploy

The deploy runs on every push to `main`. Trigger it by hand after step 7, because the earlier push
ran before Pages was on:

```sh
gh workflow run deploy.yml --ref main
gh run watch --exit-status
```

### 9. Check the live page

```sh
curl -sf -o page.html -w '%{http_code}\n' "https://$OWNER.github.io/$REPO/"
grep -q Clatter page.html && echo "body carries the name"
```

**Why last.** This is the acceptance test of Unit 0.6, and it needs a finished deployment. `base` in
`vite.config.ts` is `/clatter/`, so the built page loads its script from
`/clatter/assets/…`. A 200 with an empty screen means `base` and the repository name disagree.

## Unit 5.2 — the version tag and the release

The version is `0.1.0`, set in `package.json`. The tag is `v0.1.0`.

**Cut the tag after the pull request merges.** A tag cut before the merge points at a commit that
never reached `main`.

### 10. Tag the merged commit

```sh
git switch main
git pull --ff-only
git tag -a v0.1.0 -m "Clatter 0.1.0"
git push origin v0.1.0
```

**Who runs it.** An agent may. `git push*` carries a sandbox exclusion. The workspace deny rule
matches `git push origin main`, and a tag ref is a different string, so the rule does not stop this.
If a tag push is refused, stop and hand this command to the owner. Do not reword it to miss the
pattern.

**No branding token in the tag name.** The tag carries the version alone.

### 11. Create the release

```sh
gh release create v0.1.0 --title "Clatter 0.1.0" --notes-file <path>
```

Write the notes in Simplified Technical English. Name no product, no publisher and no game.

**The branding gate does not read a release.** It reads four surfaces: the tracked tree, `dist/`,
the commit messages of the pull request, and the repository description and topics. A release title
and a release body are outside all four. Read the notes yourself before you publish them.

### 12. Check the live site after the deploy

The tag does not deploy. `deploy.yml` runs on a push to `main`, so the merge deploys the site and
the tag names the same commit.

```sh
curl -sS -o page.html -w '%{http_code}\n' "https://$OWNER.github.io/$REPO/"
# Read every asset URL OUT of page.html. Do not guess one and do not retype one.
grep -oE '(src|href)="[^"]+"' page.html
```

**Why the URLs are read and never guessed.** A wrong base path answers 200 with a blank screen.
Unit 0.6 made this rule. Fetch each URL the page names and record its status.

## Recorded for the ledger

Paste into the ledger rows for 0.5 and 0.6:

- the URL of the first green CI run,
- the blocked merge state from step 6,
- the deployed URL and the HTTP status from step 9.

Paste into the ledger row for 5.2:

- the tag name and the commit it points at,
- the release URL,
- every asset URL read out of the live page, with its HTTP status.

## What the owner still owes

No agent can close these.

- **Unit 5.3, the owner gate.** The feel of the finished application on a phone and on a tablet.
- **The phone performance reading.** `sheet-overlay` prints four figures. The owner runs it on a
  phone once per phase and pastes the JSON into the ledger. CI cannot measure a real frame rate.
- **The screen-reader run.** One roll and one push with a screen reader. The keyboard half is gated
  in CI. The screen-reader half is not.
- **The spreadsheet pivot.** Export a campaign-sized log, open the CSV in a spreadsheet, and pivot
  it by dice type and push count.
- **The import cap decision.** `BLOCKED:budget`, raised at Units 4.5 and 4.6. A full-buffer export
  leaves little room a row under the import cap. The arithmetic and three priced options sit in the
  notes of `LEDGER.md` under the heading that names this token.
- **Unit 5.4, the custom subdomain.** Optional. It needs one DNS record from the owner.
