import {
    TweenLite,
    Elastic
} from "gsap";

export default class Popup extends PIXI.Container {
    constructor() {
        super();
        this.alpha = 0;
    }
    build() {
        this.popupContainer = new PIXI.Container()
        // this.popupContainer.scale.set(0.5)
        // this.popupContainer.x = 300;
        // this.popupContainer.y = 300
        this.addChild(this.popupContainer);

        this.defaultWidth = this.width;
        this.defaultHeight = this.height;

        this.textZone = new PIXI.Text('Apple');
        // this.textZone.width = this.popSprite.width;
        this.textZone.anchor.set(0.5)
        // this.textZone.scale.set(this.defaultHeight / this.textZone.height)
        this.defaultScale = this.defaultHeight / this.textZone.height
        // this.textZone.height = this.popSprite.height;
        this.textZone.style.fontFamily = 'feastofflesh';
        this.textZone.style.stroke = 0;
        this.textZone.style.strokeThickness = 2;
        this.textZone.style.fill = 0xFFFFFF;
        this.popupContainer.addChild(this.textZone);
    }
    setText(text) {
        this.textZone.text = text
    }
    show() {
        this.alpha = 1
        TweenLite.to(this, 0.5, {
            alpha: 1
        })
        TweenLite.to(this, 0.5, {
            alpha: 0,
            delay: 1.5
        })

        this.textZone.scale.set(1.5 * this.defaultScale, 0.5 * this.defaultScale)
        TweenLite.to(this.textZone.scale, 1, {
            x: this.defaultScale,
            y: this.defaultScale,
            ease: Elastic.easeOut
        })

        this.textZone.y = 60
        TweenLite.to(this.textZone, 0.25, {
            x: 0,
            y: 0,
            ease: Back.easeOut
        })
    }
    hide() {
        this.alpha = 0
        TweenLite.killTweensOf(this)
        TweenLite.killTweensOf(this.textZone.scale)
        TweenLite.killTweensOf(this.textZone)
    }
    resize(innerResolution) {
        this.defaultScale = innerResolution.width / this.textZone.width * 0.25
    }
}