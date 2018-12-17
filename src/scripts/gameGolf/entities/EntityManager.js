import Collisions from '../core/Collisions';
import InGameInput from '../../game/input/InGameInput';
import Utils from '../../utils';
import EntityBuilder from './EntityBuilder';
import Freezer from './Freezer';
import DropCardRange from '../deck/DropCardRange';

export default class EntityManager {
    constructor(game) {
        this.game = game;
        this.entityContainer = game.entityContainer;
        this.treeList = [];
        this.rockList = [];
        this.fortList = [];
        this.enemyzoneList = [];

        this.freezer = new Freezer()
        this.dropCardRange = new DropCardRange(game);
        this.dropCardRange.build();
        this.entityContainer.addChild(this.dropCardRange);

        // this.game.playerBall.playerReset.add(() => {
        // });
    }
    build(data) {
        this.setEnemies(data);
    }
    setEnemies(data = null, spawnPos, cardData) {
        if (data) {
            const courseData = data;

            for (let index = 0; index < courseData.layers.length; index++) {
                if (courseData.layers[index].name === 'EnvironmentLayer') {
                    for (let j = 0; j < courseData.layers[index].objects.length; j++) {
                        if (courseData.layers[index].objects[j].name === 'EnemyZone') {
                            const name = courseData.layers[index].objects[j].name;
                            const func = `get${name}`;

                            const entity = EntityBuilder[func]();

                            const pos = {
                                x: courseData.layers[index].objects[j].x,
                                y: courseData.layers[index].objects[j].y,
                            };

                            entity.build(this.game.playerBall, this.entityContainer, pos);
                            this.game.entityContainer.addChild(entity);
                            this.enemyzoneList.push(entity);
                        }
                    }
                }
            }
        } else {
            const name = 'EnemyZone';
            const func = `get${name}`;

            const entity = EntityBuilder[func]();

            const pos = {
                x: spawnPos.x,
                y: spawnPos.y,
            };

            entity.build(this.game.playerBall, this.entityContainer, pos, cardData.enemyCount);
            this.game.entityContainer.addChild(entity);
            this.enemyzoneList.push(entity);
        }
    }
    setFreezer(spawnPos, cardData, radius) {
        this.freezer.build(spawnPos, cardData);
        this.freezer.maxDistance = radius;
        for (let index = 0; index < this.enemyzoneList.length; index++) {
            const element = this.enemyzoneList[index];

            for (let j = 0; j < element.enemyList.length; j++) {
                const item = element.enemyList[j];

                if (this.freezer.checkDistance(item)) {
                    item.freezeTime = this.freezer.freezeTime;
                    item.isFrozen = true;
                    item.alpha = 0.2;
                }
            }
        }
        this.entityContainer.addChild(this.freezer);
    }
    update(delta) {
        const fixedDelta = delta;

        this.game.playerBall.update(fixedDelta);
        this.powerBarUpdate();
        this.collisionCheck(fixedDelta);
        this.accuracyBarUpdate(fixedDelta);
        this.holeDetection(this.game.courseHole, this.game.playerBall);

        // this.game.HUDLayer.currentClub.update();
        // this.game.HUDLayer.currentClub.onGreen = this.game.playerBall.onGreen;

        this.updateEntities(fixedDelta);
        // this.enemyManager.update(fixedDelta);
    }
    updateEntities(fixedDelta) {
        for (let index = 0; index < this.treeList.length; index++) {
            const element = this.treeList[index];

            element.checkDistance(this.game.playerBall);
            // element.update(fixedDelta);
        }

        for (let index = 0; index < this.fortList.length; index++) {
            const element = this.fortList[index];

            element.update(fixedDelta);
        }

        for (let index = 0; index < this.enemyzoneList.length; index++) {
            const element = this.enemyzoneList[index];

            element.update(fixedDelta);
        }
    }
    powerBarUpdate() {
        if (!InGameInput.isDown && !this.game.playerBall.isMoving) {
            const angle = Math.atan2(this.game.courseHole.y - this.game.playerBall.y, this.game.courseHole.x - this.game.playerBall.x);

            this.game.powerBar.updatePreview(angle);

            // this.accuracyBar.bg.rotation = this.powerBar.angle + (Math.PI / 2);
        }
    }
    collisionCheck(fixedDelta) {

        if (!Collisions.collideWithEnvironment(this.game.playerBall)) {
            // this.game.playerBall.move(fixedDelta);
        }

        // if (!Collisions.collideWithObstacles(this.playerBall, this.obstacleList, fixedDelta)) {
        //     this.playerBall.move(fixedDelta)
        // }

        for (let index = 0; index < this.rockList.length; index++) {
            const element = this.rockList[index];

            if (Collisions.solidCollision(this.game.playerBall, element, fixedDelta)) {
                console.log('Collide');
            }
        }

        for (let index = 0; index < this.treeList.length; index++) {
            const element = this.treeList[index];

            if (Collisions.solidCollision(this.game.playerBall, element, fixedDelta)) {
                console.log('Collide');
            }
        }
        for (let index = 0; index < this.fortList.length; index++) {
            const element = this.fortList[index];
            if (Collisions.solidCollision(this.game.playerBall, element, fixedDelta)) {
                console.log('Collide');
            }
        }

        for (let index = 0; index < this.enemyzoneList.length; index++) {
            const element = this.enemyzoneList[index];

            // console.log(element.enemyEntity);
            if (element.built) {
                element.checkCollision(fixedDelta, this.game.playerBall);
            }
        }

        if (this.dropCardRange.alpha > 0) {
            Collisions.collideWithEnvironment(this.dropCardRange, true)
        }
    }
    holeDetection(p1, p2) {
        if (!this.game.playerBall.onGround) {
            return;
        }

        const tempDist = Utils.distance(p1.x, p1.y, p2.x, p2.y);

        if (tempDist < p2.radius + p1.radius) {
            // if (this.playerBall.force > 50 && this.playerForceLimit) {
            //     return;
            // }

            this.reset();
        }
    }
    accuracyBarUpdate(delta) {
        let tempAcc;
        const baseAcc = 0.375;
        const shotDist = this.game.powerBar.currentDistance / 5000;

        (this.game.deckManager.activeCard) ? tempAcc = baseAcc - this.game.deckManager.activeCard.data.accuracy: tempAcc = 0;
        const speed = (shotDist * 1.5) / this.game.camera.currentZoom * tempAcc; // Math.min((this.powerBar.globalDistance * 0.008) / this.camera.currentZoom * tempAcc, maxShot);

        this.game.accuracyBar.rotateArrow(delta, tempAcc, speed);
    }
    reset() {
        this.game.playerBall.x = this.game.playerBall.startPosition.x;
        this.game.playerBall.y = this.game.playerBall.startPosition.y;
        this.game.playerBall.reset();
        this.game.deckManager.show();
        this.game.HUDLayer.currentClub.resetClub();
        this.game.playerBall.currentClub = this.game.HUDLayer.currentClub.currentClub;

        //Collisions.collideWithEnvironment(this.game.playerBall, 1 / 60, true);
    }
}