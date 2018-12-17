import InGameInput from "../input/InGameInput";

export default class CameraToggle extends PIXI.Container {
    constructor(game) {
        super();
        this.game = game;

        this.buttonMode = true;
        this.interactive = true;
        this.on('mouseup', this.onMouseUp.bind(this)).on('touchend', this.onMouseUp.bind(this));

        this.isPlayer = true;

        this.cameraData = [{
            entity: 'playerBall',
            image: 'cameraBall.png',
        }, {
            entity: 'courseHole',
            image: 'cameraHole.png',
        }, ];
        this.currentCameraData = 0;
        this.data = this.cameraData[this.currentCameraData];
        this.resetFreeCam = false;
    }
    build() {
        this.toggleContainer = new PIXI.Container();
        this.addChild(this.toggleContainer);

        this.toggleBackSprite = new PIXI.Sprite.from('masksquare.png');
        this.toggleContainer.addChild(this.toggleBackSprite);
        //this.toggleContainer.mask = this.toggleBackSprite;

        this.currentIcon = new PIXI.Sprite.from('cameraBall.png');
        this.toggleContainer.addChild(this.currentIcon);

        this.toggleBorderSprite = new PIXI.Sprite.from('frontsquare.png');
        this.addChild(this.toggleBorderSprite);

        this.clubDescription = new PIXI.Text('');
        this.clubDescription.anchor.set(0.5, 1.2);
        this.clubDescription.style.fontFamily = 'feastofflesh';
        this.clubDescription.style.fontSize = 20;
        this.clubDescription.style.stroke = 0;
        this.clubDescription.style.strokeThickness = 2;
        this.clubDescription.style.fill = 0xFFFFFF;
        this.clubDescription.scale.set(1.75);
        this.toggleContainer.addChild(this.clubDescription);
    }
    onMouseUp() {
        this.currentCameraData++;
        this.currentCameraData %= this.cameraData.length;
        this.data = this.cameraData[this.currentCameraData];

        this.currentIcon.texture = PIXI.Texture.from(this.data.image);
        InGameInput.isFreeCam = false;
        this.resetFreeCam = true;
        this.game.freeCamera = null;
        // this.isPlayer = !this.isPlayer;
        // console.log(this.isPlayer, this.data.entity)
        // if (this.isPlayer){
        //     this.data = this.playerBall;
        // }else{
        //     this.data = this.courseHole;
        // }
    }
}