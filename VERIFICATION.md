# Verification — rescue update

Verified on 2026-10-31 using headless Google Chrome at a 960×540 viewport against the Vite development server.

Passed:
- Fresh run starts with a 180-second dawn countdown and two rescue encounters.
- All ordinary and encounter enemies use the yellow-jacket, one-eyed triangle graphics (ground and flying variants).
- Original chiptune scheduler produces notes through a running Web Audio context; master mute reaches zero gain and restores sound.
- Frightening only part of a captive's group does not prematurely complete the rescue.
- Scaring all three captors rescues the duck and opens its comic.
- The comic freezes physics and the countdown; Enter continues after a short input guard.
- Fireballs defeat Larisa's captors and open her comic; the Continue button works after camera scrolling.
- Rescue progress survives falling and checkpoint respawn; rescuing restores three hearts.
- The final lantern refuses victory until both friends are safe, then opens the victory screen with 2/2 rescued.
- Restart resets rescue progress; Escape pauses/resumes; dawn timeout opens game over.
- Both comic panels were rendered and visually inspected for portraits, dialogue, layout and readability.
- All 15 pits in the shortened map were traversed with keyboard movement and held jumps; enemies were removed to isolate geometry.
- Pause-menu Resume works by mouse after scrolling the camera.
- Production build succeeds; ready-to-host output is in `dist/`.

Combat and rescue checks use controlled character positions. This is not an uninterrupted human playthrough. Music scheduling and muting were verified programmatically; audio quality has not been evaluated by listening. Alternate browsers, mobile input and deployment to a live GitHub Pages repository remain untested. The game is designed for desktop keyboards.

## Mobile web / LAN update

Verified in Chromium with an iPhone-sized landscape viewport (844×390, DPR 3), mobile emulation and real CDP multi-touch events:

- The Wi-Fi IP URL responds and loads the game.
- The control bar occupies its own area below the canvas.
- Simultaneous movement, jumping and fire work; releasing fingers stops movement.
- Touch scare, sound toggle, pause/resume and paused countdown work.
- Portrait orientation displays a rotate hint and pauses the game; returning to landscape permits resume.
- Comic Continue works by touch and gameplay buttons are disabled during the comic.
- No JavaScript errors in these checks.

This supersedes the earlier note about untested mobile input. A physical iPhone and its Safari browser have not been tested; emulation does not prove device performance, audio playback, safe-area behavior or Wi-Fi connectivity from a second physical device.

## Stability / blank-page report

The reported spontaneous reload could not be reproduced during initial inspection. Both old endpoints were Vite development servers with hot reload. The screenshot showed unstyled HTML with no Canvas; styles were previously dependent on successful JavaScript module loading. This identifies a loading failure presentation, not a proven cause of the original reload.

Changes:
- Both desktop 5173 and Wi-Fi 5175 now serve one production snapshot through `scripts/serve.mjs`, with no Vite/HMR connection or filesystem watching.
- The server holds complete HTML/asset buffers from startup. Edits or rebuilds cannot mix versions during a running server session.
- CSS loads directly from HTML; a small inline loading/recovery panel remains available if JavaScript fails to load. It offers a manual retry and never reloads automatically.
- A data favicon avoids irrelevant favicon 404 errors.

Passed against the actual production server in desktop Chromium and Chromium mobile/touch emulation:
- The production bundle and CSS load on both loopback and Wi-Fi IP URLs.
- 12 repeated level restarts per viewport (24 total) with no JavaScript errors or failed requests.
- Touching source/HTML files does not trigger navigation or reload of an active game.
- Repeated portrait/landscape transitions on the mobile viewport.
- Blocking the game JavaScript shows a styled recovery screen and hides uninitialized controls, instead of raw HTML.
- Production build completes successfully.

The exact original intermittent failure is still unconfirmed. Physical iPhone Safari behavior and a second physical Wi-Fi client remain untested.

## Local fall recovery and finale credits

Verified in Chromium against the updated source build:

- Walking into the first pit returns to the last safe bank (x=1304), not the level start or lantern checkpoint.
- After crossing the first pit, the landing updates the saved return point.
- A later fall returns locally (x=2954), and a fall near the level end stays near that bank (x=24404).
- Walking backwards into a pit saves the right-hand bank (x=3224), rather than reusing the furthest forward position.
- Each fall still removes one heart; safe points are recorded only when grounded on the main floor and at least 64 pixels from a gap.
- Winning opens the new Credits scene with both friends' thank-you dialogue, three cycling credit panels and run statistics.
- Play Again resets the safe point; Title Screen returns to the title scene.
- Mobile-emulated credits hide gameplay controls and accept touch on Title Screen.
- The final scene screenshot was visually inspected. No JavaScript errors occurred in these checks.
- Production build succeeded and the stable server was restarted with the new snapshot.

