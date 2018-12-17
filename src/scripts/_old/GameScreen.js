import * as PIXI from 'pixi.js';
import Player from './game/entities/Player';
import Screen from './screenManager/Screen';
import EnvironmentFX from './game/FX/EnvironmentFX';

import Camera from './game/Camera';
import Collisions from './game/core/Collisions';

import BulletManager from './game/level/BulletManager';
import LevelManager from './game/level/LevelManager';
import RoomManager from './game/level/RoomManager';
import AimManager from './game/level/AimManager';
import FXManager from './game/FX/FXManager';
import InGameInput from './game/input/InGameInput';
import StandardGun from './game/guns/StandardGun';
import ShotGun from './game/guns/ShotGun';
import SniperGun from './game/guns/SniperGun';
import SubMachineGun from './game/guns/SubMachineGun';
import GameplayHUD from './game/hud/GameplayHUD';
import AimHUD from './game/hud/AimHUD';
import LaserBullet from './game/entities/LaserBullet';
import GameData from './game/GameData';

export default class GameScreen extends Screen
{
    constructor(label)
    {
        super(label);

        // this.tileSize = window.App.desktopResolution.height * 0.25;
        this.maxSizeResolution = Math.max(window.App.resolution.width, window.App.resolution.height);
        window.GAME_SCALES = this.maxSizeResolution / window.App.desktopResolution.width;

        this.background = new PIXI.Graphics().beginFill(0x000000).drawRect(0, 0, window.App.resolution.width, window.App.resolution.height);
        this.addChild(this.background);

        this.gameContainer = new PIXI.Container();
        this.addChild(this.gameContainer);

        this.entityContainer = new PIXI.Container();
        this.gameContainer.addChild(this.entityContainer);

        this.groundContainer = new PIXI.Container();
        this.entityContainer.addChild(this.groundContainer);

        this.wallContainer = new PIXI.Container();
        this.entityContainer.addChild(this.wallContainer);

        this.doorContainer = new PIXI.Container();
        this.entityContainer.addChild(this.doorContainer);

        this.fxContainer = new PIXI.Container();
        this.entityContainer.addChild(this.fxContainer);

        this.ceilContainer = new PIXI.Container();
        this.entityContainer.addChild(this.ceilContainer);

        this.roomCovers = new PIXI.Container();
        this.entityContainer.addChild(this.roomCovers);

        EnvironmentFX.init(this.fxContainer);

        FXManager.init(this.entityContainer, this.ceilContainer);

        this.interactivePanel = new PIXI.Graphics().beginFill(0xFF0000).drawRect(0, 0, 1500, 1500);
        this.addChild(this.interactivePanel);
        this.interactivePanel.alpha = 0;
        this.gameplayHUD = new GameplayHUD();

        this.addChild(this.gameplayHUD);

        this.gameplayHUD.onUpdateGun.add(() =>
        {
            this.changeGun();
        });

        this.camera = new Camera(300 * window.GAME_SCALES, this.entityContainer, this);
        this.camera.updateZoom();

        this.bulletManager = new BulletManager(this);
        this.levelManager = new LevelManager(this);
        this.roomManager = new RoomManager(this);
        this.aimManager = new AimManager(this);

        this.inGameInput = new InGameInput(this);

        this.screenCenter = window.App.getRealCenter();

        this.guns = [];
        this.guns.push(new StandardGun());
        this.guns.push(new ShotGun());
        this.guns.push(new SubMachineGun());
        this.guns.push(new SniperGun());
    }

    changeGun()
    {
        // this.player.changeGun(this.guns[this.gameplayHUD.currentGun]);
    }

