import Phaser from 'phaser';
import { makeArt } from '../game/art.js';
import { touch } from '../game/touch.js';
import { screenActions } from '../game/screenActions.js';
import { sound } from '../game/audio.js';
export const text=(s,x,y,t,size=20,color='#f1e7c9')=>s.add.text(x,y,t,{fontFamily:'Menlo, Consolas, monospace',resolution:2,fontSize:size,color,align:'center',lineSpacing:8}).setOrigin(.5);
export function button(s,x,y,label,fn){const bg=s.add.rectangle(x,y,270,46,0x34354d).setStrokeStyle(1,0x8c799b).setScrollFactor(0).setInteractive({useHandCursor:true});text(s,x,y,label,18).setScrollFactor(0);bg.on('pointerover',()=>bg.setFillStyle(0x55506b));bg.on('pointerout',()=>bg.setFillStyle(0x34354d));bg.on('pointerdown',fn);return bg;}
export function backdrop(s){const w=s.scale.gameSize.width;s.cameras.main.setViewport((w-960)/2,0,960,540);s.layout=()=>s.cameras.main.setViewport((s.scale.gameSize.width-960)/2,0,960,540);s.add.rectangle(480,270,960,540,0x101426);s.add.circle(750,105,65,0xc2c6a0,.8);for(let i=0;i<24;i++){s.add.rectangle(i*46,440,28,90+(i%3)*16,0x20273b);s.add.image(i*46,450,'stone').setScale(1.5);}s.add.rectangle(480,510,960,60,0x252536);}
export class Boot extends Phaser.Scene{constructor(){super('Boot')}create(){makeArt(this);for(const state of ['idle','run','jump','attack','hit','death'])this.anims.create({key:state,frames:[0,1,2,3].map(i=>({key:`imp-${state}-${i}`})),frameRate:state==='run'?12:6,repeat:state==='death'?0:-1});for(const type of ['warden','ghost','rex','clown'])this.anims.create({key:type,frames:Array.from({length:type==='warden'?8:2},(_,i)=>({key:type+i})),frameRate:type==='warden'?12:6,repeat:-1});this.scene.start('Menu');document.dispatchEvent(new Event('game-ready'));}}
export class Menu extends Phaser.Scene{constructor(){super('Menu')}create(){sound.setMode('adventure');backdrop(this);text(this,480,65,'ГАРБУЗИК',48,'#ffbc61');text(this,480,114,'ОСТАННІЙ ГЕЛЛОВІН',23,'#d6b4dc');this.add.sprite(480,210,'imp-idle-0').setScale(2.5).play('idle');text(this,480,290,'Ліхтар викрадено. Світанок близько.\nПоверни Гелловін додому.',17);button(this,480,373,'ГРАТИ  →',()=>{sound.start();this.scene.start('Graveyard')});button(this,480,433,'ЯК ГРАТИ',()=>this.instructions());text(this,480,505,'v1.5.0 • Пригода під місяцем • Радимо навушники',13,'#949caf');this.input.keyboard.on('keydown-ENTER',()=>{sound.start();this.scene.start('Graveyard')});}
 instructions(){const box=this.add.container(0,0).setDepth(30);box.add(this.add.rectangle(480,270,900,490,0x13172a,.99).setStrokeStyle(2,0x9d85aa));box.add(text(this,480,80,'МАЛИЙ ГАРБУЗИК. ОСТАННІЙ ШАНС.',25,'#ffbc61'));box.add(text(this,480,240,touch.enabled?'Поверни телефон горизонтально.\nУтримуй ◀ / ▶, щоб рухатися.\nУтримуй СТРИБОК для високого стрибка.\nВОГОНЬ — стріляти. БУ! — налякати ворогів.\nПАУЗА зупиняє час. ЗВУК вмикає музику.\n\nВрятуй обох друзів і поверни ліхтар.\nКожні 15 цукерок відновлюють серце.':'A / D або ← / →   Рух\nПРОБІЛ   Стрибок (відпусти для короткого)\nJ   Вогняна куля     K   Налякати видимих ворогів\nESC   Пауза     M   Звук\n\nЗбирай цукерки, запалюй контрольні ліхтарі,\nврятуй друзів і поверни ліхтар до світанку.\nПереляк відновлюється за 8 секунд.\nКожні 15 цукерок відновлюють серце.',18));const b=button(this,480,444,'ЗРОЗУМІЛО',()=>box.destroy(true));box.add(b);box.add(this.children.list[this.children.list.length-1]);}
}
export class End extends Phaser.Scene {
 constructor(){super('End')}
 init(data){this.result=data}
 create(){
  sound.setMode('adventure');
  backdrop(this);
  text(this,480,115,'НІЧ ЗГАСАЄ…',36,'#d6b4dc');
  this.add.sprite(480,225,'imp-idle-0').setScale(2.5).play('death');
  text(this,480,320,'Хоробра іскорка завжди може спробувати знову.\nДрузі чекають на тебе.',19);
  text(this,480,380,`Друзі: ${this.result.rescued||0}/2  •  Цукерки: ${this.result.candy}  •  Час: ${this.result.time} с`,17,'#acb9c8');
  screenActions.show(this,[
   {id:'retry',label:'ЩЕ РАЗ',run:()=>this.scene.start('Graveyard')},
   {id:'title',label:'ГОЛОВНЕ МЕНЮ',run:()=>this.scene.start('Menu')},
  ]);
 }
}