## Accidental zoom and timing update

- The current level contains exactly 15 pits (the previous version already had 15; the count is now named explicitly as PIT_COUNT).
- Starting time is now 210 seconds / 3:30, adding 30 seconds.
- The viewport fixes its initial/minimum/maximum scale. Touch-action now covers the whole HTML/body surface and all buttons, including canvas margins.
- Non-passive gesture/touch handlers block pinch, double-tap, and control-wheel browser zoom without stopping game input handlers.

Verified with Chromium mobile emulation and CDP touch gestures:
- Runtime gap count is 15 and a new game begins at 210 seconds.
- Eight rapid miss-taps in an empty margin and a 1.8x pinch leave visualViewport.scale at 1 and canvas bounds unchanged.
- A cancellable Safari-style gesturestart event is prevented (handler test only, not real Safari).
- Simultaneous move/jump/fire still works after those gestures; finger release stops movement and clears held buttons.
- Touch pause/resume works; no JavaScript errors occurred.
- Production build passed and the stable server was restarted with the new snapshot.

Physical iPhone Safari zoom behavior still needs checking on the user's device.

## Ghost enemies and triangular mobile actions

- Ground enemies and rescue captors remain yellow-jacket triangle wardens.
- Flying enemies now use separate generated hooded-ghost frames: pale folded cloth, empty dark face, ragged fluttering hem and a glowing carried lantern, based on the supplied reference.
- Ghosts float without gravity and retain scare/fireball interactions; their body size matches the new sprite.
- The mobile action cluster is triangular: SCARE above, FIRE below left, JUMP below right. It has its own bar area, minimum 44px button heights and no overlap with the canvas.
- Brief FIRE taps are latched for the next update so attacks are not missed between frames.

Passed in Chromium mobile emulation:
- Both warden and ghost enemies spawn with the correct textures.
- Button bounding boxes confirm the requested triangular positions and touch-target sizes.
- Simultaneous movement/jump/fire still works; scare affects ghosts, and a short FIRE tap defeats one.
- Controls remain on screen at 568×320 as well as 844×390.
- A rendered screenshot with a ghost, ground warden and triangular controls was visually inspected.
- No JavaScript errors during these checks.

Physical iPhone Safari remains untested.

## Comic Continue blocker fix

Mobile comics now expose a large native HTML TAP TO CONTINUE button in the bottom bar. Gameplay control groups are hidden during the comic and restored on close. This button bypasses Phaser/canvas camera and scale hit testing. It uses pointerdown directly, with click as a keyboard/browser fallback. The accidental-tap delay uses performance.now rather than the scene clock. Scene shutdown clears the callback.

Verified in Chromium touch emulation:
- Both duck and Larisa comics close through the native button even with Phaser scene pointer input explicitly disabled.
- The countdown stays frozen while reading; physics and the normal control bar resume after Continue.
- Larisa's comic still closes after portrait/landscape rotation.
- A tap before the guard delay does not skip the comic or prevent a later tap from closing it.
- Rescue progress remains correct (1/2 then 2/2).
- No JavaScript errors in these checks.

Physical iPhone Safari was not available for direct testing.

## Seven-feature combat / finale update

Implemented:
- Action buttons are now 72×52px (64×52px on compact phones), with larger horizontal/vertical gaps; triangular positions are retained.
- Scare radius is 450px (3×), cooldown 8 seconds. It stuns Bone Rex for 1.2 seconds without damaging it.
- Descending head contact defeats wardens and ghosts and bounces Pumpkin upward; side contact remains harmful.
- Held high jumps produce five tiny fading green puffs, lasting 380ms. Short hops do not.
- Road lanterns light permanently during a run as the player passes. Walking past checkpoint lanterns now lights/activates them from the ground.
- Bone Rex is a generated, animated skeletal dinosaur scaled 3×, with 8 HP, patrol/stun/hit states and a visible health bar. Fireballs and head stomps each deal one hit. The final lantern remains locked until it is defeated and both friends are saved.
- Pause, game-over and credits actions use a shared native HTML action bar with pointerdown/click handling, duplicate-action guards and scene cleanup. No Canvas hit testing is required.