    rightClickAction()
    {
        this.player.jump(this.player.headAngle);
    }
    build()
    {
        // this.player = new Player(window.App.desktopResolution.height * 0.15);
        this.player = new Player({ radius: GameData.playerSize });

        Collisions.setMapData(this.levelManager.dungeonGenerator.mapData);

        this.levelManager.player = this.player;
        this.roomManager.player = this.player;
        this.bulletManager.player = this.player;
        this.aimManager.player = this.player;

        this.gameplayHUD.initiHUD(this.levelManager);
        this.roomManager.drawLevel(this.levelManager.dungeonGenerator);

        this.player.x = (this.levelManager.dungeonGenerator.dungeon.start_pos[0] * GameData.tileSize) + GameData.tileSize * 0.5;
        this.player.y = (this.levelManager.dungeonGenerator.dungeon.start_pos[1] * GameData.tileSize) + GameData.tileSize * 0.5;

        this.camera.forcePosition(this.player, this.screenCenter);

        // this.roomManager.buildEnemies(this.levelManager.dungeonGenerator.dungeon);

        this.player.reset();

        this.player.onShoot.add((target) =>
        {
            this.bulletManager.shoot(target);
        });

        this.player.onHit.add((data) =>
        {
            // this.game.bulletManager.shoot(target);
            const target = data.target;

            FXManager.addParticle(target, 5, this.entityContainer, 0.04);
            FXManager.addDemageParticle(target, 1);
        });

        this.roomManager.currentRoom = null;

        this.player.onRoomChanged.add((target) =>
        {
            this.camera.updateRoom(target.currentRoom);
            this.gameplayHUD.updateRoom(target.currentRoom, target);

            this.roomManager.changeRoom(target.currentRoom);

            FXManager.clean();

            EnvironmentFX.clean();
        });

        this.player.onChangeTile.add(() =>
        {
            // update minimap
            this.gameplayHUD.updateMinimap(this.player);
            // verify if the player changed room
            this.levelManager.setCurrentRoom(this.player);
            for (let index = 0; index < this.levelManager.dungeonGenerator.exits.length; index++)
            {
                const element = this.levelManager.dungeonGenerator.exits[index];

                if (element.x == this.player.currentTile.x && element.y == this.player.currentTile.y)
                {
                    // get previous exit to telemport the allies
                    this.player.previousExit.x = element.x;
                    this.player.previousExit.y = element.y;
                    break;
                }
            }
        });

        this.levelManager.addEntity(this.player);
        this.gameplayHUD.updateMinimap(this.player);

        // this.player.addAlly({ radius: 80, type: 1 });
        // this.player.addAlly({ radius: 80, type: 0 });

        this.changeGun();

        this.player.updateCurrentTile();
        this.gameplayHUD.forceMinimap(this.player);
    }

    update(delta)
    {
        FXManager.update(delta);
        EnvironmentFX.update(delta);

        this.levelManager.update(delta);
        this.bulletManager.update(delta);
        this.roomManager.update(delta);
        this.aimManager.update(delta);
        if (window.App.axis.angle !== null)
        {
            if (this.inGameInput.isShift)
            {
                this.player.sprinting(delta);
            }
            else
            {
                this.player.walking();
            }
            this.player.applyVelocity(window.App.axis.angle);
        }
        else
        {
            this.player.zeroVel();
        }

        this.player.update(delta);
        this.roomManager.collidePlayerWithItems(delta);
        this.player.move(delta);

        const targetCamera = { x: Math.cos(this.player.headAngle) * this.aimManager.aim.dist * 0.5, y: Math.sin(this.player.headAngle) * this.aimManager.aim.dist * 0.5 };
        // const targetCamera = { x: this.screenCenter.x, y: this.screenCenter.y };

        const magn = 1;// this.player.getMagnetude();

        // targetCamera.x = this.player.velocity.x * magn * 0.5;
        // targetCamera.y = this.player.velocity.y * magn * 0.5;

        this.camera.update(delta, this.player, targetCamera, this.screenCenter);

        this.entityContainer.children.sort(utils.depthCompare);
        this.entityContainer.setChildIndex(this.fxContainer, 0);
        this.entityContainer.setChildIndex(this.wallContainer, 0);
        this.entityContainer.setChildIndex(this.groundContainer, 0);
        this.entityContainer.setChildIndex(this.ceilContainer, this.entityContainer.children.length - 1);
        this.entityContainer.setChildIndex(this.roomCovers, this.entityContainer.children.length - 1);

        this.inGameInput.update();
    }

    resize(resolution, innerResolution)
    {
        super.resize(resolution, innerResolution);
        this.screenCenter = window.App.getRealCenter();
        this.camera.forcePosition(this.player, this.screenCenter);

        this.gameplayHUD.resize(resolution, innerResolution);
    }
}
