# Clatter

Clatter is a dice roller for pools of six-sided dice. A six is a success. The player may then **push**: throw again the dice that are neither a success nor a bane, at a cost. Kept dice stay visible on the tray while the rest go back to the cup.

## The push

Every existing 3D dice integration hides the kept dice inside the app. Clatter shows them instead. A player can see what they hold while they decide whether to push and risk their successes. This visibility is the point of the project.

## How to run it

Run `npm ci` to install the dependencies, then `npm run dev` to start the development server.

## How to build it

Run `npm run build` to build the application for production.

## How to check it

Run the following commands to validate the application:

- `npm run lint` to check code style.
- `npm run typecheck` to check TypeScript.
- `npm test` to run the test suite and the branding gate.
- `npm run build` to build the application.

Run `node scripts/browser.mjs` to exercise the application in a real browser. This is a separate browser harness and is not part of `npm test`. The 3D tray needs a graphics card. Without one, the application falls to flat dice and every rule and control still works.

## Licence

Clatter is licensed under the MIT License. See LICENSE for details.

The tray code under `src/tray/vendor/` is third-party MIT software. See `src/tray/vendor/LICENSE` for the vendor's notice.
