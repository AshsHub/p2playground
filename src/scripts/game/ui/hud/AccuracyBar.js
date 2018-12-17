export default class AccuracyBar extends PIXI.Container {
    constructor(game) {
        super();
        this.game = game;
        this.hitLeft = false;
        this.limit = 0.375;
        this.limitModifier = 0;

        this.build();
    }
    build() {
        this.powerBarContainer = new PIXI.Container();
        this.addChild(this.powerBarContainer);
        this.powerBarContainer.alpha = 0;
        this.bg = new PIXI.Sprite.fromFrame('meter.png');
        this.powerBarContainer.addChild(this.bg);
        this.bg.anchor.set(0.5, 1);
        this.scale.set(1.5);

        this.arrow = new PIXI.Sprite.fromFrame('arrow.png');
        this.arrow.anchor.set(0.5, 1);
        this.bg.addChild(this.arrow);

        this.target = new PIXI.Sprite.fromFrame('target.png');
        this.target.alpha = 0.5;
        this.target.y = -this.bg.height; // - this.target.height *0.45;
        this.target.scale.set(0.3);

        this.target.anchor.set(0.5, 1);
        this.powerBarContainer.addChild(this.target);

        this.setArrowContainer();
    }
    setArrowContainer() {
        this.leftArrow = new PIXI.Sprite.fromFrame('arrow.png');
        this.leftArrow.anchor.set(0.5, 1);
        this.bg.addChild(this.leftArrow);

        this.rightArrow = new PIXI.Sprite.fromFrame('arrow.png');
        this.rightArrow.anchor.set(0.5, 1);
        this.bg.addChild(this.rightArrow);
        this.setLimit();
    }
    setLimit(newLimit) {
        this.limitModifier = newLimit;
        this.leftArrow.rotation = -this.limit + this.limitModifier;
        this.rightArrow.rotation = this.limit - this.limitModifier;
    }
    rotateArrow(delta, maxRot, speed) {
        if (this.hitLeft) {
            this.arrow.rotation += delta * speed;
        } else {
            this.arrow.rotation -= delta * speed;
        }

        if (this.arrow.rotation <= -maxRot) {
            this.hitLeft = true;
        } else if (this.arrow.rotation >= maxRot) {
            this.hitLeft = false;
        }

        const lll = 0.75 - Math.abs(Math.cos(this.arrow.rotation - Math.PI / 2)) * 0.5;

        this.target.scale.set(lll);
        this.target.alpha = Math.pow(lll, 2);
        // console.log(this.arrow.rotation);
    }
    reset() {
        this.powerBarContainer.alpha = 0;
        this.arrow.rotation = 0;
    }
}