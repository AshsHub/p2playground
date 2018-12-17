import Entity from '../../game/entities/Entity';
import Input from '../../game/input/InGameInput';
import Utils from '../../utils';
import InGameInput from '../../game/input/InGameInput';
import utils from '../../utils';
import Aim from '../aim/Aim';
export default class PowerBar extends Entity {
    constructor(game) {
        super();
        this.game = game;

        this.build();
    }
    build() {
        this.powerContainer = new PIXI.Container();
        this.addChild(this.powerContainer);

        this.powerBarSprite = new PIXI.Sprite.fromFrame('arrow.png');
        this.powerBarSprite.anchor.set(0.5, 0.3);
        this.powerBarSprite.width = 50;
        this.powerBarSprite.tint = 0xFF0000;
        this.alpha = 0;
        this.currentDistance = 0;
        this.globalDistance = 0;
        this.angle = 0;
        this.powerContainer.addChild(this.powerBarSprite);

        this.maxPowerSpriteRef = new PIXI.Sprite.fromFrame('targetSize.png');
        this.addChild(this.maxPowerSpriteRef);
        this.targetSize = 500;
        this.maxPowerSpriteRef.scale.set(this.targetSize / this.maxPowerSpriteRef.height);
        this.maxPowerSpriteRef.scale.y = this.maxPowerSpriteRef.scale.x * 0.5;
        this.maxPowerSpriteRef.anchor.set(0.5);

        this.currentPowerBallSprite = new PIXI.Sprite.fromFrame('tennisball.png');
        this.addChild(this.currentPowerBallSprite);
        this.currentPowerBallSprite.scale.set(1);
        this.currentPowerBallSprite.anchor.set(0.5);

        this.maxDis = 2000;

        this.maxScale = (this.maxPowerSpriteRef.height * this.maxPowerSpriteRef.scale.y) / this.currentPowerBallSprite.texture.height;

        this.aim = new Aim();
        this.addChild(this.aim);

        this.currentCard = null;
    }
    updatePreview(angle) {
        this.angle = angle;
        this.globalDistance = this.maxDis;
        this.currentDistance = this.maxDis;

        this.powerBarSprite.rotation = this.angle + Math.PI / 2;
        this.powerBarSprite.scale.y = this.currentDistance / this.powerBarSprite.height * this.powerBarSprite.scale.y; // this.game.camera.currentZoom;
        this.alpha = 1;

        this.powerBarSprite.x = this.game.playerBall.x;
        this.powerBarSprite.y = this.game.playerBall.y;

        this.currentPowerBallSprite.x = this.game.playerBall.x + Math.cos(this.angle + Math.PI) * this.currentDistance; // this.game.camera.currentZoom;
        this.currentPowerBallSprite.y = this.game.playerBall.y + Math.sin(this.angle + Math.PI) * this.currentDistance; // this.game.camera.currentZoom;

        this.powerNormal = this.currentDistance / this.maxDis;
        this.powerNormal = Math.min(1, this.powerNormal);

        this.currentPowerBallSprite.scale.set(this.powerNormal * this.maxScale * 0.5);
        this.currentPowerBallSprite.scale.y = this.currentPowerBallSprite.scale.x * 0.5;
        this.maxPowerSpriteRef.x = utils.lerp(this.maxPowerSpriteRef.x, this.game.playerBall.x + Math.cos(this.angle + Math.PI) * this.maxDis, 0.9998);
        this.maxPowerSpriteRef.y = utils.lerp(this.maxPowerSpriteRef.y, this.game.playerBall.y + Math.sin(this.angle + Math.PI) * this.maxDis, 0.9998);

        this.aim.updateAngle(this.angle);
        this.x = this.game.playerBall.x;
        this.y = this.game.playerBall.y;

        this.getSimulatedPosition();
    }
    updateMouse(pos) {
        if (!this.game.playerBall.isMoving) {
            const globalPlayer = this.game.playerBall.getGlobalPosition();

            this.globalDistance = Utils.distance(globalPlayer.x, globalPlayer.y, pos.x, pos.y);
            this.globalDistance = Math.min(this.globalDistance, this.maxDis);
            this.currentDistance = this.globalDistance / this.game.camera.currentZoom;
            this.currentDistance = Math.min(this.currentDistance, this.maxDis);
            this.angle = Math.atan2(globalPlayer.y - pos.y, globalPlayer.x - pos.x);
            this.powerBarSprite.rotation = this.angle + Math.PI / 2;
            this.powerBarSprite.scale.y = this.currentDistance / this.powerBarSprite.height * this.powerBarSprite.scale.y; // this.game.camera.currentZoom;
            this.alpha = 1;

            this.powerBarSprite.x = this.game.playerBall.x;
            this.powerBarSprite.y = this.game.playerBall.y;

            this.currentPowerBallSprite.x = this.game.playerBall.x + Math.cos(this.angle + Math.PI) * this.currentDistance; // this.game.camera.currentZoom;
            this.currentPowerBallSprite.y = this.game.playerBall.y + Math.sin(this.angle + Math.PI) * this.currentDistance; // this.game.camera.currentZoom;

            this.powerNormal = this.currentDistance / this.maxDis;
            this.powerNormal = Math.min(1, this.powerNormal);
            this.game.playerBall.powerNormal = this.powerNormal;

            this.currentPowerBallSprite.scale.set(this.powerNormal * this.maxScale);
            this.currentPowerBallSprite.scale.y = this.currentPowerBallSprite.scale.x * 0.5;

            this.maxPowerSpriteRef.x = utils.lerp(this.maxPowerSpriteRef.x, this.game.playerBall.x + Math.cos(this.angle + Math.PI) * this.maxDis, 0.9998);
            this.maxPowerSpriteRef.y = utils.lerp(this.maxPowerSpriteRef.y, this.game.playerBall.y + Math.sin(this.angle + Math.PI) * this.maxDis, 0.9998);

            this.aim.updateAngle(this.angle);
            this.x = this.game.playerBall.x;
            this.y = this.game.playerBall.y;

            this.getSimulatedPosition();
        }
    }
    updatePowerBar(pos, currentCard) {
        this.currentCard = currentCard;
        this.updateMouse(pos);
        this.alpha = 1;
    }
    // TODO: get proper simulated data
    getSimulatedPosition() {
        const fixedDelta = 1 / 60;
        const gravity = this.game.playerBall.gravity;
        let shootHigh = 0;
        let shooDist = 0;

        // console.log();

        if (this.currentCard) {
            shootHigh = -this.game.playerBall.getShootHigh(this.currentCard.data.power * this.powerNormal, this.currentCard.data.verticalForce);
            shooDist = this.game.playerBall.getShootForce(this.powerNormal, this.currentCard.data.power);
        } else {
            shootHigh = -this.game.playerBall.getShootHigh(Number(this.powerNormal), 1);
            shooDist = this.game.playerBall.getShootForce(this.powerNormal, 1);
        }
        // if(shootHigh == 0){
        //     console.log(this.game.playerBall.currentTerrainData);
        // }

        this.simulatedDist = 0;

        let velZ = shootHigh;
        let tepmZ = 1;

        let detect = true;
        let steps = 0;

        let max = -9999;

        while (detect) {
            velZ -= gravity * fixedDelta;

            tepmZ += velZ * fixedDelta;

            if (max < tepmZ) {
                max = tepmZ;
            }
            // console.log(tepmZ);

            if (tepmZ <= 0) {
                detect = false;
            }

            if (steps > 600) {
                detect = false;
            } else {
                steps++;
            }
        }
        // steps--
        // steps--
        // steps--

        this.simulatedDist = steps * shooDist * fixedDelta;

        this.aim.dist = utils.lerp(this.aim.dist, this.simulatedDist, 0.99);
        this.aim.shootHigh = max;
    }
    cancelShot() {
        // console.log('cancel');
        this.alpha = 0;
        this.currentDistance = 0;
        this.angle = 0;
        InGameInput.isDown = false;
    }
}