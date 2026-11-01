# Pumpkin Imp: The Last Halloween — v1.1.0

Play: **https://yurakuka.github.io/pumpkin-imp/**

A playable Phaser 3 / JavaScript / Vite platformer with generated pixel art, original chiptune music and desktop/mobile controls. Rescue the Little Duck and Countess Larisa, defeat Bone Rex, and recover Halloween's lantern before dawn.

## Run locally

Install Node.js 22 LTS (or newer), then:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. For a stable local build and Wi-Fi sharing:

```sh
npm run build
npm run play
```

The play server prints the desktop address (port 5173) and LAN addresses (port 5175). Phones must be on the same Wi-Fi. Each browser runs an independent game; no backend or accounts are needed. The computer must remain on only for local hosting. The GitHub Pages version is hosted independently.

## Controls and adventure

- A/D or Left/Right: move
- Space: jump; hold for a high jump
- J: fireballs
- K: scare within 450 pixels; 8-second cooldown
- Escape: pause/resume
- M: mute/unmute

On phones, turn sideways and use the touch buttons. SCARE is above FIRE (left) and JUMP (right). Multitouch supports movement, jumping and firing together. Page zoom gestures are disabled to keep touch controls stable.

There are 15 pits, five hearts and 210 seconds until dawn. Every 15 candies restores a heart. Falling costs a heart and returns you to the latest safe bank near the pit. Descending head stomps defeat ground wardens and floating ghosts. Lanterns light as you pass; checkpoint lanterns refill health.

Defeat or scare each friend's three captors to rescue them. Comics pause physics and the countdown; on mobile, use the native TAP TO CONTINUE button below the picture. Rescue progress survives falls. Bone Rex guards the final lantern: eight fireball hits or head stomps defeat it; scare stuns it. Winning opens the friends' reunion and credits.

## Publish changes from the console

This repository now contains the editable source directly. A push to `main` runs `.github/workflows/deploy.yml`: install locked dependencies with `npm ci`, build the game, and publish `dist/` to GitHub Pages. The public URL stays the same.

On a new computer, install Git and GitHub CLI, clone this repository and authenticate once:

```sh
gh auth login --hostname github.com --git-protocol https --scopes workflow
gh auth setup-git
npm ci
```

Publish a finished change with:

```sh
npm run publish:game -- "Describe the update"
```

Or on this configured Mac, without npm on PATH:

```sh
./publish-game "Describe the update"
```

The command checks authentication and the remote, builds locally, commits changes, pushes `main`, and waits for GitHub Actions. It stops if a build, push or deployment fails and never force-pushes. Local edits alone are not uploaded. If a push fails after a commit, rerun the command to push that existing commit.

Check publishing access without changing remote files:

```sh
npm run publish:check
# Or: ./publish-game --check
```

A normal Git workflow also works:

```sh
git add .
git commit -m "Describe the update"
git push
```

GitHub builds and deploys automatically after the push. Wait for a successful Actions run before announcing an update. Browser control is not required after CLI authentication.

## Structure and hosting

- `src/game/`: generated graphics, sound, touch input, rescues, boss, lanterns and native screen actions
- `src/scenes/`: title, graveyard, defeat and credits
- `scripts/publish.mjs`: checked console publication
- `scripts/tooling.mjs`: portable tool discovery with this workspace's bundled-runtime fallback
- `scripts/serve.mjs`: stable static local hosting
- `.github/workflows/deploy.yml`: source build and Pages deployment

`dist/` is generated and is not tracked. Relative asset paths support repository subpaths. The old release archive remains available in Git history; it is no longer needed for deployment. Reference photographs, local credentials, downloaded tools and machine-specific workspace files are excluded from Git.

All game graphics and audio are generated locally. See `VERIFICATION.md` for test evidence and limitations; physical iPhone Safari has not been directly tested.

## Version 1.1.0

Mobile controls float over the full-height canvas. Wide landscape screens reveal more of the world at the same vertical scale. SCARE affects enemies whose sprites intersect the camera view (8-second cooldown); Bone Rex is stunned. Health starts at five hearts, and checkpoints/rescues refill all five. High jumps have a slightly larger green puff.

Rescued friends travel behind Pumpkin without collision or damage bodies. They hop over pits, wait behind nearby threats and catch up after respawns. The boss battle switches to faster, tense chiptune music; the homecoming and credits use a separate melody. After the final lantern, a lit door opens and all three friends enter before the credits.
