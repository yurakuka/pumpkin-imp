import Phaser from 'phaser';
import { backdrop, text } from '../scenes/Menu.js';
import { sound } from './audio.js';
export class Celebration extends Phaser.Scene {
 constructor(){super('Celebration');}
 init(result){this.result=result;}
 create(){
  backdrop(this);sound.setMode('credits');
  text(this,480,56,'ГЕЛЛОВІН РАЗОМ!',34,'#ffcf77');
  text(this,480,103,'П’ятеро друзів. Один урятований Гелловін!',15);
  this.add.rectangle(480,413,690,90,0x47354e).setStrokeStyle(3,0x9a697b);
  for(const x of [115,845]){this.add.image(x,366,'lantern');this.add.circle(x,356,42,0xffce75,.13);}
  const actors=[
   this.add.image(180,355,'pirate').setOrigin(.5,1).setScale(1.7),
   this.add.image(330,355,'duck').setOrigin(.5,1).setScale(2),
   this.add.sprite(480,355,'imp-idle-0').play('idle').setOrigin(.5,1).setScale(2),
   this.add.image(630,355,'larisa').setOrigin(.5,1).setScale(1.6),
   this.add.image(780,355,'princess').setOrigin(.5,1).setScale(1.7),
  ];
  actors.forEach((a,i)=>{this.tweens.add({targets:a,y:a.y-25,angle:i%2?6:-6,duration:360+i*65,yoyo:true,repeat:-1});});
  text(this,330,195,'Кря-кря!\nВеселого Гелловіну!',16,'#ffe598');
  text(this,630,195,'За нашого героя!\nСвяткуймо разом!',16,'#dfc3ed');
  text(this,180,392,'Барон Пірат\nВовк',13,'#d3d7e3');
  text(this,780,392,'Принцеса\nҐудзик',13,'#ffbdc2');
  for(let i=0;i<38;i++){
   const p=this.add.rectangle(75+i*22,130+(i*37)%100,4,6,[0xffc968,0xcda3ea,0x9fce90][i%3]);
   this.tweens.add({targets:p,y:470,angle:360,duration:1800+(i%7)*200,delay:(i%9)*130,repeat:-1,onRepeat:()=>p.y=110});
  }
  text(this,480,469,'ДЯКУЄМО, ЩО ПОВЕРНУЛИ ГЕЛЛОВІН ДОДОМУ',16,'#ffcf77');
  this.time.delayedCall(7200,()=>{this.cameras.main.fadeOut(500);this.time.delayedCall(550,()=>this.scene.start('Credits',this.result));});
 }
}
