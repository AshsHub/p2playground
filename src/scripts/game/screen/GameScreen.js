import * as PIXI from 'pixi.js';
import Screen from '../../screenManager/Screen';
import Camera from '../core/Camera';
import PlayerBall from '../entities/PlayerBall';
// import CourseHole from '../entities/CourseHole';
import Utils from '../../utils';
// import PowerBar from '../core/PowerBar';
import InGameInput from '../input/InGameInput';
// import DeckManager from '../deck/DeckManager';
// import EntityManager from '../entities/EntityManager';
import EntityManager from '../entities/EntityManagerP2';
// import AccuracyBar from '../ui/hud/AccuracyBar';
import HUD from '../ui/hud/HUD';
import BuildEnvironment from '../builder/BuildEnvironment';
import EntityBuilder from '../entities/EntityBuilder';

export default class GameScreen extends Screen {
    constructor(label) {
        super(label);

        this.maxSizeResolution = Math.max(window.App.resolution.width, window.App.resolution.height);
        window.GAME_SCALES = 1; // this.maxSizeResolution / window.App.desktopResolution.width;

        // this.instEntities();
        // this.signalReciever();
        // const center = window.App.getRealCenter();
        // this.accuracyBar.x = center.x;
        // this.accuracyBar.y = center.y + 550;

        // this.environmentList = [];

        // this.playerForceLimit = true;

        this.cameraTarget = this.playerBall;
        window.ENTITIES = EntityBuilder;

        this.freeCamera;
    }
    build() {
        this.background = new PIXI.Graphics().beginFill(0x7EC0EE).drawRect(0, 0, window.App.resolution.width, window.App.resolution.height);
        //this.addChild(this.background);

        this.gameContainer = new PIXI.Container();
        this.addChild(this.gameContainer);

        this.entityContainer = new PIXI.Container();
        this.gameContainer.addChild(this.entityContainer);

        this.camera = new Camera(300 * window.GAME_SCALES, this.entityContainer, this);
        this.camera.currentZoom = 0.13;
        //this.camera.updateZoom();
        this.screenCenter = window.App.getRealCenter();

        this.interactivePanel = new PIXI.Graphics().beginFill(0xFF0000).drawRect(0, 0, 1500, window.App.desktopResolution.height);
        this.addChild(this.interactivePanel);
        this.interactivePanel.alpha = 0.2;
        InGameInput.init(this);

        this.entityManager = new EntityManager(this);
        this.entityManager.build();
        // this.buildEnvironment();
        // this.playerBall.currentClub = this.HUDLayer.currentClub.currentClub;
        // this.playerBall.currentTerrainData = this.playerBall.setDefaultTerrainData();
        // this.entityManager.reset();
    }
    update(delta) {
        const lerpCamera = {
            x: 0,
            y: 0,
        };

        this.camera.update(delta, lerpCamera, lerpCamera, this.screenCenter);
    }
    fixedUpdate(fixedDelta) {
        // this.entityManager.update(fixedDelta);

        // // console.log(this.powerBar.globalDistance);

        // this.entityContainer.children.sort(Utils.depthCompare);
        // this.entityContainer.setChildIndex(this.groundContainer, 0);

        this.entityManager.update(fixedDelta)
    }
    destroy() {
        this.environment.destroy();
        console.log(this.environment.environmentData);
    }
































