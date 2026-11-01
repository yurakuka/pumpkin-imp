export class StoryNPCs {
 constructor(s){
  this.baron=s.add.image(340,472,'pirate').setOrigin(.5,1).setScale(1.25).setDepth(12);
  const ui=s.add.container(350,265).setDepth(13);
  ui.add(s.add.rectangle(0,0,480,110,0x25273c,.96).setStrokeStyle(2,0xc5ad7c));
  ui.add(s.add.text(0,-33,'Барон Пірат Вовк',{fontFamily:'Menlo, Consolas, monospace',resolution:2,fontSize:17,color:'#ffcf77'}).setOrigin(.5));
  ui.add(s.add.text(0,13,'Збирай цукерки та рятуй друзів!\nВстигни повернутися додому до світанку.\nГелловін чекає на тебе, Гарбузику!',{fontFamily:'Menlo, Consolas, monospace',resolution:2,fontSize:15,color:'#f4e5c5',align:'center',lineSpacing:6}).setOrigin(.5));
  this.princess=s.add.image(27900,472,'princess').setOrigin(.5,1).setScale(1.25).setDepth(13).setVisible(false);
 }
}
