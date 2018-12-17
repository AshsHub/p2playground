import SAT from 'sat';
import utils from '../../utils';
import AnimationManager from '../entities/Animation/AnimationManager';
export default class Tree extends PIXI.Sprite {
    constructor() {
        super();
        this.type = 'tree';
    }
    build(x, y) {
        this.treeSprite = new PIXI.Sprite.from('tree.png');
        this.treeSprite.scale.set(1000 / this.treeSprite.width);
        // this.treeSprite.scale.x = -this.treeSprite.scale.x
        this.treeSprite.anchor.set(0.5, 0.9);
        this.x = x + (this.treeSprite.width * this.treeSprite.anchor.x);
        this.y = y - (this.treeSprite.height * 0.1);
        const radius = this.treeSprite.width / 4;
        const circle = new SAT.Circle(new SAT.Vector(this.x, this.y), radius);

        //this.graph = new PIXI.Graphics().lineStyle(5, 0x32E2D2).drawCircle(0, 0, radius);
        //this.treeSprite.addChild(this.graph);
        this.circleCollider = circle;
        this.addChild(this.treeSprite);

        this.rebound = 0.1;
        this.zForce = 0.5;
        this.animationManager = new AnimationManager();
        this.animationManager.reset();

        this.animationManager.destroy();
        this.realHeight = this.treeSprite.height * this.treeSprite.anchor.y;
        // this.animationManager.addAnimation('idle', 'Environment/Pine1/pine100', 22, 0.09, {
        //     start: Math.floor(Math.random()*20)
        // }, true);

        // this.animationManager.play('idle');
        this.close = false;
    }
    update(delta) { // Not called
        this.animationManager.updateAnimation(delta);
        this.treeSprite.texture = this.animationManager.currentTexture;
        this.realHeight = this.treeSprite.height * this.treeSprite.anchor.y;
    }
    checkHigh(element) {
        // console.log(-element.z, this.realHeight);
        const normalHighTouch = -element.z / this.realHeight;
        // console.log(normalHighTouch > 0.2);

        return normalHighTouch > 0 && normalHighTouch < 0.4;
    }
    checkDistance(element) {
        if (element.force <= 0) {
            return;
        }
        const distance = utils.distance(element.x, element.y, this.x, this.y);

        if (distance < this.realHeight && distance > this.realHeight * 0.01) {
            // console.log("close")
            this.treeSprite.alpha = distance * 0.0005;
            this.close = true;
        } else {
            if (!this.close) {
                return;
            }
            this.treeSprite.alpha = utils.lerp(this.treeSprite.alpha, 1, 1 / 60);
            this.close = false;
        }
    }
}