// Result and pause actions are native buttons: no Phaser hit testing required.
class ScreenActions {
  show(scene, actions) {
    this.hide();
    const owner = {};
    this.owner = owner;
    this.scene = scene;
    this.busy = false;
    const bar = document.getElementById('screen-actions');
    bar.replaceChildren();
    for (const action of actions) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.screenAction = action.id;
      button.textContent = action.label;
      const run = event => {
        if (event.type === 'pointerdown') event.preventDefault();
        if (this.owner !== owner || this.busy) return;
        this.busy = true;
        try {
          // HTML controls can be tapped while the canvas loop is still asleep.
          // Resume on the explicit gesture before queuing scene transitions.
          if(!document.hidden){scene.game.resume();if(!scene.game.loop.running)scene.game.loop.wake();}
          action.run();
        }
        finally {
          // Debounce pointerdown + click, then unlock actions that keep this scene open.
          setTimeout(() => { if (this.owner === owner) this.busy = false; }, 300);
        }
      };
      button.addEventListener('pointerdown', run);
      button.addEventListener('click', run);
      bar.append(button);
    }
    bar.hidden = false;
    document.body.classList.add('screen-actions');
    window.dispatchEvent(new Event('resize'));
    scene.events.once('shutdown', () => { if (this.owner === owner) this.hide(); });
  }
  hide() {
    this.owner = null;
    this.scene = null;
    const bar = document.getElementById('screen-actions');
    bar.hidden = true;
    bar.replaceChildren();
    document.body.classList.remove('screen-actions');
    window.dispatchEvent(new Event('resize'));
  }
}
export const screenActions = new ScreenActions();
