# Pumpkin Imp: The Last Halloween

A playable pixel-art browser platformer built with Phaser 3 and Vite.

Play online: https://yurakuka.github.io/pumpkin-imp/

## Play

Desktop: A/D or arrows to move, Space to jump, J to shoot, K to scare, Esc to pause, M to mute.
Phones: turn sideways and use the on-screen controls. Each browser runs an independent game.

Rescue the Little Duck and Countess Larisa, defeat Bone Rex, and reclaim Halloween's lantern before dawn. There are 15 pits and 3 minutes 30 seconds. Collect candy to heal, stomp enemy heads, and light lanterns as you pass.

## Files

The release archive contains the ready-to-host game in public/ and the complete editable project in source/. Reference photographs and machine-specific workspace files are excluded.

To develop: extract source/, install Node.js 22 LTS, then run npm install and npm run dev. Use npm run build to generate dist/. No backend, accounts or external runtime services are needed.

## Publishing

GitHub Actions extracts the prebuilt, tested public/ folder from game-release.zip and deploys it to Pages. To release an update, rebuild locally, update game-release.zip and commit it. No local server is needed for the published game.

Graphics and sound are generated locally in code. Mobile controls were tested in Chromium touch emulation; actual device behavior can vary.
