import { sound } from './audio.js';
export class FogChase {
 constructor(s){
  this.scene=s;this.started=false;this.active=false;this.complete=false;
  this.front=0;this.mist=s.add.container(0,0).setDepth(18).setVisible(false);
  this.mist.add(s.add.rectangle(-900,270,1800,540,0x92a0bb,.48));
  for(let i=0;i<10;i++)this.mist.add(s.add.ellipse(-35-i%3*24,35+i*56,125,100,0xb7c3d5,.32));
 }
 update(delta){
  const s=this.scene,p=s.player;
  if(!this.started&&p.x>=11800&&p.x<14300){this.started=this.active=true;this.front=p.x-330;this.mist.setVisible(true);s.toast('THE HUNGRY FOG • Run! Reach the light ahead!');}
  if(!this.active)return;
  this.front+=190*delta/1000;
  if(p.x-this.front>360)this.front=p.x-360;
  if(p.y>540)this.front=Math.min(this.front,s.safeGround.x-450);
  this.mist.x=this.front;
  if(p.x<this.front+35&&p.y<540){s.damage(this.front-100);this.front=p.x-260;}
  if(p.x>=14300){this.active=false;this.complete=true;s.tweens.add({targets:this.mist,alpha:0,duration:1000,onComplete:()=>this.mist.setVisible(false)});s.remaining+=10;s.toast('OUT OF THE FOG • +10 seconds!');sound.tone(740,.4);}
 }
 respawn(){if(this.active)this.front=Math.min(this.front,this.scene.safeGround.x-450);}
}
