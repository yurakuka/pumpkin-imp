import { sound } from './audio.js';
export class Clowns {
 constructor(s){
  this.scene=s;this.nextBuzz=0;
  this.entries=[4850,17300,23000].map(x=>{
   const e=s.enemies.create(x,410,'clown0').play('clown').setDepth(12);
   e.setSize(28,72).setOffset(10,6);Object.assign(e,{kind:'clown',hp:3,fear:0,dir:-1,home:x,running:false,hitUntil:0});return e;
  });
 }
 hit(e){
  const s=this.scene;if(!e.active||s.time.now<e.hitUntil)return;
  e.hp--;e.hitUntil=s.time.now+180;e.setTintFill(0xffe8c0);s.puff(e.x,e.y,0xc9d2b6);
  if(e.hp<=0)s.defeatEnemy(e);
 }
 update(e){
  const s=this.scene,now=s.time.now;
  if(!e.running&&Math.abs(s.player.x-e.x)<630){e.running=true;if(now>=e.fear)e.dir=s.player.x<e.x?-1:1;}
  if(e.running){
   const scared=now<e.fear;
   e.setVelocityX(e.dir*(scared?180:205));
   if(e.body.blocked.down&&s.gaps.some(([a,b])=>e.dir>0?e.x<a&&e.x>a-65:e.x>b&&e.x<b+65))e.setVelocityY(-410);
   if(Math.abs(s.player.x-e.x)<500&&now>this.nextBuzz){this.nextBuzz=now+130;sound.tone(75+(now%80),.1,'sawtooth',.024);sound.tone(150,.07,'square',.008);}
  }
  if(now>=e.hitUntil&&now>=e.fear)e.clearTint();
  e.setFlipX(e.dir<0);
  if(e.y>600||e.x<0||e.x>28100)e.destroy();
 }
}
