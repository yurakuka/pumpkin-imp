import { sound } from './audio.js';
import { touch } from './touch.js';

// A short, unskippable in-world ending. The clock stops before the door opens.
export class Homecoming {
  constructor(scene) {
    this.scene=scene;
    this.started=false;
    this.x=26885;
    this.frame=scene.add.rectangle(this.x,405,88,134,0x30293d).setStrokeStyle(5,0x7c6a87).setDepth(10);
    this.light=scene.add.rectangle(this.x,408,70,121,0xffe9ac).setAlpha(0).setDepth(10);
    this.door=scene.add.rectangle(this.x-35,408,70,121,0x49364b).setOrigin(0,.5).setStrokeStyle(2,0x8b6c70).setDepth(14);
    this.knob=scene.add.circle(this.x+20,415,4,0xe9bd70).setDepth(15);
    this.glow=scene.add.ellipse(this.x-20,465,185,34,0xffe2a1,0).setDepth(11);
  }
  start() {
    const s=this.scene;
    if(this.started||s.dead||s.finished||!s.boss.defeated||s.rescues.completed!==2)return;
    this.started=true;s.escaping=true;
    touch.clear();touch.deactivate();
    s.player.setVelocity(0,0);s.player.body.setAllowGravity(false);
    s.physics.world.pause();
    s.hint.setText('Together, we bring Halloween home.');
    s.toast('THE LAST LIGHT • A door to a new dawn');
    sound.setMode('credits');
    s.lantern.clearTint().setAlpha(1);
    const halo=s.add.circle(s.lantern.x,s.lantern.y,85,0xffcf77,.2).setDepth(9);
    s.tweens.add({targets:halo,alpha:.35,scale:1.2,duration:600,yoyo:true,repeat:2});
    s.tweens.add({targets:[this.light,this.glow],alpha:1,duration:800});
    s.tweens.add({targets:this.door,scaleX:.06,duration:1000,delay:350,ease:'Sine.easeInOut'});
    s.tweens.add({targets:this.knob,alpha:0,duration:400});
    const actors=[s.player,...[...s.rescues.entries].reverse().map(e=>e.npc)];
    actors.forEach((actor,index)=>{
      s.time.delayedCall(1300+index*550,()=>{
        if(index===0)actor.play('run');
        actor.setRotation(0).setFlipX(false).setDepth(13);
        s.tweens.add({targets:actor,x:this.x,y:index===0?441:472,duration:1400+index*180,ease:'Sine.easeInOut',onComplete:()=>{
          s.tweens.add({targets:actor,alpha:0,scaleX:actor.scaleX*.6,scaleY:actor.scaleY*.6,duration:400});
        }});
      });
    });
    s.time.delayedCall(4900,()=>{
      s.cameras.main.fadeOut(750,255,237,197);
      s.time.delayedCall(800,()=>s.finish(true));
    });
  }
}
