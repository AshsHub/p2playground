import * as PIXI from 'pixi.js';
import Signals from 'signals';
import { TweenLite } from 'gsap';
export default class UIButton extends PIXI.Container
{
    constructor(backTexture, backTextureOver, icon, scl = 0.65)
    {
        super();

        this.backTexture = PIXI.Texture.from(backTexture);
        this.backTextureOver = PIXI.Texture.from(backTextureOver);

        this.back = new PIXI.Sprite(this.backTexture);
        this.back.anchor.set(0.5);

        this.icon = new PIXI.Sprite(PIXI.Texture.from(icon));
        this.icon.anchor.set(0.5);
        if (scl)
        {
            this.icon.scale.set(this.back.width / this.icon.width * scl);
        }
        this.scl = scl;
        this.addChild(this.back);
        this.addChild(this.icon);

        this.on('mouseup', this.mouseUp.bind(this))
            .on('touchend', this.mouseUp.bind(this))
            // .on('pointerout', this.mouseUp.bind(this))
            .on('pointerupoutside', this.mouseUpOutside.bind(this))
            .on('mouseupoutside', this.mouseUpOutside.bind(this));
        this.on('mousedown', this.mouseDown.bind(this)).on('touchstart', this.mouseDown.bind(this));

        this.iconPos = this.icon.y;

        this.onMouseUp = new Signals();
        this.onMouseDown = new Signals();

        this.interactive = true;
    }
    forceSelect()
    {
        this.back.texture = this.backTextureOver;
        const iconTarget = this.iconPos + (((1 - this.scl) / 2) * this.back.texture.height);

        TweenLite.to(this.icon, 0.5, { y: iconTarget });
        // .y
    }
    forceUnselect()
    {
        this.mouseUpOutside(true);
    }
    mouseDown()
    {
        this.back.texture = this.backTextureOver;
        const iconTarget = this.iconPos + (((1 - this.scl) / 2) * this.back.texture.height);

        TweenLite.to(this.icon, 0.5, { y: iconTarget, ease: Elastic.easeOut });
        // TweenLite.to(this.icon, 0.35, { y: iconTarget, ease: Back.easeOut });
        this.onMouseDown.dispatch(this);
        this.isDown = true;
        // SOUND_MANAGER.play('button_click')
    }
    mouseUpOutside(force = false)
    {
        if (!this.isDown && !force)
        {
            return;
        }
        this.isDown = false;
        this.back.texture = this.backTexture;
        // this.icon.y = this.iconPos;
        TweenLite.to(this.icon, 0.5, { y: this.iconPos, ease: Elastic.easeOut });
    }
    mouseUp()
    {
        if (!this.isDown)
        {
            return;
        }
        this.mouseUpOutside();
        this.onMouseUp.dispatch(this);
    }
    zeroAnchor()
    {
        this.back.anchor.set(0);
        this.icon.position.set(this.back.width / 2, this.back.height / 2);
        this.iconPos = this.icon.y;
    }
    customAnchor(x, y)
    {
        this.back.anchor.set(x, y);
        this.icon.position.set(this.back.width / 2 - this.back.width * this.back.anchor.x, this.back.height / 2 - this.back.height * this.back.anchor.y);
        this.iconPos = this.icon.y;
    }
    changeTexture(tex)
    {
        this.icon.texture = PIXI.Texture.from(tex);
    }
}
