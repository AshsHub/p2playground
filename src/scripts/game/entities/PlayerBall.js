import Entity from '../entities/Entity';
import InGameInput from '../input/InGameInput';
import Signals from 'signals';
import {
    TweenLite,
    Elastic,
} from 'gsap';
import utils from '../../utils';
import playerData from "./playerData";

export default class PlayerBall extends Entity {
    constructor(game) {
        super();
        this.game = game;
        this.standardData = playerData;
        this.clubDataStandard = this.setDefaultClubData();

        this.currentTerrainData = this.setDefaultTerrainData();

        this.shotCount = 0;
        this.angle = 0;
        this.forceDec = 50;
        this.standardPower = 1;
        this.power = 1;
        this.standardBounce = 1;
        this.bounce = 0.15;
        this.perfectShotThreshold = 0.05;
        this.standardShotThreshold = 0.15;
        this.canBreakObs = false;
        this.powerNormal = 0;
        this.standardForceDec = 1500;
        // this.standardForce = 800;

        this.currentClub = {
            clubPower: 1,
            clubHeight: 1,
        };

        this.z = 0;
        this.gravity = 6000;
        this.velocityZ = 0;

        this.onGreen = new Signals();
        this.exitGreen = new Signals();
        this.notMovingSignal = new Signals();
        this.isMoving = false;
        this.isMovingSignal = new Signals();
        this.playerReset = new Signals();
        this.isOnGreen = false;
        this.applyFriction = true;
        this.lives = 3;
        this.canFall = false;

        this.contactPoint = {
            x: 0,
            y: 0,
        };

        this.backupData;
    }
    setDefaultTerrainData() {
        const data = this.standardData.standardTerrainData;
        return data;
    }
    setDefaultClubData() {
        const data = this.standardData.clubStandardData;
        return data;
    }
    reset() {
        this.lastShotPos = {
            x: this.x,
            y: this.y,
        };
        this.forceStop();

        this.currentData = null;

        console.log('Score', this.shotCount);
        this.shotCount = 0;
        // this.sprite.position.set(0,0);
        this.currentSkill = null;
        this.setNotMoving();
        this.lives--;
    }
    forceStop() {
        this.velocityZ = 0;
        this.force = 0;
        this.z = 0;
        this.velocity = {
            x: 0,
            y: 0,
        };
    }
    build() {
        this.shadow = new PIXI.Sprite.fromFrame('ballshadow.png');
        this.sprite = new PIXI.Sprite.fromFrame('ball1.png');
        this.sprite.anchor.set(0.5);
        this.shadow.anchor.set(0.5);
        // this.game.entityContainer.addChild(this.sprite);
        this.velocity = {
            x: 0,
            y: 0,
        };
        this.lastShotPos = {
            x: this.x,
            y: this.y,
        };

        this.radius = 100;
        this.mainScale = this.radius / this.sprite.height * 2;
        this.sprite.scale.set(this.mainScale);
        this.shadow.scale.set(this.mainScale);
        this.shadow.scale.y = this.shadow.scale.x * 0.5;
        this.shadow.y = this.sprite.height / 2; // this.sprite.scale.y;
        // this.sprite.directionAngle = 0;
        this.addChild(this.shadow);
        this.addChild(this.sprite);

        this.shadow.alpha = 0.5;
    }
    setPosition(newPos) {
        this.startPosition = {
            x: newPos.x,
            y: newPos.y
        }

        this.x = this.startPosition.x;
        this.y = this.startPosition.y;
        this.clickZone();
    }
    clickZone() {
        this.clickZoneSprite = new PIXI.Sprite.fromFrame('enemyRadious.png');
        this.addChild(this.clickZoneSprite);
        this.clickZoneSprite.anchor.set(0.5);
        this.clickZoneSprite.scale.set(10);
        this.clickZoneSprite.position.set(this.sprite.x, this.sprite.y)
    }
    applyTerrainModifiers(terrainData) {
        if (this.currentTerrainData == terrainData && !this.onGround) {
            return;
        }

        this.currentTerrainData = terrainData;

        (this.currentTerrainData.type === "SKY") ? this.shadow.visible = false: this.shadow.visible = true;

        if (!this.onGround) {
            // this.setStandard();
            return;
        }

        if (this.canFall) {
            if (this.currentTerrainData.deadly) {
                this.forceStop();
                this.getToLastPosition();
            }
            if (this.currentTerrainData.instaStop) {
                this.forceStop();
            }
        }

        if (this.currentTerrainData.green) {
            if (this.isOnGreen) {
                return;
            }
            this.onGreen.dispatch();
            this.isOnGreen = true;
        } else {
            if (!this.isOnGreen) {
                return;
            }
            this.exitGreen.dispatch();
            this.isOnGreen = false;
        }
    }
    update(delta) {
        this.velocityZ += this.gravity * delta;

        if (this.force > 0) {
            this.applyVelocity(this.angle, this.force);
            if (this.onGround && this.applyFriction) {
                this.force -= delta * this.forceDec * this.currentTerrainData.friction;
            }

            this.contactPoint = {
                x: this.x + this.velocity.x * delta + Math.cos(this.angle) * this.radius,
                y: this.y + this.velocity.y * delta + Math.sin(this.angle) * this.radius,
            };
        } else {
            this.velocity = {
                x: 0,
                y: 0,
            };
            this.setNotMoving();
        }

        if (this.force > 0 && this.z < 0) {
            this.setIsMoving();
        }

        if (this.z + this.velocityZ * delta >= 0) {
            if (Math.abs(this.velocityZ * delta) < 5) {
                this.velocityZ = 0;
                this.z = 0;
                this.applyFriction = true;
            } else {
                this.z = 0;

                if (this.currentData) {
                    this.velocityZ *= (-this.currentTerrainData.bounce * this.currentData.bounce);
                } else {
                    this.velocityZ *= (-this.currentTerrainData.bounce * 0.5);
                }
            }
            this.onGround = true;
            this.currentData = null;
            this.cardPower = null;
            this.verticalForce = null;
            // this.velocityZ = 0;
            // this.z = 0;
            // this.onGround = true;
        } else {
            this.z += this.velocityZ * delta;
            this.applyFriction = false;
        }

        this.sprite.y = this.z;

        this.shadow.alpha = 100 / Math.abs(this.sprite.y);

        if (this.z < 0) {
            this.canFall = false;
        } else {
            this.canFall = true;
        }
    }
    throughObstacle() {
        if (!this.onGround) {
            this.forceDec = this.standdardForceDec * 6;
        }
    }
    setStandard() {
        this.forceDec = this.standardForceDec;
    }
    wallColide() {
        this.sprite.rotation = this.angle;
        TweenLite.killTweensOf(this.sprite.scale);
        this.sprite.scale.x = this.mainScale * 0.7;
        TweenLite.to(this.sprite.scale, 0.75, {
            x: this.mainScale,
            y: this.mainScale,
            ease: Elastic.easeOut,
        });
    }
    move(delta) {
        this.x += this.velocity.x * delta;
        this.y += this.velocity.y * delta;

        this.sprite.rotation = utils.lerp(this.angle, this.sprite.rotation, 0.995);
    }
    shoot(pos, power, card = null, arrowAngle) {
        this.onGround = false;
        if (card) {
            this.currentData = card.data;
            this.cardPower = this.currentData.power;
            this.verticalForce = this.currentData.verticalForce;
        }

        this.arrowAngle = arrowAngle;
        this.currentShootPower = power;

        if (!this.isMoving) {
            this.setIsMoving();
            // this.isMoving.dispatch();
            this.backupData = this.currentTerrainData;
            setTimeout(() => {
                this.setStandard();
            }, 50);
            this.game.powerBar.alpha = 0;

            const globalPlayer = this.getGlobalPosition();

            // let tempDist = Utils.distance(globalPlayer.x, globalPlayer.y, pos.x, pos.y);
            const angle = this.getShotAngle(globalPlayer.x, globalPlayer.y, pos.x, pos.y);

            this.applyVelocity(angle + Math.PI);
            this.angle = angle + Math.PI;

            // this.checkShot();

            // this.force = tempDisttempDist * 0.05 * this.standardForce / this.game.camera.currentZoom * this.power

            if (this.cardPower) {
                this.force = this.getShootForce(this.currentShootPower, this.cardPower); // power * this.standardForce * this.cardPower;
                this.velocityZ = this.getShootHigh(this.verticalForce * this.powerNormal, this.cardPower); // -this.standardVerticalForce * this.currentData.verticalForce * (power + 0.5);
            } else {
                this.force = this.getShootForce(this.currentShootPower, 1); // power * this.standardForce * this.cardPower;
                this.velocityZ = this.getShootHigh(Number(this.powerNormal), 1); // -this.standardVerticalForce * this.currentData.verticalForce * (power + 0.5);
            }

            this.lastShotPos.x = globalPlayer.x;
            this.lastShotPos.y = globalPlayer.y;

            InGameInput.isDown = false;
            this.shotCount++;

            this.lastShotPos = {
                x: this.x,
                y: this.y,
            };
        }
    }
    getShootForce(power, cardPower) {
        return power * this.clubDataStandard.standardForce * cardPower * this.currentTerrainData.power *
            this.currentClub.clubPower;
    }
    getShootHigh(power, verticalForce) {
        // console.log(
        //     this.clubDataStandard.standardVerticalForce, verticalForce, power, this.currentTerrainData.verticalForce,
        //     this.currentClub.clubHeight)

        return -this.clubDataStandard.standardVerticalForce * verticalForce * power * this.currentTerrainData.verticalForce *
            this.currentClub.clubHeight;
    }
    checkShot() {
        return;
        if (this.arrowAngle < this.standardShotThreshold && this.arrowAngle > -this.standardShotThreshold) {
            console.log('standardShot');

            if (this.arrowAngle < this.perfectShotThreshold && this.arrowAngle > -this.perfectShotThreshold) {
                this.angle += Math.floor(Math.random() * this.perfectShotThreshold) - this.perfectShotThreshold;
                console.log('perfectShot');
            } else
            if (this.arrowAngle < 0) {
                this.angle += Math.floor(Math.random() * -this.standardShotThreshold) - this.perfectShotThreshold;
            } else {
                this.angle += Math.floor(Math.random() * this.standardShotThreshold) + this.perfectShotThreshold;
            }
        } else {
            if (this.arrowAngle < 0) {
                this.angle += Math.floor(Math.random() * -this.standardShotThreshold) - 0.375;
            } else {
                this.angle += Math.floor(Math.random() * this.standardShotThreshold) + 0.375;
            }
            console.log('Terrible shot');
        }

        this.angle += angleChange;
        console.log('Angle', this.angle);
    }
    getToLastPosition() {
        this.x = this.lastShotPos.x;
        this.y = this.lastShotPos.y;
        // this.playerReset.dispatch();
        const tempData = this.currentTerrainData;
        this.currentTerrainData = this.backupData;
        this.currentTerrainData.type = tempData.type;
    }
    getShotAngle(p1x, p1y, p2x, p2y) {
        const dx = p2x - p1x;
        const dy = p2y - p1y;
        const angle = Math.atan2(dy, dx);

        return angle;
    }
    bouncy(angle, force = 1500, zForce = 200) {
        this.onGround = false;
        // if (this.velocityZ < 1) {
        //     this.velocityZ = 1;
        // }
        // console.log(angle, addedForce, zforce);

        this.velocityZ = -zForce;
        // this.velocity.x = Math.cos(angle) *  addedForce;
        // this.velocity.y = Math.sin(angle) *  addedForce;

        this.force = force;

        this.angle = angle;
        this.applyVelocity(angle, this.force);
    }
    applyVelocity(angle, addedForce = 10) {
        this.velocity.x = Math.cos(angle) * addedForce;
        this.velocity.y = Math.sin(angle) * addedForce;
    }
    denyShot() {
        const tint = this.sprite.tint;

        this.sprite.tint = 0xA01B1B;

        setTimeout(() => {
            this.sprite.tint = tint;
        }, 200);
    }
    setIsMoving() {
        if (this.isMoving) {
            return;
        }
        this.isMoving = true;
        this.clickZoneSprite.alpha = 0;
        this.isMovingSignal.dispatch();
    }
    setNotMoving() {
        if (!this.isMoving) {
            return;
        }
        this.isMoving = false;
        this.clickZoneSprite.alpha = 1;
        this.notMovingSignal.dispatch();
    }

}