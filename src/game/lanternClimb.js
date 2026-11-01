// A short final climb: a low step, horizontal ferry, then the lantern balcony.
export class LanternClimb {
  constructor(scene) {
    this.scene=scene;
    scene.platform(26525,412,100,18);
    const balcony=scene.platform(26760,230,180,20);
    // Jump through the balcony from below; land safely on its top face.
    balcony.body.checkCollision.down=false;
    balcony.body.checkCollision.left=false;
    balcony.body.checkCollision.right=false;
    scene.add.rectangle(26850,350,10,220,0x32374c).setDepth(0);
    const ferry=scene.add.tileSprite(26635,354,110,18,'ground').setOrigin(.5,0).setDepth(6);
    scene.physics.add.existing(ferry);
    ferry.body.setAllowGravity(false).setImmovable(true);
    ferry.body.checkCollision.down=false;
    ferry.body.checkCollision.left=false;
    ferry.body.checkCollision.right=false;
    // Arcade's immovable body carries a rider by its horizontal frame delta.
    ferry.body.setFriction(1,0);
    this.ferry=ferry;
    this.direction=1;
    scene.physics.add.collider(scene.player,ferry);
    scene.add.text(26605,302,'RIDE → JUMP',{fontFamily:'monospace',fontSize:12,color:'#ffcf77'}).setOrigin(.5);
  }
  update() {
    const s=this.scene,b=this.ferry.body;
    if(s.escaping||s.dead){b.setVelocityX(0);return;}
    if(this.ferry.x>=26705)this.direction=-1;
    if(this.ferry.x<=26605)this.direction=1;
    b.setVelocityX(this.direction*48);
  }
}
