import { sound } from './audio.js';
export class FogChase {
 constructor(s){
  this.scene=s;this.started=false;this.active=false;this.complete=false;this.front=0;this.nextAttack=0;this.windup=0;
  this.mist=s.add.container().setDepth(18).setVisible(false);
  this.mist.add(s.add.rectangle(-900,270,1800,700,0x222536,.8));
  this.tendrils=[];
  for(let i=0;i<12;i++){
   const cloud=s.add.ellipse(-25-i%3*22,20+i*48,130,110,0x596276,.45);this.mist.add(cloud);
   s.tweens.add({targets:cloud,x:cloud.x+25,y:cloud.y+15,scaleX:1.2,duration:1100+i*80,yoyo:true,repeat:-1});
  }
  for(let i=0;i<4;i++){
   const face=s.add.container(-40-i%2*32,130+i*85);
   face.add(s.add.ellipse(0,0,48,52,0x171927,.7));
   face.add(s.add.rectangle(-11,-6,8,4,0xbde0be));face.add(s.add.rectangle(11,-6,8,4,0xbde0be));
   face.add(s.add.ellipse(0,12,12,19,0x080d18));this.mist.add(face);
   s.tweens.add({targets:face,alpha:.25,x:face.x+16,duration:1500+i*200,yoyo:true,repeat:-1});
  }
  this.claws=s.physics.add.group({allowGravity:false});
  s.physics.add.overlap(s.player,this.claws,(_,claw)=>{if(!claw.active||s.dead||s.escaping)return;const x=claw.x;claw.destroy();s.damage(x);});
  s.physics.add.overlap(s.shots,this.claws,(shot,claw)=>{if(!shot.active||!claw.active)return;s.puff(claw.x,claw.y,0x9da8ba);shot.destroy();claw.destroy();});
 }
 attack(){
  const s=this.scene;
  const claw=this.claws.create(this.front+24,435,'fog-claw').setDepth(19);
  claw.setVelocityX(380);claw.expires=s.time.now+3600;
  sound.tone(85,.35,'sawtooth',.027);this.windup=0;this.nextAttack=s.time.now+2400;
 }
 update(delta){
  const s=this.scene,p=s.player;
  for(const c of this.claws.getChildren())if(s.time.now>c.expires)c.destroy();
  if(!this.started&&p.x>=11800&&p.x<14300){this.started=this.active=true;this.front=p.x-330;this.nextAttack=s.time.now+1300;this.mist.setVisible(true);s.toast('ГОЛОДНИЙ ТУМАН • Тікай до світла! Перестрибуй пазурі або стріляй!');}
  if(!this.active)return;
  this.front+=190*delta/1000;
  if(p.x-this.front>360)this.front=p.x-360;
  if(p.y>540)this.front=Math.min(this.front,s.safeGround.x-450);
  this.mist.x=this.front;
  if(!this.windup&&s.time.now>=this.nextAttack){this.windup=s.time.now+550;this.mist.setAlpha(1);s.toast('ТУМАН АТАКУЄ • Стрибай або збий пазурі вогнем!');}
  if(this.windup&&s.time.now>=this.windup)this.attack();
  if(p.x<this.front+35&&p.y<540){s.damage(this.front-100);this.front=p.x-260;}
  if(p.x>=14300){this.active=false;this.complete=true;this.claws.clear(true,true);s.tweens.add({targets:this.mist,alpha:0,duration:1000,onComplete:()=>this.mist.setVisible(false)});s.remaining+=10;s.toast('ВТЕКЛИ ВІД ТУМАНУ • +10 секунд!');sound.tone(740,.4);}
 }
 respawn(){if(this.active){this.front=Math.min(this.front,this.scene.safeGround.x-450);this.claws.clear(true,true);this.windup=0;this.nextAttack=this.scene.time.now+1700;}}
}
