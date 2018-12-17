import Signal from 'signals';
import {
    TweenLite
} from 'gsap';
import utils from '../../utils';

export default class Freezer extends PIXI.Container {
    constructor() {
        super();
        this.inZone = false;
        this.isMoving = false;
        this.target = {
            x: 0,
            y: 0,
        };

        this.maxDistance = 1000;
        this.freezeTime = 5;
    }
    build(pos, cardData) {
        this.freezeTime = cardData.timer;
        this.position.set(pos.x, pos.y - 500);

        this.freezer = new PIXI.Sprite.from('freezer.png');
        this.addChild(this.freezer);
        this.freezer.anchor.set(0.5, 0.9);
        this.alpha = 1;

        // this.freezer.scale.set(scale);

        this.fadeIn();

        setTimeout(() => {
            this.fadeOut()
        }, this.freezeTime * 500);
        // this.checkDistance(entityList)
    }
    checkDistance(entity) {
        const checkDist = utils.distance(this.x, this.y, entity.x, entity.y);

        if (checkDist < this.maxDistance / 2) {
            return true;
        }
    }
    fadeIn() {
        TweenLite.to(this.freezer, 0.25, {
            alpha: 1,
            y: 500
        });
    }
    fadeOut() {
        TweenLite.to(this.freezer, 0.75, {
            alpha: 0,
        });
    }
}