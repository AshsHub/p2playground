import * as PIXI from 'pixi.js';
import Signals from 'signals';
export default class UIButtonSwap extends PIXI.Container
{
    constructor(texture1, texture2, scl = 0.75)
    {
        super();

        this.tex1 = new PIXI.Sprite(PIXI.Texture.from(texture1));
        this.tex1.anchor.set(0.5);

        this.tex2 = new PIXI.Sprite(PIXI.Texture.from(texture2));
        this.tex2.anchor.set(0.5);

        this.addChild(this.tex1);
        this.addChild(this.tex2);

        this.tex2.visible = false;

        this.on('mouseup', this.mouseUp.bind(this))
            .on('touchend', this.mouseUp.bind(this))
            // .on('pointerout', this.mouseUp.bind(this))
            .on('pointerupoutside', this.mouseUpOutside.bind(this))
            .on('mouseupoutside', this.mouseUpOutside.bind(this));
        this.on('mousedown', this.mouseDown.bind(this)).on('touchstart', this.mouseDown.bind(this));

        this.onMouseUp = new Signals();
        this.onMouseDown = new Signals();

        this.interactive = true;
    }
    activeState()
    {
        this.tex1.visible = false;
        this.tex2.visible = true;
    }
    deactiveState()
    {
        this.tex1.visible = true;
        this.tex2.visible = false;
    }
    mouseDown()
    {
        this.activeState();
        this.onMouseDown.dispatch();
        this.isDown = true;
        // SOUND_MANAGER.play('button_click')
    }
    mouseUpOutside()
    {
        this.isDown = false;
        this.deactiveState();
    }
    mouseUp()
    {
        if (!this.isDown)
        {
            return;
        }
        this.mouseUpOutside();
        this.onMouseUp.dispatch();
    }
    zeroAnchor()
    {
        this.tex1.anchor.set(0);
        this.tex2.anchor.set(0);
        // this.tex2.position.set(this.tex1.width / 2, this.tex1.height / 2)
        // this.tex2Pos = this.tex2.y;
    }
    customAnchor(x, y)
    {
        this.tex1.anchor.set(x, y);
        this.tex2.anchor.set(x, y);
    }
}
