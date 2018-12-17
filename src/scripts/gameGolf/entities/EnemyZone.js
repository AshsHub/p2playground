import Enemy from './Enemy';
import Collisions from '../core/Collisions';

export default class EnemyZone extends PIXI.Container {
    constructor() {
        super();
        this.radius = 10;
        this.inZone = false;
        this.player = null;
        this.maxDistance = 60;
        this.minDistance = 1;
        this.enemyList = [];
    }
    build(player, container, spawnPos, enemyCount = 4) {
        this.built = true;
        this.x = spawnPos.x;
        this.y = spawnPos.y;
        this.player = player;
        this.entityContainer = container;

        this.zoneSprite = new PIXI.Sprite.fromFrame('enemyRadious.png');
        this.zoneSprite.anchor.set(0.5);
        this.zoneSprite.scale.set(this.radius);
        this.zoneSprite.alpha = 0.3
        this.zoneSprite.position.set(this.x, this.y);
        // this.zoneSprite.scale.y = this.zoneSprite.scale.x * 0.5
        // this.sprite.directionAngle = 0;
        this.entityContainer.addChild(this.zoneSprite);

        for (let index = 0; index < enemyCount; index++) {
            const angle = Math.random() * Math.PI * 2;
            const randDist = Math.random() * (this.maxDistance - this.minDistance) + this.maxDistance;
            const newPos = {
                x: Math.cos(angle) * this.radius * randDist,
                y: Math.sin(angle) * this.radius * randDist,
            };

            newPos.x += this.x;
            newPos.y += this.y;

            this.enemyEntity = new Enemy();
            this.enemyEntity.build(spawnPos);
            this.entityContainer.addChild(this.enemyEntity);
            this.enemyList.push(this.enemyEntity);
        }
        // this.game.enemyList.push(this.enemyEntity);
    }
    update(delta) {
        for (let index = 0; index < this.enemyList.length; index++) {
            this.enemyEntity = this.enemyList[index];

            this.enemyEntity.update(delta);
            if (this.enemyEntity.isAttacking) {
                return
            }
            if (this.getWaypointCollision(this.enemyEntity)) {
                this.enemyEntity.animationManager.play('idle');
                this.enemyEntity.isMoving = false;
            }

            // Check distance between player and enemy
            if (this.checkDistance(this.zoneSprite.position, this.player, this.zoneSprite.height / 2) && this.player.onGround) {
                this.setMove();
                this.enemyEntity.follow(this.player);
            } else {
                this.setReturn();
                this.enemyEntity.return();
                this.enemyEntity.isClose = false;
            }

            // Check distance between enemy and spawn
            if (!this.checkDistance(this.enemyEntity.startPoint, this.enemyEntity, this.zoneSprite.height / 2) && this.player.onGround) {
                this.enemyEntity.return();
            }

            if (this.enemyEntity.isMoving) {
                if (this.enemyEntity.angle && !this.enemyEntity.isFrozen) {
                    this.enemyEntity.applyVelocity(this.enemyEntity.angle);
                    this.enemyEntity.move(delta);
                }
            }
        }
    }
    checkDistance(entity, target, maxDist) {
        const distance = utils.distance(entity.x, entity.y, target.x, target.y);

        if (distance < maxDist) {
            return true;
        }
    }
    setMove() {
        if (this.enemyEntity.inZone) {
            return;
        }

        this.enemyEntity.isMoving = true;
        this.enemyEntity.inZone = true;
        this.zoneSprite.tint = 0xFF0000;
        this.enemyEntity.animationManager.play('running');
        this.enemyEntity.inRing.dispatch();
    }
    setReturn() {
        if (!this.enemyEntity.inZone) {
            return;
        }

        this.enemyEntity.inZone = false;
        this.zoneSprite.tint = 0xFFFFFF;
    }
    getWaypointCollision() {
        if (this.enemyEntity.inZone) {
            return;
        }
        const dist = utils.distance(this.enemyEntity.x, this.enemyEntity.y, this.enemyEntity.startPoint.x, this.enemyEntity.startPoint.y);

        return dist < 50;
    }
    checkCollision(fixedDelta, playerBall) {
        for (let index = 0; index < this.enemyList.length; index++) {
            const element = this.enemyList[index];

            if (!element.inZone || element.isFrozen) {
                return;
            }
            //element.checkDistance(playerBall);

            if (Collisions.solidCollision(playerBall, element, fixedDelta, true, true)) {
                element.attack();
            }
        }
    }
}