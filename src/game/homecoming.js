import { sound } from './audio.js';
import { touch } from './touch.js';

// A short, unskippable in-world ending. The clock stops before the door opens.
export class Homecoming {
  constructor(scene) {
    this.scene=scene;
    this.started=false;
    this.x=27900;
    this.buildHouse();
    this.frame=scene.add.rectangle(this.x,405,88,134,0x30293d).setStrokeStyle(5,0x7c6a87).setDepth(10);
    this.light=scene.add.rectangle(this.x,408,70,121,0xffe9ac).setAlpha(0).setDepth(10);
    this.door=scene.add.rectangle(this.x-35,408,70,121,0x49364b).setOrigin(0,.5).setStrokeStyle(2,0x8b6c70).setDepth(14);
    this.knob=scene.add.circle(this.x+20,415,4,0xe9bd70).setDepth(15);
    this.glow=scene.add.ellipse(this.x-20,465,185,34,0xffe2a1,0).setDepth(11);
  }
  buildHouse(){
    const s=this.scene,left=27510,width=650,top=-610;

    const g=s.add.graphics().setDepth(2);
    g.fillStyle(0x343e50);g.fillRect(left,top,width,1082);
    for(let floor=0;floor<17;floor++){
      const y=top+floor*60;
      for(let col=0;col<10;col++){
        const x=left+12+col*62;
        g.fillStyle((floor*7+col*3)%9<2?0xc2a36e:0x1d3048);g.fillRect(x,y+8,47,40);
        g.lineStyle(2,0x687380);g.strokeRect(x,y+8,47,40);
        g.fillStyle(0x536174);g.fillRect(x,y+48,54,4);
      }
      g.fillStyle(0x88929b);g.fillRect(left,y+54,width,5);
    }
    for(const x of [left,left+240,left+width-18]){g.fillStyle(0x9a9fa1);g.fillRect(x,top,18,1082);}
    g.fillStyle(0x202635);g.fillRect(left-8,top-12,width+16,14);
    g.fillStyle(0x252431);g.fillRect(left+290,345,210,127);
    s.add.text(this.x,323,'LivUp',{fontFamily:'monospace',fontSize:32,fontStyle:'bold',color:'#f9efd7'}).setOrigin(.5).setDepth(3);
    s.add.rectangle(this.x,350,150,5,0xc4ab85).setDepth(3);
  }
  start() {
    const s=this.scene;
    if(this.started||s.dead||s.finished||!s.boss.defeated||s.rescues.completed!==2)return;
    this.started=true;s.escaping=true;
    s.hud.setVisible(false);s.hint.setVisible(false);s.notice.setVisible(false);
    touch.clear();touch.deactivate();
    sound.setBoost(false);s.giant.setVisible(false);s.player.setAlpha(1);
    s.cameras.main.setBounds(0,-750,28200,1290);
    s.time.delayedCall(4000,()=>{
      s.cameras.main.stopFollow();s.cameras.main.zoomTo(.45,1800);s.cameras.main.pan(27600,-60,1800);
    });
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
        s.tweens.add({targets:actor,x:this.x,y:index===0?441:472,duration:2600+index*180,ease:'Sine.easeInOut',onComplete:()=>{
          s.tweens.add({targets:actor,alpha:0,scaleX:actor.scaleX*.6,scaleY:actor.scaleY*.6,duration:400});
        }});
      });
    });
    s.time.delayedCall(6200,()=>{
      s.cameras.main.fadeOut(750,255,237,197);
      s.time.delayedCall(800,()=>s.finish(true));
    });
  }
}
