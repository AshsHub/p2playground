import SAT from 'sat';
import utils from '../../utils';
export default class Rock extends PIXI.Sprite {
    constructor() {
        super();
        this.type = 'rock';
    }
    build(x, y) {
        this.rockSprite = new PIXI.Sprite.from('rock.png');
        this.rockSprite.scale.set(400 / this.rockSprite.width);
        this.rockSprite.anchor.set(0.5);
        this.x = x + (this.rockSprite.width * this.rockSprite.anchor.x);
        this.y = y;
        this.radius = 150;
        const circle = new SAT.Circle(new SAT.Vector(this.x, this.y), this.radius);
        // this.graph = new PIXI.Graphics().beginFill(0x32E2D2, 1).drawCircle(circle.x, circle.y, 150);
        // this.rockSprite.addChild(this.graph);

        this.circleCollider = circle;
        this.addChild(this.rockSprite);

        this.realHeight = this.rockSprite.height * this.rockSprite.anchor.y;
        this.rebound = 0.5;
        this.zForce = 20;
    }
    checkHigh(element) {
        // console.log(-element.z, this.realHeight);
        const normalHighTouch = -element.z / this.realHeight;
        // console.log(normalHighTouch > 0.2);

        return normalHighTouch > 0.2 && normalHighTouch < 1;
    }
}