    instEntities() {
        this.background = new PIXI.Graphics().beginFill(0x7EC0EE).drawRect(0, 0, window.App.resolution.width, window.App.resolution.height);
        this.addChild(this.background);

        this.gameContainer = new PIXI.Container();
        this.addChild(this.gameContainer);

        this.entityContainer = new PIXI.Container();
        this.gameContainer.addChild(this.entityContainer);

        this.camera = new Camera(300 * window.GAME_SCALES, this.entityContainer, this);
        this.camera.currentZoom = 0.13;
        this.camera.updateZoom();
        this.screenCenter = window.App.getRealCenter();
        InGameInput.init(this);

        this.groundContainer = new PIXI.Container();
        this.entityContainer.addChild(this.groundContainer);

        this.interactivePanel = new PIXI.Graphics().beginFill(0xFF0000).drawRect(0, 0, 1500, window.App.desktopResolution.height);
        this.addChild(this.interactivePanel);
        this.interactivePanel.alpha = 0;
        this.interactivePanel.y = -300;

        this.HUDLayer = new HUD(this);
        this.addChild(this.HUDLayer);

        this.courseData = newCourse;

        this.environment = new BuildEnvironment(this);

        this.playerBall = new PlayerBall(this);
        this.entityContainer.addChild(this.playerBall);
        this.playerBall.build();
        this.HUDLayer.build();
        this.courseHole = new CourseHole(this);
        this.entityContainer.addChild(this.courseHole);
        this.courseHole.build();
        this.powerBar = new PowerBar(this);
        this.entityContainer.addChild(this.powerBar);

        this.accuracyBar = new AccuracyBar(this);
        this.gameContainer.addChild(this.accuracyBar);
        this.deckManager = new DeckManager(this);
        this.addChild(this.deckManager);

        this.entityManager = new EntityManager(this);
        this.entityManager.fortList.push(this.courseHole.fort);
        this.entityManager.build(this.courseData);
        this.deckManager.clickRadius = this.HUDLayer.clickRadius;
    }
    signalReciever() {
        InGameInput.onShoot.add((pos) => {
            if (!this.deckManager.ableToShoot) {
                return;
            }

            let energyCheck = this.deckManager.currentEnergy -
                this.HUDLayer.currentClub.currentClub.energy;

            if (this.deckManager.activeCard) {
                energyCheck -= this.deckManager.activeCard.data.energy;
            }

            if (!this.HUDLayer.checkCancel(pos) && energyCheck >= 0) {
                this.deckManager.currentEnergy -= this.HUDLayer.currentClub.currentClub.energy;
                this.powerBar.currentCard = null;
                this.playerBall.shoot(pos, this.powerBar.powerNormal, this.deckManager.activeCard, this.accuracyBar.arrow.rotation);

                if (this.deckManager.activeCard) {
                    this.deckManager.returnCardToDeck();
                }
            } else {
                this.cancelShooting();
                this.deckManager.returnCardToHand();
                this.playerBall.denyShot();
            }

            this.setDeckToTheTop();

            this.accuracyBar.reset();
            this.HUDLayer.cancelShotIcon.reset();
        });

        InGameInput.onUpdateMouse.add((pos) => {
            // DEBUG FUNCTION
            // this.deckManager.forceCard();
            this.mousePos = pos;

            if (!InGameInput.isFreeCam) {
                if (!InGameInput.canShoot) {
                    this.powerBar.powerBarSprite.tint = 0xFF0000;
                } else {
                    this.powerBar.powerBarSprite.tint = 0x32E2DF;
                }

                if (this.deckManager.ableToShoot && InGameInput.isDown) {
                    this.HUDLayer.checkCancel(pos);
                    this.powerBar.updateMouse(pos);
                }

                if (this.deckManager.currentCard) {
                    const card = this.deckManager.currentCard.data;

                    if (card.data.type === 'active') {
                        this.entityManager.dropCardRange.updateEntity(this.mousePos, this.entityContainer, this.playerBall);
                        const canPlace = this.entityManager.dropCardRange.canPlace;

                        this.deckManager.canPlaceActive = canPlace;
                    }
                }
            } else {
                this.updateFreeCamera(this.mousePos);
            }
        });

        InGameInput.onMousePress.add((pos) => {
            if (this.playerBall.isMoving) {
                return;
            }
            const localPos = this.entityContainer.toLocal(pos);
            const distance = Utils.distance(localPos.x, localPos.y, this.playerBall.x, this.playerBall.y);

            const minDist = this.playerBall.clickZoneSprite.width / 2;

            if (this.deckManager.ableToShoot && distance < minDist) {
                // //////////this.accuracyBar.setLimit(this.deckManager.activeCard.data.accuracy);
                this.powerBar.updatePowerBar(pos, this.deckManager.activeCard);
                // this.accuracyBar.powerBarContainer.alpha = 1;
                this.setInteractiveToTop();

                InGameInput.shootConfirmed();
                this.HUDLayer.toggleCamera.currentIcon.texture = PIXI.Texture.from(this.HUDLayer.toggleCamera.data.image);
            } else {
                // this.playerBall.denyShot();
                if (!this.freeCamera) {
                    this.freeCamera = {
                        x: this[this.HUDLayer.toggleCamera.data.entity].x,
                        y: this[this.HUDLayer.toggleCamera.data.entity].y,
                    };
                    this.HUDLayer.toggleCamera.resetFreeCam = false;
                    this.HUDLayer.toggleCamera.currentIcon.texture = PIXI.Texture.from('cameraFree.png');
                    this.HUDLayer.toggleCamera.currentCameraData++;
                    this.HUDLayer.toggleCamera.currentCameraData %= this.HUDLayer.toggleCamera.cameraData.length;
                }
                InGameInput.dragConfirmed();
            }
        });
        InGameInput.onMouseOutside.add((pos) => {
            this.cancelShooting();
        });

        InGameInput.cancelShot.add(() => {
            this.cancelShooting();
        });

        InGameInput.setTop.add((setTop) => {
            // console.log(setTop);
            this.HUDLayer.setCancel(setTop);
        });

        this.deckManager.onReturnCard.add(() => {
            this.powerBar.currentCard = null;
            this.deckManager.currentCard = null;
            this.entityManager.dropCardRange.alpha = 0;
        });
        this.deckManager.onCardUsed.add((card) => {
            setTimeout(() => {
                this.powerBar.currentCard = this.deckManager.activeCard;
            }, 50);
        });
        this.deckManager.onPlaceCard.add((card) => {
            const dropPos = this.entityContainer.toLocal(this.mousePos);

            this.entityManager.dropCardRange.alpha = 0;

            if (card.data.class === 'defence') {
                this.entityManager.setEnemies(null, dropPos, card.data);
            } else if (card.data.class === 'attack') {
                this.entityManager.setFreezer(dropPos, card.data, this.entityManager.dropCardRange.width);
            }
        });

        this.playerBall.onGreen.add(() => {
            this.HUDLayer.currentClub.setPutter();
            this.playerBall.currentClub = this.HUDLayer.currentClub.currentClub;
        });

        this.playerBall.exitGreen.add(() => {
            this.HUDLayer.currentClub.resetClub();
            this.playerBall.currentClub = this.HUDLayer.currentClub.currentClub;
        });

        this.playerBall.isMovingSignal.add(() => {
            this.powerBar.alpha = 0;
            this.HUDLayer.setPopup(this.playerBall.currentTerrainData.type, true);
        });

        this.playerBall.notMovingSignal.add(() => {
            this.powerBar.alpha = 1;
            this.HUDLayer.setPopup(this.playerBall.currentTerrainData.type, false);
        });

        this.HUDLayer.exitSignal.add(() => {
            this.screenManager.change('Title');
            this.deckManager.returnCardToHand();
        });
    }
    updateFreeCamera(mousePos) {
        const dist = utils.distance(mousePos.x, mousePos.y, InGameInput.startPos.x, InGameInput.startPos.y);

        if (dist < 5) {
            return;
        }
        const angle = utils.getAngle(InGameInput.startPos.x, InGameInput.startPos.y, mousePos.x, mousePos.y);
        const target = {
            // x: (Math.cos(angle) * this.zoneSprite.width / 2) + mousePos.x,
            // y: (Math.sin(angle) * this.zoneSprite.width / 2) + mousePos.y,

            x: (Math.cos(angle) * dist) + mousePos.x * this.camera.freeCamSpeed,
            y: (Math.sin(angle) * dist) + mousePos.y * this.camera.freeCamSpeed,
        };

        // this.freeCamera.x += target.x;
        // this.freeCamera.y += target.y;

        this.freeCamera.x -= target.x;
        this.freeCamera.y -= target.y;

        this.camera.freeCamDropPos = this.freeCamera;
    }

