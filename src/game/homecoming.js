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
    s.add.text(this.x,323,'LivUp',{fontFamily:'Menlo, Consolas, monospace',resolution:2,fontSize:32,fontStyle:'bold',color:'#f9efd7'}).setOrigin(.5).setDepth(3);
    s.add.rectangle(this.x,350,150,5,0xc4ab85).setDepth(3);
  }
  start() {
    const s=this.scene;
    if(this.started||s.dead||s.finished||!s.boss.defeated||s.rescues.completed!==2)return;
    this.started=true;s.escaping=true;
    s.hud.setVisible(false);s.hint.setVisible(false);s.notice.setVisible(false);
    touch.clear();touch.deactivate();s.player.setAlpha(1);
    s.player.setVelocity(0,0);s.player.body.setAllowGravity(false);s.physics.world.pause();
    s.cameras.main.setBounds(0,-750,28200,1290);sound.setMode('credits');
    s.lantern.clearTint().setAlpha(1);
    const halo=s.add.circle(s.lantern.x,s.lantern.y,85,0xffcf77,.2).setDepth(9);
    s.tweens.add({targets:halo,alpha:.35,scale:1.2,duration:600,yoyo:true,repeat:2});
    const actors=[s.player,...[...s.rescues.entries].reverse().map(e=>e.npc)];
    actors.forEach((actor,index)=>s.time.delayedCall(600+index*350,()=>{
      if(index===0)actor.play('run');actor.setRotation(0).setFlipX(false).setDepth(13);
      s.tweens.add({targets:actor,x:this.x-125-index*78,y:index===0?441:472,duration:2400,ease:'Sine.easeInOut',onComplete:()=>{if(index===0)actor.play('idle');}});
    }));
    s.time.delayedCall(3600,()=>{
      s.tweens.add({targets:[this.light,this.glow],alpha:1,duration:600});
      s.tweens.add({targets:this.door,scaleX:.06,duration:700});this.knob.setAlpha(0);
      const princess=s.npcs.princess.setVisible(true);
      s.tweens.add({targets:princess,x:this.x-55,duration:700});
    });
    s.time.delayedCall(4400,()=>{
      this.greeting=true;
      const z=s.cameras.main.zoom,w=s.scale.gameSize.width;
      const panel=s.add.container(w/2-480/z,270-270/z).setScale(1/z).setScrollFactor(0).setDepth(250);
      panel.add(s.add.rectangle(480,168,850,126,0x252237,.98).setStrokeStyle(2,0xd38c96));
      panel.add(s.add.text(480,130,'Вартова Принцеса Ґудзик',{fontFamily:'Menlo, Consolas, monospace',resolution:2,fontSize:20,color:'#ffbdc2'}).setOrigin(.5).setScrollFactor(0));
      panel.add(s.add.text(480,183,'Нарешті ви впоралися! А тепер налякайте всіх!\nЗаходьте — Гелловін починається!',{fontFamily:'Menlo, Consolas, monospace',resolution:2,fontSize:18,color:'#fff0d1',align:'center',lineSpacing:8}).setOrigin(.5).setScrollFactor(0));
      this.dialogue=panel;
    });
    s.time.delayedCall(8400,()=>{
      this.dialogue?.destroy(true);this.greeting=false;
      actors.forEach((actor,index)=>s.time.delayedCall(index*400,()=>{
        if(index===0)actor.play('run');
        s.tweens.add({targets:actor,x:this.x,y:index===0?441:472,duration:1000+index*120,ease:'Sine.easeIn',onComplete:()=>{
          s.tweens.add({targets:actor,alpha:0,duration:250});if(index===2){this.allInsideAt=s.time.now+250;s.time.delayedCall(250,()=>this.afterEntry());}
        }});
      }));
      s.tweens.add({targets:s.npcs.princess,x:this.x,alpha:0,duration:700,delay:2300});
    });
  }
  afterEntry(){
    const s=this.scene;
    s.cameras.main.stopFollow();s.cameras.main.zoomTo(.45,1600);s.cameras.main.pan(27600,-60,1600);
    s.time.delayedCall(2000,()=>{
      this.screamAt=s.time.now;sound.scream();s.cameras.main.shake(180,.006);
      const flash=s.add.rectangle(this.x,408,70,121,0xffffff,.6).setDepth(20);
      s.tweens.add({targets:flash,alpha:0,duration:450,onComplete:()=>flash.destroy()});
    });
    s.time.delayedCall(2900,()=>{this.laughAt=s.time.now;sound.laugh();});
    s.time.delayedCall(4600,()=>{s.cameras.main.fadeOut(500,255,237,197);s.time.delayedCall(550,()=>s.finish(true));});
  }
}
