import Entity from '../../game/entities/Entity';
import AnimationManager from './Animation/AnimationManager';
import Signal from 'signals';
import SAT from 'sat';
import utils from '../../utils';
export default class Enemy extends Entity {
    constructor() {
        super();
        this.radius = 10;
        this.inZone = false;
        this.isMoving = false;
        this.target = {
            x: 0,
            y: 0,
        };

        this.inRing = new Signal();
        this.rebound = 5;
        this.realHeight = 10;

        this.multipliers.speed = 3;
        this.zForce = 200;
        this.minusAngle = true;

        this.circleCollider = new SAT.Circle(new SAT.Vector(this.x, this.y), 20);

        this.maxDistance = 60;
        this.minDistance = 1;
        this.maxTimer = 3;
        this.timer = this.maxTimer;
        this.isFrozen = false;
        this.freezeTime;
        this.minScale = 1;
        this.maxScale = 2;
    }
    return () {
        this.currentTarget = null;
        this.angle = Math.atan2(this.y - this.startPoint.y, this.x - this.startPoint.x) - Math.PI; //* Math.PI / 2;
    }
    follow(target) {
        this.currentTarget = target;
        this.angle = Math.atan2(this.y - target.y, this.x - target.x) - Math.PI; //* Math.PI / 2;
    }
    attack() {
        this.isAttacking = true;
        this.animationManager.play('attack');
    }
    build(pos) {
        this.applyMultipliers();
        this.centerPosition = pos;
        this.startPoint = this.setNewPos(this.centerPosition);
        this.animationManager = new AnimationManager();
        this.animationManager.reset();

        const en = ['Candy1', 'Candy2', 'Potato', 'Tomato', 'Rock'];
        const id = en[Math.floor(Math.random() * en.length)];

        this.animationManager.destroy();
        this.animationManager.addAnimation('idle', `Enemies/${id}/idle/idle00`, 15, 0.12, {
            start: 1,
        }, true);
        this.animationManager.addAnimation('running', `Enemies/${id}/walk/walk00`, 17, 0.1, {
            start: 1,
        }, true);
        this.animationManager.addAnimation('attack', `Enemies/${id}/attack/attack00`, 23, 0.05, {
            start: 1,
            loop: false,
        }, true);
        this.animationManager.play('idle');

        this.animationManager.onFinish.add((type) => {
            this.isAttacking = false;
            this.animationManager.play('running');
        });

        this.position.set(this.startPoint.x, this.startPoint.y);
        this.enemyContainer = new PIXI.Container();
        this.addChild(this.enemyContainer);

        this.enemy = new PIXI.Sprite.from('Enemies/Candy1/idle/idle0001.png');
        this.addChild(this.enemy);
        this.enemy.anchor.set(0.5);
        const scale = Math.random() * (this.maxScale - this.minScale) + this.maxScale;

        this.enemy.scale.set(scale);
        this.mainScale = this.enemy.width / this.enemy.height * 2;

        this.shadow = new PIXI.Sprite.fromFrame('ballshadow.png');
        this.shadow.anchor.set(0.5);
        this.shadow.scale.set(this.mainScale);
        this.shadow.scale.y = this.shadow.scale.x * 0.5;
        this.shadow.y = this.enemy.height / 2;
        this.shadow.alpha = 0.5;
        this.enemyContainer.addChild(this.shadow);

        this.graph = new PIXI.Graphics().lineStyle(5, 0x32E2D2).drawCircle(0, 0, this.enemy.width);
        //this.addChild(this.graph);
    }
    setNewPos(pos) {
        const angle = Math.random() * Math.PI * 2;
        const randDist = Math.random() * (this.maxDistance - this.minDistance) + this.maxDistance;
        const newPos = {
            x: Math.cos(angle) * this.radius * randDist,
            y: Math.sin(angle) * this.radius * randDist,
        };

        newPos.x += pos.x;
        newPos.y += pos.y;

        return newPos;
    }
    update(delta) {
        super.update(delta);
        if (this.isFrozen) {
            console.log(this.freezeTime);
            if (this.freezeTime > 0) {
                this.freezeTime -= delta;
            } else {
                this.isFrozen = false;
                this.alpha = 1;
            }
            return
        }
        this.animationManager.updateAnimation(delta);
        this.enemy.texture = this.animationManager.currentTexture;

        // const circle = new SAT.Circle(new SAT.Vector(this.x, this.y), this.enemy.width);

        // this.circleCollider = circle;
        this.circleCollider.pos.x = this.x;
        this.circleCollider.pos.y = this.y + (this.enemy.height / 2);
        this.circleCollider.r = this.enemy.width * 0.5;

        // this.graph.x = this.circleCollider.pos.x;
        // this.graph.y = this.circleCollider.pos.y;
        // this.graph.r = this.circleCollider.r;

        if (this.timer > 0 && !this.isMoving) {
            this.timer -= delta;
        }

        if (this.timer <= 0) {
            this.timer = this.maxTimer;
            this.startPoint = this.setNewPos(this.centerPosition);
            this.isMoving = true;
            this.return();
            this.animationManager.play('running');
        }

        if (this.enemy.scale.x < 0 && this.velocity.x > 0 || this.enemy.scale.x > 0 && this.velocity.x < 0) {
            this.enemy.scale.x *= -1
        }
    }
    checkHigh(element) {
        return true;
    }
}