// Original looping chiptune, synthesized locally with square/triangle oscillators.
const MELODY=[69,0,72,71,69,0,64,0,68,0,71,74,72,71,68,0,69,0,76,74,72,0,71,0,68,71,72,68,64,0,0,0,69,0,72,76,75,74,72,0,71,0,74,77,76,74,71,0,72,0,76,79,77,76,74,72,71,68,64,68,69,0,0,0];
class Sound {
 constructor(){this.muted=false;this.ctx=null;this.loop=null;this.step=0;this.notesPlayed=0;}
 start(){if(!this.ctx){this.ctx=new(window.AudioContext||window.webkitAudioContext)();this.master=this.ctx.createGain();this.master.gain.value=this.muted?0:1;this.master.connect(this.ctx.destination);this.loop=setInterval(()=>this.musicStep(),185);this.musicStep();}this.ctx.resume();}
 note(midi,duration,type,volume){if(!midi)return;this.tone(440*2**((midi-69)/12),duration,type,volume,false);this.notesPlayed++;}
 musicStep(){if(!this.ctx||this.ctx.state!=='running')return;const n=this.step++%64;this.note(MELODY[n],.15,'square',.016);if(n%4===0)this.note([45,45,41,40][Math.floor(n/16)],.55,'triangle',.045);if(n%2===0)this.note([57,60,64,60,56,59,64,59][Math.floor(n/2)%8],.11,'triangle',.018);}
 tone(f,d=.12,type='triangle',v=.06,slide=true){if(!this.ctx||this.muted)return;const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,this.ctx.currentTime);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,f*.55),this.ctx.currentTime+d);g.gain.setValueAtTime(.001,this.ctx.currentTime);g.gain.linearRampToValueAtTime(v,this.ctx.currentTime+.008);g.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+d);o.connect(g);g.connect(this.master);o.start();o.stop(this.ctx.currentTime+d);}
 toggle(){this.muted=!this.muted;if(this.master)this.master.gain.setValueAtTime(this.muted?0:1,this.ctx.currentTime);return this.muted;}
}
export const sound=new Sound();
