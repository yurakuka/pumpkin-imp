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

  update(delta = 16) {
    this.follow(delta);
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
      entry.label.setVisible(false);
      for (const guard of entry.guards) if (guard.active) {
        guard.banished = true;
        s.time.delayedCall(900, () => { if (guard.active) guard.destroy(); });
      }
      s.hp = 5;
      this.showComic(entry);
      break;
    }
  }

  follow(delta) {
    const s=this.scene;
    if(s.inComic||s.escaping||s.dead)return;
    const view=s.cameras.main.worldView;
    const followers=this.entries.filter(e=>e.following).sort((a,b)=>a.key==='larisa'?-1:b.key==='larisa'?1:0);
    if(!followers.length)return;
    const spacing=78,canvas=s.game.canvas.getBoundingClientRect();
    const button=document.querySelector('[data-control="right"]')?.getBoundingClientRect();
    const edge=touch.enabled&&button?(button.right-canvas.left)*view.width/canvas.width+38:40;
    const minimum=edge+(followers.length-1)*spacing;
    const target=Math.max(minimum,Math.min(s.player.x-view.left-70,view.width-80));
    // Follow in camera coordinates: a moving camera cannot clamp/teleport actors.
    // Exponential damping is independent of frame rate; the train stays rigid.
    this.trainScreenX??=target;
    this.trainScreenX+=(target-this.trainScreenX)*(1-Math.exp(-Math.min(delta,80)/110));
    for(const [index,entry]of followers.entries()){
      const npc=entry.npc,oldX=npc.x;
      npc.x=view.left+this.trainScreenX-index*spacing;
      const walking=Math.abs(npc.x-oldX)>.1;
      const gap=s.gaps.find(([a,b])=>npc.x>a-35&&npc.x<b+35);
      const hop=gap?Math.sin(Math.PI*(npc.x-gap[0]+35)/(gap[1]-gap[0]+70))*75:0;
      const targetY=472-Math.max(0,hop)-(walking?Math.sin(s.time.now/120+index)*2:0);
      npc.y+=(targetY-npc.y)*(1-Math.exp(-delta/70));
      npc.setRotation(walking?Math.sin(s.time.now/170+index)*.018:0);
      if(Math.abs(npc.x-oldX)>.5)npc.setFlipX(npc.x<oldX);
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
    const ui = s.add.container((s.scale.gameSize.width-960)/2, 0).setScrollFactor(0).setDepth(300);
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
    words(480, 458, 'A friend rescued. Five hearts rekindled. The clock waits for you.', 14, '#e2dbc7');
    const next = add(s.add.rectangle(480, 502, 372, 42, 0x625175).setStrokeStyle(2, 0xd3b88d).setInteractive({ useHandCursor: true }));
    words(480, 502, touch.enabled?'Tap CONTINUE to travel together':'CONTINUE  •  ENTER / SPACE', 17, '#fff0cc');
    this.activeEntry = entry;
    this.activeComic = ui;
    s.layout();
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
    this.activeEntry.following = true;
    this.activeEntry = null;
    s.inComic = false;
    touch.clear();
    touch.mode('play');
    s.physics.world.resume();
    s.hurtUntil = s.time.now + 1500;
    s.jumpBuffer = 0;
    s.toast(`${this.completed}/2 friends rescued • Onward to the lantern!`);
  }
}
