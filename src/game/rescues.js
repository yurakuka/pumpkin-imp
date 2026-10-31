import { touch } from './touch.js';
import { sound } from './audio.js';

const STORIES = [
  { x: 7600, key: 'duck', name: 'THE LITTLE DUCK', help: 'Quack-quack! Help me, Pumpkin!', thanks: 'Quack-quack! My hero!\nThank you for chasing them away!', reply: 'Keep your feathers safe, little friend.\nHalloween still needs its lantern!' },
  { x: 15900, key: 'larisa', name: 'COUNTESS LARISA', help: 'A little help for a lady, please!', thanks: 'My dear Pumpkin, you saved me!\nYou have my deepest gratitude.', reply: 'Your crown is safe, Countess.\nNow let us save Halloween!' },
];

// A rescue is completed by defeating OR frightening all three local captors.
// Progress survives falls within this run. Comics suspend gameplay and its clock.
export class Rescues {
  constructor(scene) {
    this.scene = scene;
    this.completed = 0;
    this.activeComic = null;
    this.entries = STORIES.map(story => {
      const npc = scene.add.image(story.x, 472, story.key).setOrigin(.5, 1).setDepth(12);
      const label = scene.add.text(story.x, 366, story.help, { fontFamily: 'monospace', fontSize: 13, color: '#ffe6b3', backgroundColor: '#24243b', padding: { x: 8, y: 6 } }).setOrigin(.5).setDepth(12);
      const guards = [-104, 92, 170].map((offset, i) => {
        const e = scene.enemies.create(story.x + offset, 440, 'warden0').play('warden');
        e.setSize(25, 43).setOffset(8, 4);
        Object.assign(e, { kind: 'warden', home: e.x, dir: i % 2 ? 1 : -1, fear: 0, captor: true, patrol: 35 });
        return e;
      });
      scene.add.rectangle(story.x, 467, 380, 5, 0xcab87d, .6).setDepth(9);
      return { ...story, npc, label, guards, saved: false };
    });
  }

  update() {
    const s = this.scene;
    for (const entry of this.entries) {
      if (entry.saved || Math.abs(s.player.x - entry.x) > 490) continue;
      const cleared = entry.guards.every(e => !e.active || e.fear > s.time.now);
      if (!cleared) {
        if (Math.abs(s.player.x - entry.x) < 350) s.hint.setText(touch.enabled?'RESCUE • FIRE or SCARE all three captors!':'RESCUE • J: defeat captors or K: frighten all three!');
        continue;
      }
      entry.saved = true;
      this.completed++;
      entry.label.setText('SAFE!').setColor('#bce6ad');
      for (const guard of entry.guards) if (guard.active) {
        guard.banished = true;
        s.time.delayedCall(900, () => { if (guard.active) guard.destroy(); });
      }
      s.hp = 3;
      this.showComic(entry);
      break;
    }
  }

  showComic(entry) {
    const s = this.scene;
    s.inComic = true;
    touch.clear();
    touch.mode('comic');
    s.player.setVelocity(0, 0);
    s.physics.world.pause();
    sound.tone(660, .3, 'triangle', .05);
    const ui = s.add.container(0, 0).setScrollFactor(0).setDepth(300);
    // Pointer hit testing also needs the children's scroll factors set explicitly.
    const add = obj => { obj.setScrollFactor(0); ui.add(obj); return obj; };
    const words = (x, y, message, size = 18, color = '#302638') => add(s.add.text(x, y, message, { fontFamily: 'monospace', fontSize: size, color, align: 'center', lineSpacing: 7 }).setOrigin(.5));
    add(s.add.rectangle(480, 270, 960, 540, 0x0a1020, .96));
    words(480, 46, `A FRIEND IN THE DARK  •  ${this.completed} / 2`, 23, '#ffcf77');
    // Two bordered comic panels, with original pixel portraits and speech tails.
    add(s.add.rectangle(263, 260, 414, 346, 0xe9d8b3).setStrokeStyle(5, 0x403047));
    add(s.add.rectangle(697, 260, 414, 346, 0xc5d5cf).setStrokeStyle(5, 0x403047));
    add(s.add.rectangle(263, 322, 398, 203, 0x34415a));
    add(s.add.rectangle(697, 322, 398, 203, 0x30364f));
    add(s.add.circle(820, 259, 33, 0xd7d4aa));
    words(263, 112, entry.name, 20);
    add(s.add.rectangle(263, 176, 378, 90, 0xfff2d5).setStrokeStyle(2, 0x403047));
    add(s.add.triangle(260, 231, 0, 0, 20, 0, 10, 18, 0xfff2d5));
    words(263, 174, entry.thanks, 15);
    add(s.add.image(263, 409, entry.key).setOrigin(.5, 1).setScale(entry.key === 'duck' ? 3.5 : 2.4));
    words(697, 112, 'PUMPKIN IMP', 20);
    add(s.add.rectangle(697, 176, 378, 90, 0xfff2d5).setStrokeStyle(2, 0x403047));
    add(s.add.triangle(695, 231, 0, 0, 20, 0, 10, 18, 0xfff2d5));
    words(697, 174, entry.reply, 15);
    add(s.add.sprite(697, 338, 'imp-idle-0').play('idle').setScale(3));
    words(480, 458, 'A friend rescued. Three hearts rekindled. The clock waits for you.', 14, '#e2dbc7');
    const next = add(s.add.rectangle(480, 502, 372, 42, 0x625175).setStrokeStyle(2, 0xd3b88d).setInteractive({ useHandCursor: true }));
    words(480, 502, touch.enabled?'Use the CONTINUE button below':'CONTINUE  •  ENTER / SPACE', 17, '#fff0cc');
    this.activeComic = ui;
    // Do not allow a held jump/attack to immediately skip the comic.
    this.readyAt = performance.now() + 450;
    this.released = false;
    const proceed = () => { if (this.activeComic && performance.now() >= this.readyAt) this.closeComic(); };
    next.on('pointerdown', proceed);
    // Native mobile button avoids canvas camera/scale hit testing entirely.
    touch.continueAction = proceed;
  }

  comicInput() {
    const s = this.scene;
    if (!s.keys.jump.isDown && !s.keys.enter.isDown) this.released = true;
    if (this.released && performance.now() >= this.readyAt && (s.keys.jump.isDown || s.keys.enter.isDown)) this.closeComic();
  }

  closeComic() {
    if (!this.activeComic) return;
    const s = this.scene;
    this.activeComic.destroy(true);
    this.activeComic = null;
    s.inComic = false;
    touch.clear();
    touch.mode('play');
    s.physics.world.resume();
    s.hurtUntil = s.time.now + 1500;
    s.jumpBuffer = 0;
    s.toast(`${this.completed}/2 friends rescued • Onward to the lantern!`);
  }
}
