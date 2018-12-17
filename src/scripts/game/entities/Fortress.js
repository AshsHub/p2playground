import SAT from 'sat';
import {
    TweenLite,
} from 'gsap';
import AnimationManager from './Animation/AnimationManager';
export default class Fortress extends PIXI.Container {
    constructor() {
        super();
        this.maxHealth = 1000;
        this.currHealth = this.maxHealth;
        this.isDestroyed = false;
        this.type = 'fort';
        this.offsetY = 150;
        this.stackSize = 5;
        this.health = this.stackSize;
        this.stackList = [];
        this.ignoreCollision = false;
        this.rebound = 2.5;
        this.zForce = 300;
        this.canBeHit = true;
    }
    build(x, y) {
        this.fortContainer = new PIXI.Container();
        this.addChild(this.fortContainer);
        this.buildFort(x, y);
        //this.setHeight();
        this.buildHealth()
    }
    buildFort(x, y) {
        this.x = x;
        this.y = y;

        // for (let index = 0; index < this.stackSize; index++) {
        //     this.fortSprite = new PIXI.Sprite.from('ringFort.png');
        //     this.fortSprite.scale.set((1000 / this.fortSprite.width));
        //     // this.fortSprite.x = x;
        //     this.fortSprite.y = -(this.offsetY * index);
        //     this.fortSprite.anchor.set(0.5);
        //     // this.graph.alpha = 0.2

        //     this.stackList.push(this.fortSprite);
        //     this.fortContainer.addChild(this.fortSprite);
        // }
        this.animationManager = new AnimationManager();
        this.animationManager.reset();

        this.animationManager.destroy();
        this.animationManager.addAnimation('idle', `Tower/tower1/idle/idle00`, 16, 0.12, {
            start: 1,
        }, true);

        this.fortSprite = new PIXI.Sprite.from('Tower/tower1/idle/idle0001.png');
        this.addChild(this.fortSprite);
        this.fortSprite.scale.set(10)
        this.fortSprite.anchor.set(0.5, 0.9)
        this.animationManager.play('idle');

        const radius = 300;
        // const circle = new SAT.Circle(new SAT.Vector(this.stackList[0].x, this.stackList[0].y), radius);
        const circle = new SAT.Circle(new SAT.Vector(this.x * 0.1, this.y), radius);

        this.circleCollider = circle;
        this.graph = new PIXI.Graphics().lineStyle(5, 0x32E2D2).drawCircle(0, 0, radius);
        // this.graph = new PIXI.Graphics().lineStyle(5, 0x32E2D2).drawCircle(this.stackList[0].x, this.stackList[0].y, radius * 0.5);
        //this.addChild(this.graph);
        this.realWidth = this.fortSprite.width * this.fortSprite.anchor.x;
        this.realHeight = this.fortSprite.height * this.fortSprite.anchor.y;
    }
    setHeight() {
        const index = this.health - 1;

        if (index > 0) {
            this.realHeight = (this.stackList[index].height * this.stackList[index].anchor.y) + index;
        } else if (index < 0) {
            this.realHeight = -200;
        }
    }
    buildHealth() {
        this.healthContainer = new PIXI.Container();
        this.fortSprite.addChild(this.healthContainer);
        this.healthContainer.scale.set(2)

        console.log()

        this.healthSpriteBack = new PIXI.Sprite.from('progressbar_bar.png');
        this.healthSpriteBack.tint = 0xD93312;
        this.healthContainer.addChild(this.healthSpriteBack);

        let margin = 5
        this.healthSpriteFront = new PIXI.Sprite.from('progressbar_bar.png');
        this.healthSpriteFront.anchor.set(0);
        this.healthSpriteFront.tint = 0x12D96C;
        this.healthSpriteBack.addChild(this.healthSpriteFront);
        this.maxWidth = this.healthSpriteFront.width;
        this.healthContainer.x = this.x - this.healthSpriteBack.width
        this.healthContainer.y = this.y - (this.fortSprite.height * 0.1)
    }
    setWidth() {
        if (this.currHealth < 0) {
            this.healthSpriteFront.width = 0;
        } else {
            this.healthSpriteFront.width = (this.maxWidth / this.maxHealth) * this.currHealth;
        }
    }
    update(delta) {
        if (this.isDestroyed) {
            return;
        }

        this.animationManager.updateAnimation(1 / 60);
        this.fortSprite.texture = this.animationManager.currentTexture;
        // this.currHealth -= 1 / 60 * 500;
    }
    damageHit(damage) {
        // if (this.health > -1 && this.canBeHit) {
        //     this.canBeHit = false;
        //     this.health--;
        //     this.stackList[this.health].alpha = 0;
        //     this.setHeight();

        //     setTimeout(() => {
        //         this.canBeHit = true;
        //     }, 50);
        //     console.log('hit', this.health);
        //     if (this.health == 0) {
        //         this.isDestroyed = true;
        //         this.destroyedState();
        //     }
        // }
        // // else{
        // // }

        const damageDealt = Math.min(damage, 150);
        this.currHealth -= damageDealt;
        this.setWidth()

        if (this.currHealth <= 0) {
            this.isDestroyed = true;
            this.destroyedState();
        }
    }
    destroyedState() {
        TweenLite.to(this.fortSprite, 0.5, {
            alpha: 0,
            height: 0
        });
        this.ignoreCollision = true;
    }
    checkHigh(element) {
        // console.log(-element.z, this.realHeight);
        const normalHighTouch = -element.z / this.realHeight;
        // console.log(normalHighTouch > 0.2);

        return normalHighTouch > 0 && normalHighTouch < 1;
    }
}