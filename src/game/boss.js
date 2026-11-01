import { sound } from './audio.js';

export class BoneRex {
  constructor(scene) {
    this.scene = scene;
    this.hp = 8;this.phase=1;this.nextStomp=0;this.windupUntil=0;
    this.waves=scene.physics.add.group({allowGravity:false});
    scene.physics.add.overlap(scene.player,this.waves,(_,wave)=>{if(wave.active&&!scene.escaping){const x=wave.x;wave.destroy();scene.damage(x);}});
    this.defeated = false;
    this.hurtUntil = 0;
    this.stunnedUntil = 0;
    this.direction = -1;
    this.nextThrow = 0;
    this.bones = scene.physics.add.group({allowGravity:false});
    scene.physics.add.overlap(scene.player,this.bones,(_,bone)=>{
      if(!bone.active||scene.dead||scene.inComic||scene.escaping)return;
      const x=bone.x;bone.destroy();scene.damage(x);
    });
    scene.physics.add.overlap(scene.shots,this.bones,(shot,bone)=>{
      if(!shot.active||!bone.active)return;
      scene.puff(bone.x,bone.y,0xe8dfbf);shot.destroy();bone.destroy();
      sound.tone(360,.08,'square',.025);
    });
    this.sprite = scene.physics.add.sprite(26200, 390, 'rex0').setScale(3).play('rex');
    this.sprite.setSize(46, 42).setOffset(3, 4);
    this.sprite.setMaxVelocity(150, 800);
    scene.physics.add.collider(this.sprite, scene.platforms);
    scene.physics.add.overlap(scene.player, this.sprite, () => {
      if (scene.dead || scene.inComic || this.defeated) return;
      if(scene.boosted){this.hit();}
      else if (scene.isStomp(this.sprite)) {
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
    if(this.hp===4){this.phase=2;this.nextStomp=s.time.now+1400;s.toast('BONE REX ENRAGED • Jump over the stomp waves!');this.sprite.setTint(0xed9875);}
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
      this.bones.clear(true,true);
      this.waves.clear(true,true);
      sound.setMode('adventure');
      this.panel.setVisible(false);
      for (let i = 0; i < 3; i++) s.puff(x + (i - 1) * 35, y - i * 15, 0xf0dfb9);
      s.lantern.clearTint().setAlpha(1);
      s.toast('BONE REX DEFEATED • Ride the platform and jump to the lantern!');
      sound.tone(740, .45, 'triangle', .04);
    }
    return true;
  }
  scare() {
    if (this.defeated) return;
    this.stunnedUntil = this.scene.time.now + 1800;
    this.scene.toast('Bone Rex is stunned! Fire or jump on its head.');
  }
  throwBone() {
    const s=this.scene;
    if(this.defeated||s.dead||s.inComic||s.escaping)return;
    const direction=s.player.x<this.sprite.x?-1:1;
    const bone=this.bones.create(this.sprite.x+direction*68,440,'bone').setDepth(14);
    bone.setSize(24,10).setOffset(2,2);
    // A low, readable shot with a fixed launch direction: jump or shoot it.
    bone.setVelocityX(direction*155).setAngularVelocity(direction*210);
    bone.expires=s.time.now+6500;
    sound.tone(175,.12,'triangle',.035);
  }
  stomp(){
    const s=this.scene;this.windupUntil=0;
    s.cameras.main.shake(160,.006);sound.tone(48,.3,'sawtooth',.045);
    for(const dir of [-1,1]){const wave=this.waves.create(this.sprite.x+dir*76,459,'shockwave').setDepth(12);wave.setVelocityX(dir*215);wave.expires=s.time.now+3800;}
    this.nextStomp=s.time.now+3600;
  }
  update() {
    const s=this.scene;
    for(const bone of this.bones.getChildren())if(s.time.now>bone.expires||Math.abs(bone.x-s.player.x)>1500)bone.destroy();
    for(const w of this.waves.getChildren())if(s.time.now>w.expires)w.destroy();
    if (this.defeated) return;
    const b = this.sprite;
    if (Math.abs(s.player.x - b.x) > 1050) { b.setVelocityX(0); this.panel.setVisible(false); return; }
    this.panel.setVisible(true);
    if (!this.introduced) {
      this.introduced = true;
      this.nextThrow=s.time.now+1800;
      sound.setMode('boss');
      s.toast('BONE REX • Jump over bones or shoot them! Eight hits to win.');
    }
    if(this.phase===2&&s.time.now>=this.stunnedUntil){
      if(this.windupUntil&&s.time.now>=this.windupUntil)this.stomp();
      else if(!this.windupUntil&&s.time.now>=this.nextStomp){this.windupUntil=s.time.now+650;b.setTintFill(0xefb38a);s.toast('STOMP! Jump over the ground wave!');}
    }
    if(s.time.now>=this.stunnedUntil&&!this.windupUntil&&s.time.now>=this.nextThrow){this.throwBone();this.nextThrow=s.time.now+(this.phase===2?1600:2200);}
    if (b.x < 25920) this.direction = 1;
    if (b.x > 26450) this.direction = -1;
    b.setVelocityX(s.time.now < this.stunnedUntil||this.windupUntil ? 0 : this.direction * (this.phase===2?95:72));
    b.setFlipX(this.direction < 0);
    if (s.time.now >= this.hurtUntil&&!this.windupUntil) {b.clearTint();if(this.phase===2)b.setTint(0xed9875);}
  }
}
