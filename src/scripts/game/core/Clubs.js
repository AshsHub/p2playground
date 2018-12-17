import Signals from 'signals';
import {
    TweenLite,
    Back
} from 'gsap';
import playerData from "../entities/playerData";

export default class CourseHole extends PIXI.Container {
    constructor() {
        super();
        // this.currentClub = {
        //     image: "wood.png",
        //     clubPower: 1,
        //     clubHeight: 1,
        //     energy: 2
        // };
        this.clubList = [];
        this.clubIndex = 0;
        // this.build();

        this.onRelease = new Signals();

        this.buttonMode = true;
        this.interactive = true;
        this.on('mouseup', this.onMouseUp.bind(this)).on('touchend', this.onMouseUp.bind(this));

        // this.onGreen = false;
        // this.putterSet = false;
        this.setData();
        this.currentClub = this.clubList[this.clubIndex];
    }

    build() {
        this.clubContainer = new PIXI.Container();
        this.addChild(this.clubContainer);

        this.clubBackSprite = new PIXI.Sprite.from('masksquare.png');
        this.clubContainer.addChild(this.clubBackSprite);
        //this.clubContainer.mask = this.clubBackSprite;

        this.currentClubSprite = new PIXI.Sprite.from(this.currentClub.image);
        this.clubContainer.addChild(this.currentClubSprite);

        this.clubBorderSprite = new PIXI.Sprite.from('frontsquare.png');
        this.addChild(this.clubBorderSprite);

        this.smallToken = new PIXI.Sprite.from('energyToken0002.png');
        // this.clubContainer.addChild(this.smallToken);
        this.smallToken.scale.set(1.5);

        this.energyText = new PIXI.Text(this.currentClub.energy);
        this.energyText.anchor.set(0.5);
        this.energyText.x = this.smallToken.x + this.smallToken.width / 2 + 10;
        this.energyText.y = this.smallToken.y + this.smallToken.height / 2 + 10;
        this.energyText.style.fontFamily = 'feastofflesh';
        this.energyText.style.fontSize = 20;
        this.energyText.style.stroke = 0;
        this.energyText.style.strokeThickness = 2;
        this.energyText.style.fill = 0xFFFFFF;
        this.energyText.scale.set(2);
        this.clubContainer.addChild(this.energyText);

        this.clubDescription = new PIXI.Text('WOOD');
        this.clubDescription.anchor.set(0.5, 1.2);
        this.clubDescription.x = this.smallToken.x + this.clubBackSprite.width / 2;
        this.clubDescription.y = this.smallToken.y + this.clubBackSprite.height;
        this.clubDescription.style.fontFamily = 'feastofflesh';
        this.clubDescription.style.fontSize = 20;
        this.clubDescription.style.stroke = 0;
        this.clubDescription.style.strokeThickness = 2;
        this.clubDescription.style.fill = 0xFFFFFF;
        this.clubDescription.scale.set(1.75);
        this.clubContainer.addChild(this.clubDescription);

        this.changeClub();
    }
    // this.changeClub()
    update() {
        // if (this.onGreen && !this.putterSet) {
        //     this.setPutter()
        // }else if (!this.onGreen && this.putterSet){
        //     this.resetClub();
        // }
    }
    setPutter() {
        // this.putterSet = true;
        for (let index = 0; index < this.clubList.length; index++) {
            const element = this.clubList[index];

            if (element.image == 'putter.png') {
                this.clubIndex = index;
                this.changeClub();

                return;
            }
        }
    }
    resetClub() {
        // this.putterSet = false;
        this.clubIndex = 0;
        this.changeClub();
    }
    setData() {
        for (let index = 0; index < playerData.clubs.length; index++) {
            const element = playerData.clubs[index];
            const name = element.name;

            this[name + "Club"] = playerData.clubs[index];
            this.clubList.push(this[name + "Club"]);
        }
    }
    changeClub() {
        this.currentClub = this.clubList[this.clubIndex];
        this.currentClubSprite.texture = PIXI.Texture.from(this.currentClub.image);
        this.energyText.text = this.currentClub.energy;

        this.clubDescription.text = this.currentClub.name;

        TweenLite.killTweensOf(this.clubDescription);
        this.clubDescription.y = this.smallToken.y + this.clubBackSprite.height;
        this.clubDescription.alpha = 1;

        TweenLite.from(this.clubDescription, 0.5, {
            alpha: 0,
            y: this.clubDescription.y + 20,
            ease: Back.easeOut
        });

        if (this.clubIndex < this.clubList.length - 1) {
            this.clubIndex++;
        } else {
            this.clubIndex = 0;
        }
    }
    onMouseUp() {
        // if (!this.onGreen) {
        this.changeClub();
        this.onRelease.dispatch(this.currentClub);
        // }
    }
}