import Phaser from 'phaser';
import { Homecoming } from '../game/homecoming.js';
import { BoneRex } from '../game/boss.js';
import { PathLights } from '../game/pathLights.js';
import { screenActions } from '../game/screenActions.js';
import { touch } from '../game/touch.js';
import { Rescues } from '../game/rescues.js';
import { sound } from '../game/audio.js';
import { text, button } from './Menu.js';
const WIDTH=27000, FLOOR=472, PIT_COUNT=15, START_TIME=210, MAX_HEALTH=5, SCARE_COOLDOWN=8000;
export class Graveyard extends Phaser.Scene {
 constructor(){super('Graveyard')}
 create(){
 sound.setMode('adventure');this.escaping=false;this.jumpStartedAt=-Infinity;this.gasEmitted=false;this.inComic=false;this.lastGround=-1000;this.jumpBuffer=0;this.hp=MAX_HEALTH;this.candy=0;this.remaining=START_TIME;this.spawn={x:100,y:390};this.safeGround={x:100,y:447};this.hurtUntil=0;this.fireAt=0;this.scareAt=0;this.attackUntil=0;this.dead=false;this.paused=false;this.elapsed=0;this.facing=1;this.finished=false;this.checkpointIndex=0;
 this.physics.world.resume();this.physics.world.setBounds(0,0,WIDTH,650);this.cameras.main.setBounds(0,0,WIDTH,540);
 this.scenery();this.platforms=this.physics.add.staticGroup();
 const gaps=this.gaps=Array.from({length:PIT_COUNT},(_,i)=>[1370+i*1650,1510+i*1650]);
 let start=0;for(const [a,b]of gaps){this.platform(start,FLOOR,a-start,80);start=b;}this.platform(start,FLOOR,WIDTH-start,80);
 const ledges=[];for(let i=0;i<51;i++){let x=480+i*515,y=i%3===0?330:365;const w=150+(i%2)*50;if(x>=25600)continue;if([7600,15900].some(n=>x+w>n-240&&x<n+240))continue;if(gaps.some(([a,b])=>x+w>a-240&&x<b+100))continue;this.platform(x,y,w,20);ledges.push([x,y]);}
 // Pits have clear approach paths for predictable running jumps.
 this.candies=this.physics.add.staticGroup();for(let x=260;x<WIDTH-300;x+=155){if(!gaps.some(([a,b])=>x>a-10&&x<b+10))this.candies.create(x,430,'candy');}for(const [x,y]of ledges)for(let j=0;j<3;j++)this.candies.create(x+25+j*45,y-30,'candy');
 this.player=this.physics.add.sprite(100,390,'imp-idle-0').setScale(1.25);this.player.setSize(29,34).setOffset(10,10).setCollideWorldBounds(true);this.player.body.setMaxVelocity(300,800);this.physics.add.collider(this.player,this.platforms);
 this.enemies=this.physics.add.group();for(let i=0;i<61;i++){let x=650+i*425;if(gaps.some(([a,b])=>x>a-60&&x<b+60))x+=160;if(x>25500||[7600,15900].some(n=>Math.abs(n-x)<400))continue;const e=this.enemies.create(x,420,'warden0').play('warden');e.setSize(25,43).setOffset(8,4);e.kind='warden';e.home=x;e.dir=i%2?1:-1;e.fear=0;}
 for(let i=0;i<41;i++){const x=1050+i*620;if(x>25500||[7600,15900].some(n=>Math.abs(n-x)<400))continue;const e=this.enemies.create(x,235+(i%3)*45,'ghost0').play('ghost');e.setSize(28,50).setOffset(10,5);e.body.setAllowGravity(false);e.kind='ghost';e.home=e.x;e.baseY=e.y;e.dir=-1;e.fear=0;}
 this.physics.add.collider(this.enemies,this.platforms);this.physics.add.overlap(this.player,this.enemies,(_,e)=>this.contactEnemy(e));
 this.shots=this.physics.add.group({allowGravity:false});this.physics.add.collider(this.shots,this.platforms,b=>b.destroy());this.physics.add.overlap(this.shots,this.enemies,(b,e)=>{if(!b.active||!e.active)return;b.destroy();this.defeatEnemy(e)});
 this.physics.add.overlap(this.player,this.candies,(_,c)=>{c.destroy();this.candy++;sound.tone(720,.07,'sine',.03);if(this.candy%15===0){this.hp=Math.min(MAX_HEALTH,this.hp+1);this.toast('Candy magic restored a heart!');}});
 this.checkpoints=[9000,18000].map((x,i)=>{this.add.rectangle(x,425,6,94,0x8a7290);const c=this.physics.add.staticImage(x,370,'lantern').setTint(0x887b9b);c.index=i+1;c.glow=this.add.circle(x,370,65,0xffc968,0).setDepth(5);return c;});for(const c of this.checkpoints)this.physics.add.overlap(this.player,c,()=>{this.activateCheckpoint(c)});
 this.add.rectangle(WIDTH-250,420,180,104,0x32374c).setStrokeStyle(2,0x6f6c82);this.lantern=this.physics.add.staticImage(WIDTH-250,320,'lantern').setScale(2).refreshBody();this.tweens.add({targets:this.lantern,y:305,duration:900,yoyo:true,repeat:-1});this.physics.add.overlap(this.player,this.lantern,()=>{if(!this.boss.defeated)this.toast('Defeat Bone Rex before claiming the final lantern!');else if(this.rescues.completed===2)this.homecoming.start();else this.toast('Rescue both friends before taking the lantern!');});
 this.cameras.main.startFollow(this.player,true,.09,.09,-120,50);
 this.keys=this.input.keyboard.addKeys({left:'LEFT',right:'RIGHT',a:'A',d:'D',jump:'SPACE',fire:'J',scare:'K',pause:'ESC',mute:'M',enter:'ENTER'});
 this.hud=this.add.container(0,0).setScrollFactor(0).setDepth(100);this.hud.add(this.add.rectangle(480,31,960,62,0x101424,.94));this.hearts=text(this,94,28,'',24,'#ef987a').setScrollFactor(0);this.counter=text(this,320,28,'',14).setScrollFactor(0);this.clock=text(this,570,28,'',18).setScrollFactor(0);this.hud.add([this.hearts,this.counter,this.clock]);
 const mute=this.add.text(865,20,'[M] SOUND',{fontFamily:'monospace',fontSize:12,color:'#c7c5c7'}).setScrollFactor(0).setInteractive({useHandCursor:true});mute.on('pointerdown',()=>this.mute());this.muteLabel=mute;this.hud.add(mute);
 this.hint=text(this,480,510,'A/D Move   SPACE Jump   J Fire   K Scare   ESC Pause',14,'#bec3ce').setScrollFactor(0).setDepth(100);
 this.notice=text(this,480,95,'',19,'#ffcf77').setScrollFactor(0).setDepth(100);this.toast('Rescue two friends and recover the lantern before dawn!');
 this.rescues=new Rescues(this);
 this.pathLights=new PathLights(this,gaps);
 this.boss=new BoneRex(this);
 this.homecoming=new Homecoming(this);
 this.lantern.setTint(0x96849f).setAlpha(.6);
 touch.activate(()=>{if(!this.paused&&!this.inComic&&!this.finished&&!this.dead)this.pause();});
 touch.mode('play');
 this.layout();
 this.events.once('shutdown',()=>touch.deactivate());
 
 }
 layout(){
 const width=this.scale.gameSize.width,offset=(width-960)/2;
 this.cameras.main.setViewport(0,0,width,540);
 if(this.hud)this.hud.x=offset;
 if(this.hint)this.hint.x=width/2;
 if(this.notice)this.notice.x=width/2;
 if(this.boss)this.boss.panel.x=offset;
 if(this.pauseUI)this.pauseUI.x=offset;
 if(this.rescues?.activeComic)this.rescues.activeComic.x=offset;
 }
 activateCheckpoint(c){
 if(c.index<=this.checkpointIndex)return;
 this.checkpointIndex=c.index;this.spawn={x:c.x,y:390};this.hp=MAX_HEALTH;c.clearTint();c.glow.setAlpha(.16);
 this.toast('CHECKPOINT • Your spark is safe');sound.tone(520,.4);
 }
 isStomp(e){
 const p=this.player;
 return e.active&&p.body.velocity.y>50&&p.body.prev.y+p.body.height<=e.body.top+18&&p.body.bottom>=e.body.top;
 }
 bounceFrom(top){
 const p=this.player;
 p.body.reset(p.x,p.y-(p.body.bottom-top)-2);p.setVelocityY(-370);
 this.lastGround=-1000;this.jumpBuffer=0;sound.tone(410,.1,'square',.025);
 }
 defeatEnemy(e){
 if(!e.active)return;
 this.puff(e.x,e.y,0xffc879);e.destroy();sound.tone(150,.14,'square',.025);
 }
 contactEnemy(e){
 if(!e.active||this.dead||this.inComic)return;
 if(this.isStomp(e)){const top=e.body.top;this.defeatEnemy(e);this.bounceFrom(top);}
 else if(!e.banished&&this.time.now>e.fear)this.damage(e.x);
 }
 jumpGas(){
 for(let i=0;i<7;i++){
 const cloud=this.add.rectangle(this.player.x+(i-3)*3,this.player.body.bottom+3,8+i%2*2,7,i%2?0x7fbd55:0xa7cf63,.38).setDepth(9).setData('jumpGas',true);
 this.tweens.add({targets:cloud,x:cloud.x+(i-3)*5,y:cloud.y+18+i*2,scale:1.6,alpha:0,duration:480,onComplete:()=>cloud.destroy()});
 }
 }
 scare(){
 const now=this.time.now,p=this.player,view=this.cameras.main.worldView;
 this.scareAt=now+SCARE_COOLDOWN;this.attackUntil=now+400;
 sound.tone(65,.45,'sawtooth',.05);
 const flash=this.add.rectangle(view.centerX,view.centerY,view.width,view.height,0xc8a2e8,.15).setDepth(15);
 this.tweens.add({targets:flash,alpha:0,duration:450,onComplete:()=>flash.destroy()});
 const visible=e=>e.active&&Phaser.Geom.Intersects.RectangleToRectangle(view,e.getBounds());
 for(const e of this.enemies.getChildren())if(visible(e)){e.fear=now+2800;e.dir=e.x<p.x?-1:1;e.setTint(0xc29ee0);}
 if(!this.boss.defeated&&visible(this.boss.sprite))this.boss.scare();
 }
 rememberSafeGround(){
 const p=this.player;
 // Only solid floor counts: never save a mid-air position, a floating ledge,
 // or a point too close to a pit. This also handles travelling back to the left.
 if(p.body.blocked.down&&Math.abs(p.body.bottom-FLOOR)<2&&
 !this.gaps.some(([a,b])=>p.x>a-64&&p.x<b+64)){
 this.safeGround={x:p.x,y:p.y};
 }
 }
 platform(x,y,w,h){const p=this.add.tileSprite(x,y,w,h,'ground').setOrigin(0);this.physics.add.existing(p,true);this.platforms.add(p);}
 scenery(){this.add.rectangle(0,0,WIDTH,650,0x11182c).setOrigin(0);const moon=this.add.circle(730,120,57,0xd1d4ad,.9).setScrollFactor(0);this.add.circle(730,120,74,0xabbda2,.06).setScrollFactor(0);for(let i=0;i<150;i++)this.add.rectangle((i*131)%7000,35+(i*47)%270,i%4===0?3:2,2,0xa4b0be,.6).setScrollFactor(.15);
 for(let i=0;i<170;i++){const x=i*235;this.add.triangle(x,440,0,0,85,-140-(i%4)*25,170,0,0x202b41).setScrollFactor(.4);}
 for(let i=0;i<200;i++){let x=i*182;this.add.rectangle(x,385,12,175,0x192133).setScrollFactor(.7);this.add.line(0,0,x,320,x-42,275,0x192133).setLineWidth(5).setScrollFactor(.7);this.add.line(0,0,x,350,x+50,290,0x192133).setLineWidth(4).setScrollFactor(.7);}
 for(let i=0;i<310;i++){let x=i*118+40;this.add.image(x,FLOOR-20,'stone').setAlpha(.55).setScale(i%3===0?1.4:1);}
 for(let i=0;i<53;i++){const f=this.add.ellipse(i*690,452,420,35,0xa3b9c5,.065).setDepth(8);this.tweens.add({targets:f,x:f.x+130,duration:11000+i*300,yoyo:true,repeat:-1});}
 const signs=[[190,'THE HOLLOW'],[7480,'QUACK HOLLOW'],[15780,'COUNTESS COURT'],[26150,'THE LAST LIGHT']];for(const [x,t]of signs){this.add.rectangle(x,423,5,90,0x67515c);this.add.rectangle(x,388,150,26,0x3b3446);text(this,x,388,t,12,'#b7afaf');}}
 toast(t){this.notice.setText(t);if(this.noticeTimer)this.noticeTimer.remove();this.noticeTimer=this.time.delayedCall(4200,()=>this.notice.setText(''));}
 puff(x,y,color){for(let i=0;i<8;i++){const p=this.add.rectangle(x,y,4,4,color).setDepth(20);this.tweens.add({targets:p,x:x+Phaser.Math.Between(-40,40),y:y+Phaser.Math.Between(-40,20),alpha:0,duration:400,onComplete:()=>p.destroy()});}}
 mute(){sound.toggle();this.muteLabel.setText(sound.muted?'[M] MUTED':'[M] SOUND');document.querySelector('[data-control="mute"]').textContent=sound.muted?'MUTED':'SOUND';}
 damage(from){if(this.dead||this.inComic||this.time.now<this.hurtUntil)return;this.hp--;this.hurtUntil=this.time.now+1600;this.player.setVelocity((this.player.x<from?-1:1)*220,-260);sound.tone(90,.25,'sawtooth',.05);this.cameras.main.shake(130,.006);if(this.hp<=0)this.die();}
 die(){if(this.dead)return;this.dead=true;this.player.setVelocity(0,-150).play('death');this.time.delayedCall(850,()=>this.finish(false));}
 finish(win){if(this.finished)return;this.finished=true;this.scene.start(win?'Credits':'End',{win,candy:this.candy,time:Math.max(0,Math.ceil(this.remaining)),rescued:this.rescues.completed});}
 pause(){
 touch.clear();this.paused=!this.paused;touch.mode(this.paused?'paused':'play');
 if(this.paused){
 this.physics.world.pause();this.pauseUI=this.add.container((this.scale.gameSize.width-960)/2,0).setDepth(200).setScrollFactor(0);
 this.pauseUI.add(this.add.rectangle(480,270,960,540,0x080d1c,.9));
 this.pauseUI.add(text(this,480,165,'THE NIGHT HOLDS ITS BREATH',28,'#ffc87c').setScrollFactor(0));
 this.pauseUI.add(text(this,480,245,'PAUSED\nTake a breath. Your adventure will wait.',18).setScrollFactor(0));
 screenActions.show(this,[{id:'resume',label:'RESUME',run:()=>this.pause()},{id:'restart',label:'RESTART LEVEL',run:()=>this.scene.restart()}]);
 }else{screenActions.hide();this.physics.world.resume();this.pauseUI.destroy(true);}
 }
 update(_,delta){if(!this.keys||this.finished)return;if(this.escaping)return;const k=this.keys;if(Phaser.Input.Keyboard.JustDown(k.mute)||touch.take('mute'))this.mute();if(this.inComic){this.rescues.comicInput();return;}if(Phaser.Input.Keyboard.JustDown(k.pause)||touch.take('pause'))this.pause();if(touch.blocked&&!this.paused)this.pause();if(this.paused)return;
 this.remaining-=delta/1000;this.elapsed+=delta;if(this.remaining<=0){this.finish(false);return;}
 this.hearts.setText('♥'.repeat(this.hp)+'♡'.repeat(MAX_HEALTH-this.hp));this.counter.setText(`CANDY ${String(this.candy).padStart(3,'0')}  FRIENDS ${this.rescues.completed}/2`);this.clock.setText(`DAWN IN ${Math.floor(this.remaining/60)}:${String(Math.floor(this.remaining%60)).padStart(2,'0')}`);
 if(this.dead)return;const p=this.player,now=this.time.now,onGround=p.body.blocked.down;this.rememberSafeGround();this.lastGround=onGround?now:(this.lastGround||0);if(Phaser.Input.Keyboard.JustDown(k.jump)||touch.take('jump'))this.jumpBuffer=now+120;
 if(now<this.hurtUntil-1250){}else{const dir=(k.right.isDown||k.d.isDown||touch.held('right')?1:0)-(k.left.isDown||k.a.isDown||touch.held('left')?1:0);p.setVelocityX(dir*240);if(dir)this.facing=dir;}
 // Preserve the asymmetric face while reversing only the direction of movement.
 if(this.jumpBuffer>now&&now-this.lastGround<100){p.setVelocityY(-570);this.jumpStartedAt=now;this.gasEmitted=false;this.jumpBuffer=0;this.lastGround=-1000;sound.tone(330,.13);}
 if((Phaser.Input.Keyboard.JustUp(k.jump)||touch.takeRelease('jump'))&&p.body.velocity.y<-180)p.setVelocityY(-180);
 if(!this.gasEmitted&&!onGround&&(k.jump.isDown||touch.held('jump'))&&now-this.jumpStartedAt>=140&&now-this.jumpStartedAt<450&&p.body.velocity.y<-180){this.gasEmitted=true;this.jumpGas();}
 const firePressed=touch.take('fire');
 if((k.fire.isDown||touch.held('fire')||firePressed)&&now>=this.fireAt){this.fireAt=now+350;this.attackUntil=now+180;const b=this.shots.create(p.x+this.facing*24,p.y+3,'fire');b.setVelocityX(this.facing*520);b.expires=now+1100;sound.tone(240,.12,'sawtooth',.025);}
 if((Phaser.Input.Keyboard.JustDown(k.scare)||touch.take('scare'))&&now>=this.scareAt)this.scare();
 for(const b of this.shots.getChildren())if(now>b.expires)b.destroy();
 for(const e of this.enemies.getChildren()){const scared=e.banished||now<e.fear;if(!scared)e.clearTint();if(e.kind==='warden'){if(!scared&&(e.x<e.home-(e.patrol||115)||e.x>e.home+(e.patrol||115)||e.body.blocked.left||e.body.blocked.right))e.dir*=-1;e.setVelocityX(e.dir*(scared?150:55));if(e.y>570)e.destroy();}else{if(!scared)e.dir=Math.cos(now/900+e.home)>0?1:-1;e.setVelocityX(e.dir*(scared?170:75));e.setVelocityY(Math.sin(now/420+e.home)*40+(e.baseY-e.y)*1.5);}e.setFlipX(e.dir>0);}
 if(p.y>570){this.hp--;if(this.hp<=0)this.die();else{p.body.reset(this.safeGround.x,this.safeGround.y);p.setVelocity(0,0);this.jumpBuffer=0;this.lastGround=-1000;this.hurtUntil=now+1800;this.toast('Back on the last safe bank. Try that jump again!');}}
 const anim=now<this.hurtUntil-1100?'hit':now<this.attackUntil?'attack':!onGround?'jump':Math.abs(p.body.velocity.x)>10?'run':'idle';p.play(anim,true);p.setAlpha(now<this.hurtUntil?(Math.floor(now/90)%2?.45:1):1);
 this.hint.setText(now<this.scareAt?`J Fire   K Scare: ${((this.scareAt-now)/1000).toFixed(1)}s   •   ESC Pause`:'A/D Move   SPACE Jump   J Fire   K Scare READY   ESC Pause');
 if(touch.enabled)this.hint.setText(now<this.scareAt?`SCARE recharges in ${((this.scareAt-now)/1000).toFixed(1)}s`:'Hold FIRE to shoot • Hold JUMP for a higher leap');
 this.pathLights.update();
 for(const c of this.checkpoints)if(p.x>=c.x-35)this.activateCheckpoint(c);
 this.boss.update();
 this.rescues.update(delta);
 }
}
