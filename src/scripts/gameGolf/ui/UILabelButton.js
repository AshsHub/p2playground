import * as PIXI from 'pixi.js';
import Signals from 'signals';
import UIList from './UIList';
export default class UILabelButton extends PIXI.Container
{
    constructor(label, scl = 0.75, customData = {
        texture: null,
        customBackTex: null,
        customBackTexOn: null,
        fontColor: null,
    })
    {
        super();

        this.customData = customData;

        this.back = new PIXI.Sprite(PIXI.Texture.from(this.customData.customBackTex));
        // this.back.anchor.set(0.5)

        this.label = new PIXI.Text(label,
            {
                // fontFamily: FACTORY.fontLabel_button,
                fontSize: '48px',
                fill: this.customData.fontColor != null ? this.customData.fontColor : 0xFFFFFF,
                align: 'left',
                fontWeight: '800',
            });
        if (scl && (this.label.width / this.back.width) > scl)
        {
            // this.label.scale.set(this.back.width / this.label.width * scl)
        }

        // this.label.x = this.back.width / 2 - this.label.width / 2;
        // this.label.y = this.back.height / 2 - this.label.height / 2;
        this.label.scaleContentMax = 0.75;
        this.label.fitHeight = scl;
        // this.label.fitWidth = 1;

        this.containerList = new UIList();
        this.containerList.w = this.back.width;
        this.containerList.h = this.back.height;

        if (this.customData.texture)
        {
            this.icon = new PIXI.Sprite.from(this.customData.texture);
            this.icon.fitHeight = scl;
            this.icon.listScl = 0.4;
            this.containerList.addElement(this.icon);
            // this.label.align = 0;
            this.label.listScl = 0.6;
        }
        this.addChild(this.back);
        this.addChild(this.containerList);
        this.containerList.addElement(this.label);

        this.containerList.addBackground();
        this.containerList.updateHorizontalList();
        this.buttonMode = true;
        this.on('mouseup', this.mouseUp.bind(this))
            .on('touchend', this.mouseUp.bind(this))
            // .on('pointerout', this.mouseUp.bind(this))
            .on('pointerupoutside', this.mouseUpOutside.bind(this))
            .on('mouseupoutside', this.mouseUpOutside.bind(this));
        this.on('mousedown', this.mouseDown.bind(this)).on('touchstart', this.mouseDown.bind(this));

        this.labelPos = this.label.y;
        if (this.icon)
        {
            this.iconPos = this.icon.y;
        }

        this.onMouseUp = new Signals();
        this.onMouseDown = new Signals();

        this.interactive = true;
    }
    mouseDown()
    {
        if (!this.isSelected)
        {
            this.back.texture = PIXI.Texture.from(this.customData.customBackTexOn);
            // this.back.texture = PIXI.Texture.from(this.customData.customBackTexOn ? this.customData.customBackTexOn : FACTORY.icons.label_button);
        }
        this.label.y = this.labelPos + 4;
        if (this.icon)
        {
            this.icon.y = this.iconPos + 4;
        }
        this.onMouseDown.dispatch();
        this.isDown = true;
        // SOUND_MANAGER.play('button_click')
    }
    mouseUpOutside()
    {
        this.isDown = false;
        if (!this.isSelected)
        {
            this.back.texture = PIXI.Texture.from(this.customData.customBackTex ? this.customData.customBackTex : FACTORY.icons.label_button);
        }
        this.label.y = this.labelPos;
        if (this.icon)
        {
            this.icon.y = this.iconPos;
        }
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
    setUnselected()
    {
        this.isSelected = false;
        this.back.texture = PIXI.Texture.from(this.customData.customBackTex ? this.customData.customBackTex : FACTORY.icons.label_button);
        // this.label.y = this.back.height / 2 - this.label.height/2;
    }
    setSelected()
    {
        this.isSelected = true;
        this.back.texture = PIXI.Texture.from(this.customData.customBackTexOn);
        // this.back.texture = PIXI.Texture.from(this.customData.customBackTexOn ? this.customData.customBackTexOn :FACTORY.icons.label_button_active);
        // this.label.y = this.back.height / 2 - this.label.height/2 + 5;
    }
    zeroAnchor()
    {
        this.back.anchor.set(0);
        this.label.position.set(this.back.width / 2, this.back.height / 2);
        this.labelPos = this.label.y;
    }
    customAnchor(x, y)
    {
        this.back.anchor.set(x, y);
        this.label.position.set(this.back.width / 2 - this.back.width * this.back.anchor.x, this.back.height / 2 - this.back.height * this.back.anchor.y);
        this.labelPos = this.label.y;
    }
}