    // update(delta) {
    fixedUpdateOLD(fixedDelta) {
        this.entityManager.update(fixedDelta);

        // console.log(this.powerBar.globalDistance);

        this.entityContainer.children.sort(Utils.depthCompare);
        this.entityContainer.setChildIndex(this.groundContainer, 0);
    }
    updateOld(delta) {
        const lerpCamera = {
            x: 0,
            y: 0,
        };

        this.playerBall.move(delta);

        this.deckManager.update(delta);

        this.HUDLayer.update();
        this.screenCenter = window.App.getRealCenter();
        this.screenCenter.y -= 50;

        this.cameraSet();
        // if(this.playerBall.isMoving)
        // targetCamera = this.cameraSet2(targetCamera);
        // targetCamera = this.cameraSet(targetCamera);
        // console.log(targetCamera);

        // this.camera.update(delta, this.playerBall, targetCamera, this.screenCenter);
        if (this.cameraTarget) {
            this.camera.update(delta, this.cameraTarget, lerpCamera, this.screenCenter);
        }

        // if (InGameInput.isFreeCam) {
        //     this.updateFreeCamera(this.mousePos);
        // }
        // this.entityManager.dropCardRange.updateEntity(this.mousePos, this.entityContainer);
    }
    cameraSet() {
        if (InGameInput.isDown) {
            if (!InGameInput.isFreeCam) {
                this.cameraTarget = this[this.HUDLayer.toggleCamera.data.entity];
            } else {
                this.cameraTarget = this.freeCamera;
            }
        } else
        if (InGameInput.isFreeCam) {
            this.cameraTarget = this.camera.freeCamDropPos;
        } else if (!InGameInput.isFreeCam && this.HUDLayer.toggleCamera.resetFreeCam) {
            this.cameraTarget = this[this.HUDLayer.toggleCamera.data.entity];
        }
    }
    // cameraSet(targetCamera) {
    //     if (this.powerBar.angle != null) {
    //         targetCamera.x += Math.cos(this.powerBar.angle) * this.powerBar.currentDistance; //* 0.5
    //         targetCamera.y += Math.sin(this.powerBar.angle) * this.powerBar.currentDistance; //* 0.5
    //     }

