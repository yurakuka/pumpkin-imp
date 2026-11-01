import Phaser from 'phaser';
import { makeArt } from '../game/art.js';
import { touch } from '../game/touch.js';
import { screenActions } from '../game/screenActions.js';
import { sound } from '../game/audio.js';
export const text=(s,x,y,t,size=20,color='#f1e7c9')=>s.add.text(x,y,t,{fontFamily:'monospace',fontSize:size,color,align:'center',lineSpacing:8}).setOrigin(.5);
export function button(s,x,y,label,fn){const bg=s.add.rectangle(x,y,270,46,0x34354d).setStrokeStyle(1,0x8c799b).setScrollFactor(0).setInteractive({useHandCursor:true});text(s,x,y,label,18).setScrollFactor(0);bg.on('pointerover',()=>bg.setFillStyle(0x55506b));bg.on('pointerout',()=>bg.setFillStyle(0x34354d));bg.on('pointerdown',fn);return bg;}
export function backdrop(s){const w=s.scale.gameSize.width;s.cameras.main.setViewport((w-960)/2,0,960,540);s.layout=()=>s.cameras.main.setViewport((s.scale.gameSize.width-960)/2,0,960,540);s.add.rectangle(480,270,960,540,0x101426);s.add.circle(750,105,65,0xc2c6a0,.8);for(let i=0;i<24;i++){s.add.rectangle(i*46,440,28,90+(i%3)*16,0x20273b);s.add.image(i*46,450,'stone').setScale(1.5);}s.add.rectangle(480,510,960,60,0x252536);}
export class Boot extends Phaser.Scene{constructor(){super('Boot')}create(){makeArt(this);for(const state of ['idle','run','jump','attack','hit','death'])this.anims.create({key:state,frames:[0,1,2,3].map(i=>({key:`imp-${state}-${i}`})),frameRate:state==='run'?12:6,repeat:state==='death'?0:-1});for(const type of ['warden','ghost','rex'])this.anims.create({key:type,frames:[{key:type+'0'},{key:type+'1'}],frameRate:6,repeat:-1});this.scene.start('Menu');document.dispatchEvent(new Event('game-ready'));}}
export class Menu extends Phaser.Scene{constructor(){super('Menu')}create(){sound.setMode('adventure');backdrop(this);text(this,480,65,'PUMPKIN IMP',48,'#ffbc61');text(this,480,114,'THE LAST HALLOWEEN',23,'#d6b4dc');this.add.sprite(480,210,'imp-idle-0').setScale(2.5).play('idle');text(this,480,290,'The lantern is stolen. Dawn is coming.\nBring Halloween home.',17);button(this,480,373,'PLAY  →',()=>{sound.start();this.scene.start('Graveyard')});button(this,480,433,'HOW TO PLAY',()=>this.instructions());text(this,480,505,'v1.1.0 • A moonlit adventure • Headphones recommended',13,'#949caf');this.input.keyboard.on('keydown-ENTER',()=>{sound.start();this.scene.start('Graveyard')});}
 instructions(){const box=this.add.container(0,0).setDepth(30);box.add(this.add.rectangle(480,270,900,490,0x13172a,.99).setStrokeStyle(2,0x9d85aa));box.add(text(this,480,80,'A LITTLE IMP. ONE LAST CHANCE.',25,'#ffbc61'));box.add(text(this,480,240,touch.enabled?'Turn your phone sideways to play.\nHold ◀ / ▶ to move.\nHold JUMP for a high jump; release for a short hop.\nHold FIRE to shoot. Tap SCARE to frighten foes.\nPAUSE stops the clock. SOUND mutes the game.\n\nRescue both friends, then find the lantern.\nCollect 15 candies to restore a heart.':'A / D or ← / →   Move\nSPACE   Jump (release for a short hop)\nJ   Throw a fireball     K   Scare all visible foes\nESC   Pause     M   Mute sound\n\nCollect candy, reach the two lantern checkpoints,\nrescue two friends, then find the lantern before dawn.\nJ fires. K scares the whole screen (8s cooldown).\nCandy restores a heart every 15 collected.',18));const b=button(this,480,444,'GOT IT',()=>box.destroy(true));box.add(b);box.add(this.children.list[this.children.list.length-1]);}
}
export class End extends Phaser.Scene {
 constructor(){super('End')}
 init(data){this.result=data}
 create(){
  sound.setMode('adventure');
  backdrop(this);
  text(this,480,115,'THE NIGHT FADES…',36,'#d6b4dc');
  this.add.sprite(480,225,'imp-idle-0').setScale(2.5).play('death');
  text(this,480,320,'A brave little spark can always try again.\nYour friends are waiting for you.',19);
  text(this,480,380,`Friends: ${this.result.rescued||0}/2  •  Candy: ${this.result.candy}  •  Time: ${this.result.time}s`,17,'#acb9c8');
  screenActions.show(this,[
   {id:'retry',label:'TRY AGAIN',run:()=>this.scene.start('Graveyard')},
   {id:'title',label:'TITLE SCREEN',run:()=>this.scene.start('Menu')},
  ]);
 }
}
