import Phaser from 'phaser';
import { Boot, Menu, End } from './scenes/Menu.js';
import { Credits } from './scenes/Credits.js';
import { Graveyard } from './scenes/Graveyard.js';
import { touch } from './game/touch.js';
touch.init();
const game = new Phaser.Game({ type: Phaser.AUTO, parent: 'game', width: 960, height: 540, backgroundColor: '#101021', pixelArt: true, roundPixels: true, scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }, physics: { default: 'arcade', arcade: { gravity: { y: 1100 }, debug: false } }, scene: [Boot, Menu, Graveyard, End, Credits] });

if (import.meta.env.DEV) window.__game = game;

// Recompute FIT after control-bar and mobile viewport/orientation layout changes.
const resizeObserver = new ResizeObserver(() => requestAnimationFrame(() => game.scale.refresh()));
resizeObserver.observe(document.getElementById('game'));
window.visualViewport?.addEventListener('resize', () => requestAnimationFrame(() => game.scale.refresh()));
