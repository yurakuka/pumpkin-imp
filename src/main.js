import Phaser from 'phaser';
import { Boot, Menu, End } from './scenes/Menu.js';
import { Credits } from './scenes/Credits.js';
import { Graveyard } from './scenes/Graveyard.js';
import { touch } from './game/touch.js';
touch.init();
// Keep the same vertical game scale and reveal more scenery on wide phones.
const logicalWidth=()=>Math.max(960,Math.round(document.documentElement.clientWidth/document.documentElement.clientHeight*540));
const game = new Phaser.Game({ type: Phaser.AUTO, parent: 'game', width: logicalWidth(), height: 540, backgroundColor: '#101021', pixelArt: true, roundPixels: true, scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }, physics: { default: 'arcade', arcade: { gravity: { y: 1100 }, debug: false } }, scene: [Boot, Menu, Graveyard, End, Credits] });
if (import.meta.env.DEV) window.__game = game;
function resize(){
 const width=logicalWidth();
 if(game.scale.gameSize.width!==width)game.scale.setGameSize(width,540);
 game.scale.refresh();
 for(const scene of game.scene.getScenes(true))scene.layout?.();
}
const resizeObserver = new ResizeObserver(() => requestAnimationFrame(resize));
resizeObserver.observe(document.getElementById('game'));
window.visualViewport?.addEventListener('resize', () => requestAnimationFrame(resize));
window.addEventListener('resize',()=>requestAnimationFrame(resize));