    //     return targetCamera;
    // }
    resize(resolution, innerResolution) {
        super.resize(resolution, innerResolution);
        this.screenCenter = window.App.getRealCenter();
        /////////////////////////////////////////////////////////////this.camera.forcePosition(this.playerEntity, this.screenCenter);
        // this.camera.forcePosition(this.playerBall, this.screenCenter);
        //this.deckManager.resize(resolution, innerResolution);
        //this.HUDLayer.resize(resolution, innerResolution);
        //this.deckManager.clickRadius = this.HUDLayer.clickRadius;
    }
    buildEnvironment() {
        this.environment.build(this.courseData);
    }
    setDeckToTheTop() {
        this.interactivePanel.y = -300;
        this.deckManager.parent.setChildIndex(this.deckManager, this.deckManager.parent.children.length - 1);
        this.HUDLayer.parent.setChildIndex(this.HUDLayer, this.HUDLayer.parent.children.length - 1);
    }
    setInteractiveToTop() {
        this.interactivePanel.y = 0;
        this.interactivePanel.parent.setChildIndex(this.interactivePanel, this.interactivePanel.parent.children.length - 1);
        this.HUDLayer.parent.setChildIndex(this.HUDLayer, this.HUDLayer.parent.children.length - 1);
    }
    cancelShooting() {
        this.powerBar.cancelShot();
        this.accuracyBar.reset();
        InGameInput.startedHere = false;

        this.setDeckToTheTop();
    }
}