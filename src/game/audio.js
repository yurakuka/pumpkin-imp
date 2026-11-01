// Original looping chiptune, synthesized locally with square/triangle oscillators.
const CREDITS=[72,76,79,0,77,76,74,0,72,0,67,0,69,72,76,0,74,77,81,0,79,77,76,74,72,76,79,76,72,0,0,0];
const MELODY=[69,0,72,71,69,0,64,0,68,0,71,74,72,71,68,0,69,0,76,74,72,0,71,0,68,71,72,68,64,0,0,0,69,0,72,76,75,74,72,0,71,0,74,77,76,74,71,0,72,0,76,79,77,76,74,72,71,68,64,68,69,0,0,0];
class Sound {
 constructor(){this.muted=false;this.ctx=null;this.loop=null;this.step=0;this.notesPlayed=0;this.mode='adventure';}
 start(){
 this.requested=true;
 // Audio is optional. Neither construction nor autoplay denial may block a scene.
 try{
  if(!this.ctx||this.ctx.state==='closed'){
   const Context=window.AudioContext||window.webkitAudioContext;
   if(!Context)return false;
   const context=new Context(),master=context.createGain();
   master.gain.value=this.muted?0:1;master.connect(context.destination);
   this.ctx=context;this.master=master;this.schedule();
  }
  const resumed=this.ctx.resume();
  if(resumed?.catch)resumed.catch(error=>{this.lastError=error.name||'AudioUnavailable';});
  return true;
 }catch(error){this.lastError=error.name||'AudioUnavailable';return false;}
 }
 note(midi,duration,type,volume){if(!midi)return;this.tone(440*2**((midi-69)/12),duration,type,volume,false);this.notesPlayed++;}
 setMode(mode){if(this.mode===mode)return;this.mode=mode;this.step=0;if(this.ctx)this.schedule();}
 schedule(){clearInterval(this.loop);this.loop=setInterval(()=>this.musicStep(),(this.mode==='boss'?112:this.mode==='chase'?135:this.mode==='credits'?235:185));}
 musicStep(){
 if(!this.ctx||this.ctx.state!=='running')return;
 const n=this.step++%64;
 if(this.mode==='credits'){
 this.note(CREDITS[n%32],.24,'triangle',.045);
 if(n%4===0)this.note([48,53,55,48][Math.floor(n/8)%4],.8,'triangle',.035);
 if(n%2===0)this.note([60,64,67,72][Math.floor(n/2)%4],.15,'sine',.018);
 }else if(this.mode==='boss'){
 this.note([69,70,69,64,68,69,72,71][n%8]+(n%16>=8?12:0),.08,'square',.023);
 this.note([45,45,44,40][Math.floor(n/4)%4],.13,'triangle',.045);
 if(n%2===0)this.tone(n%4===0?65:100,.045,'sawtooth',.018);
 }else{
 this.note(MELODY[n],.15,'square',.016);
 if(n%4===0)this.note([45,45,41,40][Math.floor(n/16)],.55,'triangle',.045);
 if(n%2===0)this.note([57,60,64,60,56,59,64,59][Math.floor(n/2)%8],.11,'triangle',.018);
 }
 }
 tone(f,d=.12,type='triangle',v=.06,slide=true){if(!this.ctx||!this.master||this.ctx.state!=='running'||this.muted)return;const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,this.ctx.currentTime);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,f*.55),this.ctx.currentTime+d);g.gain.setValueAtTime(.001,this.ctx.currentTime);g.gain.linearRampToValueAtTime(v,this.ctx.currentTime+.008);g.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+d);o.connect(g);g.connect(this.master);o.start();o.stop(this.ctx.currentTime+d);}
 scream(){
  this.start();if(!this.ctx||!this.master||this.ctx.state!=='running'||this.muted)return;
  const c=this.ctx,t=c.currentTime,voice=c.createOscillator(),filter=c.createBiquadFilter(),gain=c.createGain();
  voice.type='sawtooth';voice.frequency.setValueAtTime(420,t);voice.frequency.exponentialRampToValueAtTime(880,t+.14);voice.frequency.exponentialRampToValueAtTime(490,t+.78);
  filter.type='bandpass';filter.frequency.value=1250;filter.Q.value=.8;
  const vibrato=c.createOscillator(),depth=c.createGain();vibrato.frequency.value=7;depth.gain.value=24;vibrato.connect(depth);depth.connect(voice.frequency);
  gain.gain.setValueAtTime(.001,t);gain.gain.linearRampToValueAtTime(.07,t+.06);gain.gain.exponentialRampToValueAtTime(.001,t+.8);
  voice.connect(filter);filter.connect(gain);gain.connect(this.master);voice.start();vibrato.start();voice.stop(t+.82);vibrato.stop(t+.82);
 }
 laugh(){
  this.start();for(let i=0;i<6;i++)setTimeout(()=>{this.tone(i%2?260:320,.14,'triangle',.035);this.tone(i%2?520:640,.12,'sine',.018);},i*170);
 }
 toggle(){this.muted=!this.muted;if(this.master)this.master.gain.setValueAtTime(this.muted?0:1,this.ctx.currentTime);return this.muted;}
}
export const sound=new Sound();
