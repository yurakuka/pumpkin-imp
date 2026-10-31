export class PathLights {
  constructor(scene, gaps) {
    this.scene = scene;
    this.lamps = [];
    for (let x = 520; x < 25600; x += 1150) {
      if (gaps.some(([a,b]) => x > a - 50 && x < b + 50)) continue;
      scene.add.rectangle(x, 430, 5, 84, 0x67525d).setDepth(6);
      const glow = scene.add.circle(x, 368, 52, 0xffc968, 0).setDepth(5);
      const image = scene.add.image(x, 368, 'lantern').setTint(0x696579).setDepth(7);
      this.lamps.push({ x, glow, image, lit: false });
    }
  }
  update() {
    for (const lamp of this.lamps) {
      if (lamp.lit || this.scene.player.x < lamp.x - 45) continue;
      lamp.lit = true;
      lamp.image.clearTint();
      lamp.glow.setAlpha(.15);
      this.scene.tweens.add({ targets: lamp.glow, alpha: .08, duration: 900, yoyo: true, repeat: -1 });
    }
  }
}