Passed in Chromium touch emulation:
- Enlarged triangular targets and spacing; compact 568×320 controls fit on screen.
- Scare affects a target 400px away, does not reach one 490px away, and starts an 8-second cooldown.
- Real physics stomps defeat both enemy types without health loss and bounce the player.
- High jump produces the subtle green effect; a short hop does not.
- Passing a road lantern lights it; ground-level checkpoint passage activates it and refills health.
- Native pause Resume/Restart and death Try Again/Title Screen work, including with scene pointer input explicitly disabled.
- Boss survives seven actual fireball hits; a head stomp supplies hit eight. Scare stuns it without HP loss; the lantern unlocks only on defeat.
- A full running jump from the floor can reach the boss's head.
- Winning reaches credits; native Play Again and Title Screen work with Canvas input disabled. Restart resets the boss to 8 HP.
- Native comic continuation still works after these changes, and restarting correctly restores gameplay controls.
- No JavaScript errors during the passing runs. The boss encounter screenshot was visually inspected.

These are controlled gameplay tests, not a complete uninterrupted human run. Physical iPhone Safari remains untested.

Final production check on desktop Chromium: reached a real game-over through normal movement, clicked native TRY AGAIN, then paused and clicked native RESUME. Both actions worked; the game returned to play with no JavaScript errors. The production bundle has no development game hook. Final production build passed and the stable desktop/Wi-Fi server was restarted with it.


## v1.1.0

Automated Chrome mobile viewport (844×390, DPR 2): canvas fills 844×389.86 with virtual width 1169, and touch controls overlay it. Verified five starting hearts; all four on-screen foes frightened while distant foes remain unaffected; rescue comic Continue joins the duck as an invulnerable follower; both followers have no physics bodies; boss music mode, eight-hit defeat, door sequence, credits music, and Play Again resetting to five hearts. No browser page errors in this flow. Test jumped to encounter locations; a full uninterrupted run and physical iPhone/Safari audio/fullscreen behavior remain untested.


## v1.2.0

Chrome mobile viewport 844×390: 1800 simulated follow steps with fast movement, reversal and respawn maintained >=78px separation. Visible-enemy fear measured 4000ms. Real Arcade bone overlap reduced health 5→4; fireball overlap destroyed the bone; companions have no damage bodies. Moving ferry carried the player by the same horizontal delta (26.4px over the observation). Held jump/right input landed on the final balcony at body bottom y=230. The lantern remained locked before boss defeat; activating it after defeat led to Credits. No page errors. Full uninterrupted playthrough and physical iPhone Safari remain untested.


## v1.3.0

Chrome desktop and mobile viewport checks passed with no page errors. Tested 1000 follower movement steps: both actors stay within camera bounds, beyond the left touch buttons and 78px apart. A real 50th-candy overlap enabled Frenzy; running velocity measured 480; contact defeated a clown without player damage; timer expiry restored normal state. Three separate projectile overlaps reduced a clown from 3 HP to defeat. Fog triggered once and did not restart after completion; contact damage and safe-bank reset verified. At 4 HP, boss phase two telegraphed a stomp and spawned two waves; wave contact damaged the player and an actual jump avoided it. Boosted jump and pause-frozen boost timer checked. Verified house/door → animated Celebration → Credits/results → clean restart (five hearts, three clowns, no boost, fresh fog). Local production build and GitHub Pages publication are verified during release. Full uninterrupted playthrough, physical iPhone/Safari behavior and subjective audio mix remain untested.


## v1.4.0

Chrome mobile 844×390: phone camera zoom=1.12; tablet 1180×820 and desktop 1280×720 zoom=1.0. Clown crosses the 4670–4810 pit in both directions under real Arcade gravity and movement, and survives four hits then dies on fifth. Eight warden frames present. 50th candy activates visible 3× Giant Imp; measured velocity remains 240, music boost=false, incoming damage ignored, timer expires and normal sprite returns. Sampled follower motion retains 78px spacing with no large screen jumps (largest observed sample delta ~7.2px). Boss phase two begins at five remaining HP and ten total hits defeat it; full ending reaches credits and restart resets to 10-HP boss / 5-HP clowns. No page errors. Physical iPhone/Safari, subjective laughter sound and a full uninterrupted playthrough remain untested.
