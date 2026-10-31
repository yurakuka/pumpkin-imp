import { sound } from './audio.js';

export class BoneRex {
  constructor(scene) {
    this.scene = scene;
    this.hp = 8;
    this.defeated = false;
    this.hurtUntil = 0;
    this.stunnedUntil = 0;
    this.direction = -1;
    this.sprite = scene.physics.add.sprite(26200, 390, 'rex0').setScale(3).play('rex');
    this.sprite.setSize(46, 42).setOffset(3, 4);
    this.sprite.setMaxVelocity(150, 800);
    scene.physics.add.collider(this.sprite, scene.platforms);
    scene.physics.add.overlap(scene.player, this.sprite, () => {
      if (scene.dead || scene.inComic || this.defeated) return;
      if (scene.isStomp(this.sprite)) {
        const top = this.sprite.body.top;
        this.hit();
        scene.bounceFrom(top);
      } else scene.damage(this.sprite.x);
    });
    scene.physics.add.overlap(scene.shots, this.sprite, (first, second) => {
      // Arcade can put the standalone sprite before the group's projectile.
      const bullet = first === this.sprite ? second : first;
      if (!bullet.active || this.defeated) return;
      bullet.destroy();
      this.hit();
    });
    this.panel = scene.add.container(0, 0).setScrollFactor(0).setDepth(110);
    this.panel.add(scene.add.rectangle(480, 123, 310, 44, 0x11182c, .94));
    this.label = scene.add.text(480, 113, 'BONE REX • 8 / 8', { fontFamily: 'monospace', fontSize: 15, color: '#ffe0a0' }).setOrigin(.5);
    this.bar = scene.add.rectangle(480, 135, 272, 6, 0xdf8a63);
    this.panel.add([this.label, this.bar]);
    this.panel.setVisible(false);
  }
  hit() {
    const s = this.scene;
    if (this.defeated || s.time.now < this.hurtUntil) return false;
    this.hp--;
    this.hurtUntil = s.time.now + 320;
    this.sprite.setTintFill(0xffe5c1);
    s.puff(this.sprite.x, this.sprite.y - 20, 0xe6d3a9);
    sound.tone(100, .16, 'square', .04);
    this.label.setText(`BONE REX • ${this.hp} / 8`);
    this.bar.setDisplaySize(272 * this.hp / 8, 6);
    if (this.hp === 0) {
      const x = this.sprite.x, y = this.sprite.y;
      this.defeated = true;
      this.sprite.destroy();
      this.panel.setVisible(false);
      for (let i = 0; i < 3; i++) s.puff(x + (i - 1) * 35, y - i * 15, 0xf0dfb9);
      s.lantern.clearTint().setAlpha(1);
      s.toast('BONE REX DEFEATED • The final lantern is yours!');
      sound.tone(740, .45, 'triangle', .04);
    }
    return true;
  }
  scare() {
    if (this.defeated) return;
    this.stunnedUntil = this.scene.time.now + 1200;
    this.scene.toast('Bone Rex is stunned! Fire or jump on its head.');
  }
  update() {
    if (this.defeated) return;
    const s = this.scene, b = this.sprite;
    if (Math.abs(s.player.x - b.x) > 1050) { b.setVelocityX(0); this.panel.setVisible(false); return; }
    this.panel.setVisible(true);
    if (!this.introduced) {
      this.introduced = true;
      s.toast('BONE REX • Eight hits! Fireballs or head stomps.');
    }
    if (b.x < 25920) this.direction = 1;
    if (b.x > 26450) this.direction = -1;
    b.setVelocityX(s.time.now < this.stunnedUntil ? 0 : this.direction * 72);
    b.setFlipX(this.direction < 0);
    if (s.time.now >= this.hurtUntil) b.clearTint();
  }
}
