import Phaser from 'phaser';
import { backdrop, text, button } from './Menu.js';
import { screenActions } from '../game/screenActions.js';
import { sound } from '../game/audio.js';

export class Credits extends Phaser.Scene {
  constructor() { super('Credits'); }
  init(result) { this.result = result; }
  create() {
    sound.setMode('credits');
    backdrop(this);
    text(this, 480, 43, 'HALLOWEEN IS SAVED!', 34, '#ffcf77');
    text(this, 480, 80, 'The lantern is home. And so are your friends.', 17, '#d6b4dc');
    const speech = (x, message) => {
      this.add.rectangle(x, 143, 340, 86, 0xffedcd).setStrokeStyle(3, 0x80617c);
      this.add.triangle(x, 194, 0, 0, 20, 0, 10, 18, 0xffedcd);
      text(this, x, 143, message, 16, '#302638');
    };
    speech(205, 'Quack-quack! Thank you!\nYou saved our Halloween!');
    speech(755, 'Thank you, dear Pumpkin.\nYou brought us safely home.');
    this.add.image(205, 303, 'duck').setOrigin(.5, 1).setScale(2.15);
    this.add.image(755, 303, 'larisa').setOrigin(.5, 1).setScale(1.5);
    this.add.sprite(480, 292, 'imp-idle-0').setOrigin(.5, 1).setScale(2.3).play('idle');
    const lantern = this.add.image(480, 165, 'lantern').setScale(1.1);
    this.tweens.add({ targets: lantern, y: 156, duration: 1000, yoyo: true, repeat: -1 });
    text(this, 205, 322, 'THE LITTLE DUCK', 15, '#ffcf77');
    text(this, 480, 322, 'PUMPKIN IMP', 15, '#ffcf77');
    text(this, 755, 322, 'COUNTESS LARISA', 15, '#ffcf77');
    this.add.rectangle(480, 385, 870, 91, 0x12182a, .94).setStrokeStyle(1, 0x65566f);
    const pages = [
      'STARRING\nPumpkin Imp • The Little Duck • Countess Larisa',
      'THE LAST HALLOWEEN\nOriginal pixel art & chiptune • Built with Phaser',
      `YOUR HALLOWEEN\nFoes defeated: ${this.result.defeated||0} • Frenzies: ${this.result.powerups||0}\nFog escape: ${this.result.fog?'COMPLETE':'Not reached'}`,
      'SPECIAL THANKS TO YOU\nFor every leap, every rescue, and every little spark.\nTHANK YOU FOR PLAYING!',
    ];
    this.creditPage = 0;
    const roll = text(this, 480, 385, pages[0], 17);
    this.time.addEvent({ delay: 4500, loop: true, callback: () => {
      this.tweens.add({ targets: roll, alpha: 0, duration: 250, onComplete: () => {
        this.creditPage = (this.creditPage + 1) % pages.length;
        roll.setText(pages[this.creditPage]);
        this.tweens.add({ targets: roll, alpha: 1, duration: 350 });
      } });
    } });
    text(this, 480, 433, `Friends ${this.result.rescued}/2  •  Candy ${this.result.candy}  •  ${this.result.time}s before dawn`, 15, '#d4c8bc');
    screenActions.show(this,[{id:'retry',label:'PLAY AGAIN',run:()=>this.scene.start('Graveyard')},{id:'title',label:'TITLE SCREEN',run:()=>this.scene.start('Menu')}]);
    sound.tone(523, .3, 'triangle', .035);
    this.time.delayedCall(180, () => sound.tone(784, .45, 'triangle', .035));
  }
}
