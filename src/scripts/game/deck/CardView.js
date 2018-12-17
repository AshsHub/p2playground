import Signals from 'signals';
import {
    TweenLite,
    Elastic,
} from 'gsap';

export default class CardView extends PIXI.Container {
    constructor() {
        super();
        this.energy;
        this.power;
        this.originalPos;

        this.style = new PIXI.TextStyle({
            fontFamily: 'feastofflesh',
            fontSize: 50,
            align: 'center',
        });

        this.onHold = new Signals();
        this.onRelease = new Signals();
        this.interactive = true;
        this.on('mousedown', this.onMouseDown.bind(this)).on('touchstart', this.onMouseDown.bind(this));
        this.on('mouseup', this.onMouseUp.bind(this)).on('touchend', this.onMouseUp.bind(this));
        this.on('mouseupoutside', this.onMouseUp.bind(this)).on('touchendoutside', this.onMouseUp.bind(this));

        this.shadowContainer = new PIXI.Container();
        this.cardContainer = new PIXI.Container();
        this.frontCard = new PIXI.Container();
        this.backCard = new PIXI.Container();
        this.cardContainer.addChild(this.backCard);
        this.cardContainer.addChild(this.frontCard);
        this.addChild(this.shadowContainer);
        this.addChild(this.cardContainer);
        // this.cardContainer.visible = false;
        // this.shadowContainer.visible = false;
    }
    tweenReset() {
        this.reset();
        TweenLite.from(this, 0.5, {
            y: 250,
            rotation: 0,
            ease: Back.easeOut,
        });
    }
    reset() {
        TweenLite.killTweensOf(this);
        this.x = this.startPos.x;
        this.y = this.startPos.y;
        this.alpha = 1;
        this.rotation = this.startRotation;
    }
    build() {
        this.setupCard();
        this.setupInfoZones();

        this.starContainer = new PIXI.Container();
        this.frontCard.addChild(this.starContainer);
        this.starContainer.y = this.back.height / 1.6;

        // this.sprite.anchor.set(0.5)
        // this.pivot.x = -this.sprite.width *0.5
        // this.pivot.y = -this.sprite.height *0.5
    }
    setupCard() {
        this.shadow = new PIXI.Sprite.fromFrame('cardShadow.png');
        this.shadowContainer.addChild(this.shadow);
        this.shadow.anchor.set(0.5);
        this.shadow.scale.set(0.5);
        this.shadow.y = 20;

        this.back = new PIXI.Sprite.fromFrame('back.png');
        // this.backCard.addChild(this.back);

        this.image = new PIXI.Sprite.fromFrame('images0001.png');
        // this.backCard.addChild(this.image);
        this.image.anchor.set(0.5);

        this.border = new PIXI.Sprite.fromFrame('border.png');
        // this.frontCard.addChild(this.border);
        this.energy = new PIXI.Sprite.fromFrame('energy.png');
        // this.frontCard.addChild(this.energy);
        // this.image.x = 8;
        // this.image.y = 30;

        this.back = new PIXI.Sprite.fromFrame('cardmask.png');
        this.backCard.addChild(this.back);
        this.backCard.addChild(this.image);

        this.image.scale.set(this.back.width / this.image.width, this.back.height / this.image.height);
        this.image.x = this.back.width / 2;
        this.image.y = this.back.height / 2;

        //this.backCard.mask = this.back;

        this.cover = new PIXI.Sprite.fromFrame('cardtop.png');
        this.frontCard.addChild(this.cover);

        this.backCard.x = -this.back.width * 0.5;
        this.backCard.y = -this.back.height * 0.5;

        this.frontCard.x = -this.back.width * 0.5 - 2;
        this.frontCard.y = -this.back.height * 0.5 - 2;

        // this.shadow.x = this.back.width * 0.5;
        // this.shadow.y = this.back.height * 0.5;
        this.cross = new PIXI.Sprite.fromFrame('angry.png');
        this.cross.alpha = 0;
        this.frontCard.addChild(this.cross);
    }
    setupInfoZones() {
        this.textEnergyBack = new PIXI.Text('');
        this.textEnergyBack.style.fontFamily = 'feastofflesh';
        this.textEnergyBack.style.fontSize = 20;
        this.textEnergyBack.style.fill = 0x000000;
        this.frontCard.addChild(this.textEnergyBack);

        this.textEnergyBack.anchor.set(0.5);
        // this.textEnergyBack.x = this.back.width / 2;
        this.textEnergyBack.x = 25;
        this.textEnergyBack.y = this.back.height * 0.85;
        this.textEnergyBack.scale.set(2.5);

        this.textEnergy = new PIXI.Text('');
        this.textEnergy.style.fontFamily = 'feastofflesh';
        this.textEnergy.style.fontSize = 20;
        this.textEnergy.style.stroke = 0;
        this.textEnergy.style.strokeThickness = 2;
        this.textEnergy.style.fill = 0xFFFFFF;
        this.frontCard.addChild(this.textEnergy);

        this.textEnergy.anchor.set(0.5);
        // this.textEnergy.x = this.back.width / 2;
        // this.textEnergy.y = this.back.height * 0.8 - 6;
        this.textEnergy.x = this.textEnergyBack.x;
        this.textEnergy.y = this.textEnergyBack.y;
        this.textEnergy.scale.set(2.5);

        this.startRotation = this.rotation;
        this.startPos = {
            x: this.x,
            y: this.y,
        };

        this.textNameContainer = new PIXI.Container();
        this.back.addChild(this.textNameContainer);
        this.textName = new PIXI.Text('', this.style);
        this.textName.anchor.set(0.5);
        this.textName.style.fontSize = 18;
        this.textNameContainer.addChild(this.textName);
        this.textNameContainer.x = this.x + this.width / 2;
        this.textNameContainer.y = 20;

        this.textDescContainer = new PIXI.Container();
        this.back.addChild(this.textDescContainer);
        this.textDesc = new PIXI.Text('', this.style);
        this.textDesc.style.fontSize = 18;
        this.textDescContainer.addChild(this.textDesc);
        this.textDescContainer.x = this.x + 15;
        this.textDescContainer.y = this.y + this.height / 1.5;

        this.powerContainer = new PIXI.Container();
        // this.frontCard.addChild(this.powerContainer);
        this.powerIcon = new PIXI.Sprite.fromFrame('att.png');
        this.powerContainer.addChild(this.powerIcon);
        this.powerIcon.x = 15;
        this.powerIcon.y = 170;
        this.powerIcon.tint = 16349047;
        this.textPower = new PIXI.Text('', this.style);
        this.textPower.style.fontSize = 18;
        this.textPower.anchor.set(0.5);
        this.powerIcon.addChild(this.textPower);
        this.textPower.x = 20;
        this.textPower.y = 20;

        this.accuracyContainer = new PIXI.Container();
        // this.frontCard.addChild(this.accuracyContainer);
        this.accuracyIcon = new PIXI.Sprite.fromFrame('att.png');
        this.accuracyContainer.addChild(this.accuracyIcon);
        this.accuracyIcon.x = 105;
        this.accuracyIcon.y = 170;
        this.accuracyIcon.tint = 7384042;
        this.textAcc = new PIXI.Text('', this.style);
        this.textAcc.anchor.set(0.5);
        this.textAcc.style.fontSize = 18;
        this.accuracyIcon.addChild(this.textAcc);
        this.textAcc.x = 20;
        this.textAcc.y = 20;

        this.verticalContainer = new PIXI.Container();
        // this.frontCard.addChild(this.verticalContainer);
        this.verticalIcon = new PIXI.Sprite.fromFrame('att.png');
        this.verticalContainer.addChild(this.verticalIcon);
        this.verticalIcon.x = 60;
        this.verticalIcon.y = 170;
        this.verticalIcon.tint = 14708970;
        this.textVert = new PIXI.Text('', this.style);
        this.textVert.anchor.set(0.5);
        this.textVert.style.fontSize = 18;
        this.verticalIcon.addChild(this.textVert);
        this.textVert.x = 20;
        this.textVert.y = 20;
    }
    savePosition() {
        this.startRotation = this.rotation;
        this.startPos = {
            x: this.x,
            y: this.y,
        };
    }
    onMouseUp() {
        console.log('on RELEASE');
        this.cross.alpha = 0;
        TweenLite.to(this.cardContainer.scale, 0.25, {
            x: 1,
            y: 1
        });
        TweenLite.to(this.shadow.scale, 0.25, {
            x: 0.5,
            y: 0.5
        });

        this.onRelease.dispatch(this);
    }
    onMouseDown() {
        // console.log(this.data);
        this.onHold.dispatch(this);
        // this.alpha = 0.5
        this.shadow.alpha = 0.5;
        TweenLite.to(this.cardContainer.scale, 0.25, {
            x: 1.25,
            y: 1.25,
            ease: Back.easeOut
        });
        TweenLite.to(this.shadow.scale, 0.25, {
            x: 1,
            y: 1,
            ease: Back.easeOut
        });
    }
    cardAnimation() {

    }
    setData(data) {
        this.data = data;

        this.image.texture = PIXI.Texture.from(this.data.image);
        this.border.tint = this.data.color.border;
        this.energy.tint = this.data.color.energy;
        this.back.tint = this.data.color.back;

        this.textEnergy.text = this.data.energy;
        this.textEnergyBack.text = this.data.energy;
        this.textName.text = this.data.name;
        // this.textDesc.text = this.data.desc;
        this.textPower.text = this.data.power;
        this.textAcc.text = this.data.accuracy;
        this.textVert.text = this.data.verticalForce;

        for (let index = 0; index < 5; index++) {
            this.star = new PIXI.Sprite.fromFrame('star.png');
            // this.starContainer.addChild(this.star);
            this.star.x = this.starContainer.x + (index * 20) + 30;

            if (index < this.data.level) {
                this.star.tint = 0xF7F705;
                this.star.texture = PIXI.Texture.from('starGlow.png');
            }
        }
    }
}