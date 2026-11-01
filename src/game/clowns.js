import { sound } from './audio.js';
export class Clowns {
 constructor(s){
  this.scene=s;this.nextBuzz=0;
  this.entries=[4850,17300,23000].map(x=>{
   const e=s.enemies.create(x,410,'clown0').play('clown').setDepth(12);
   e.setSize(28,72).setOffset(10,6);Object.assign(e,{kind:'clown',hp:5,fear:0,dir:-1,home:x,running:false,hitUntil:0,jumping:false,jumpAt:0,safeX:x,laughAt:0,laughStep:0});return e;
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
   if(e.body.blocked.down&&now>e.jumpAt+120)e.jumping=false;
   if(e.body.blocked.down&&!s.gaps.some(([a,b])=>e.x>a-55&&e.x<b+55))e.safeX=e.x;
   const gap=e.body.blocked.down&&s.gaps.find(([a,b])=>e.dir>0?e.x>=a-75&&e.x<a:e.x<=b+75&&e.x>b);
   if(gap&&!e.jumping){
    const target=e.dir>0?gap[1]+48:gap[0]-48;
    e.jumpVX=(target-e.x)/(2*530/1100);e.jumping=true;e.jumpAt=now;
    e.setVelocityY(-530);
   }
   e.setVelocityX(e.jumping?e.jumpVX:e.dir*(scared?130:90));
   if(Math.abs(s.player.x-e.x)<550&&now>=e.laughAt){
    sound.tone([190,140,175,115][e.laughStep],.17,'sawtooth',.023);
    sound.tone([380,280,350,230][e.laughStep],.12,'triangle',.012);
    e.laughStep=(e.laughStep+1)%4;e.laughAt=now+(e.laughStep?210:2600);
   }
   if(Math.abs(s.player.x-e.x)<500&&now>this.nextBuzz){this.nextBuzz=now+130;sound.tone(75+(now%80),.1,'sawtooth',.024);sound.tone(150,.07,'square',.008);}
  }
  if(now>=e.hitUntil&&now>=e.fear)e.clearTint();
  e.setFlipX(e.dir<0);
  if(e.y>570){e.body.reset(e.safeX,410);e.setVelocity(0,0);e.jumping=false;}
  if(e.x<0||e.x>28100)e.destroy();
 }
}
