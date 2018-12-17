import Club from '../../core/Clubs';
import utils from '../../../utils';
import CancelShot from '../../core/CancelShot';
import CameraToggle from '../../core/CameraToggle';
import Popup from './Popup';
import Collisions from '../../core/Collisions';
import UILabelButton from '../UILabelButton';
import Signals from 'signals';
import ZoomBar from '../ZoomBar';

export default class HUD extends PIXI.Container {
    constructor(game) {
        super();
        this.game = game;

        // this.build();

        this.clickZoneLimit = 0.8;
        this.cancelPos = window.App.innerResolution.height * 0.65;

        this.centerPos = window.App.getRealCenter();
        this.exitSignal = new Signals()
        this.clickRadius;
    }
    updateZoom() {
        this.game.camera.calcZoom(this.game.playerBall.currentClub.zoom);
        this.game.camera.updateZoom();

        if (this.zoomSlider) {
            this.zoomSlider.sliderHandleSprite.y = this.game.camera.currentZoom * 1000;
            this.zoomSlider.checkRange();
        }
    }
    build() {
        this.HUDContainer = new PIXI.Container();
        this.addChild(this.HUDContainer);

        this.currentClub = new Club();
        this.HUDContainer.addChild(this.currentClub);
        this.currentClub.build();
        this.currentClub.onRelease.add((clubData) => {
            this.game.playerBall.currentClub = clubData;
            this.updateZoom();
        });

        this.toggleCamera = new CameraToggle(this.game);
        this.toggleCamera.build();
        this.HUDContainer.addChild(this.toggleCamera);

        this.dropZoneSprite = new PIXI.Sprite.fromFrame('targetSize.png');
        this.HUDContainer.addChild(this.dropZoneSprite);
        this.dropZoneSprite.anchor.set(0.5);
        this.dropZoneSprite.scale.set(3);
        this.dropZoneSprite.alpha = 1
        this.dropZoneSprite.position.set(this.centerPos.x, this.centerPos.y);
        this.cancelShotIcon = new CancelShot();
        this.HUDContainer.addChild(this.cancelShotIcon);

        this.clickRadius = this.dropZoneSprite.width / 2;
        this.cancelShotIcon.x = window.App.innerResolution.width - this.cancelShotIcon.width / 2;
        this.cancelShotIcon.y = window.App.innerResolution.height - this.cancelShotIcon.height * 6;

        this.cancelBounds = {
            x: this.cancelShotIcon.x - this.cancelShotIcon.width / 2,
            y: this.cancelShotIcon.y - this.cancelShotIcon.height / 2,
            width: this.cancelShotIcon.width,
            height: this.cancelShotIcon.height,
        };
        this.currentMouseData = {
            x: 0,
            y: 0,
            radius: 1,
        };

        this.game.playerBall.currentClub = this.currentClub.currentClub;
        this.updateZoom();

        this.popup = new Popup();
        this.popup.build();
        this.HUDContainer.addChild(this.popup);

        this.exitGameButton = new UILabelButton('EXIT DREAM', 0.5, {
            customBackTex: 'energyFill.png',
            customBackTexOn: 'energyFill0001.png',
        });
        this.exitGameButton.onMouseUp.add(() => {
            this.exitSignal.dispatch();
        });
        this.addChild(this.exitGameButton);

        this.zoomSlider = new ZoomBar();
        this.zoomSlider.build();
        this.HUDContainer.addChild(this.zoomSlider);
        this.zoomSlider.x = window.App.innerResolution.width - this.zoomSlider.sliderBarSprite.width;
        this.zoomSlider.y = this.centerPos.y;

        this.zoomSlider.zoomUpdate.add((zoom) => {
            this.game.camera.calcZoom(zoom * 0.002);
            this.game.camera.updateZoom();
        });
    }
    update() {

    }
    checkCancel(pos) {
        this.currentMouseData.x = pos.x;
        this.currentMouseData.y = pos.y;
        if (Collisions.testAABB(this.cancelBounds, this.currentMouseData)) {
            this.cancelShotIcon.isOver();

            return true;
        }
        this.cancelShotIcon.isNotOver();
    }
    setCancel(setTop) {
        if (setTop) {
            this.cancelPos = this.innerResolution.height * 0.1;
        } else {
            this.cancelPos = this.innerResolution.height * 0.65;
        }

        this.cancelShotIcon.y = this.cancelPos;
        this.cancelBounds = {
            x: this.cancelShotIcon.x - this.cancelShotIcon.width / 2,
            y: this.cancelShotIcon.y - this.cancelShotIcon.height / 2,
            width: this.cancelShotIcon.width,
            height: this.cancelShotIcon.height,
        };
    }
    resize(resolution, innerResolution) {
        this.centerPos = window.App.getRealCenter();

        this.innerResolution = innerResolution;

        this.currentClub.scale.set(innerResolution.width * 0.2 / this.currentClub.width);
        this.currentClub.x = innerResolution.width - this.currentClub.width - 20;
        this.currentClub.y = 20;

        this.toggleCamera.scale.set(innerResolution.width * 0.2 / this.toggleCamera.width);
        this.toggleCamera.x = 20;
        this.toggleCamera.y = 20;
        this.cancelShotIcon.scale.set(innerResolution.width * 0.4 / this.cancelShotIcon.width);
        this.cancelShotIcon.x = this.innerResolution.width / 2;
        this.cancelShotIcon.y = this.cancelPos;
        this.cancelBounds = {
            x: this.cancelShotIcon.x - this.cancelShotIcon.width / 2,
            y: this.cancelShotIcon.y - this.cancelShotIcon.height / 2,
            width: this.cancelShotIcon.width,
            height: this.cancelShotIcon.height,
        };

        this.popup.x = innerResolution.width / 2;
        this.popup.y = innerResolution.height * 0.7;

        this.popup.resize(this.innerResolution);

        this.exitGameButton.scale.set(innerResolution.width * 0.2 / this.exitGameButton.width * this.exitGameButton.scale.x);
        this.exitGameButton.x = this.toggleCamera.x;
        this.exitGameButton.y = this.toggleCamera.height + 20;

        this.dropZoneSprite.x = this.centerPos.x;
        this.dropZoneSprite.y = this.centerPos.y;

        this.zoomSlider.scale.set(innerResolution.width * 0.1 / this.zoomSlider.width * this.zoomSlider.scale.x);
        this.zoomSlider.x = innerResolution.width - this.zoomSlider.sliderBarSprite.width;
        this.zoomSlider.y = innerResolution.height / 2
    }
    setPopup(type, isMoving) {
        this.popup.setText(type);
        (isMoving) ? this.popup.hide(): this.popup.show();
    }
}