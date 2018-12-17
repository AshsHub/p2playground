import Signals from 'signals'
export default class ZoomBar extends PIXI.Container {
    constructor() {
        super();
        this.on('mousedown', this.onMouseDown.bind(this)).on('touchend', this.onMouseDown.bind(this));
        this.on('mousemove', this.onMouseMove.bind(this)).on('touchend', this.onMouseMove.bind(this));
        this.on('mouseup', this.onMouseUp.bind(this)).on('touchend', this.onMouseUp.bind(this));
        this.on('mouseout', this.onMouseOutside.bind(this)).on('touchend', this.onMouseOutside.bind(this));
        this.interactive = true;
        this.isDown = false;
        this.zoomValue = 0;

        this.zoomUpdate = new Signals();
    }
    build() {
        this.sliderContainer = new PIXI.Container();
        this.addChild(this.sliderContainer);

        this.sliderBarSprite = new PIXI.Sprite.from("sliderBar.png")
        this.sliderBarSprite.anchor.set(0.5, 0)
        this.sliderContainer.addChild(this.sliderBarSprite)
        this.sliderHandleSprite = new PIXI.Sprite.from("headIcon0001.png")
        this.sliderHandleSprite.anchor.set(0.5)
        this.sliderBarSprite.addChild(this.sliderHandleSprite)

        this.sliderHandleSprite.y = this.sliderBarSprite.height;
    }
    onMouseDown() {
        this.isDown = true;
    }
    onMouseUp() {
        this.isDown = false;
    }
    onMouseMove(e) {
        this.mousePos = {
            x: e.data.global.x,
            y: e.data.global.y,
        }

        if (this.isDown) {
            const mousePos = this.toLocal(this.mousePos);

            this.sliderHandleSprite.y = mousePos.y;

            this.checkRange();

            this.zoomValue = this.sliderHandleSprite.y;
            this.zoomUpdate.dispatch(this.zoomValue);
        }
    }
    onMouseOutside() {
        this.isDown = false;
    }
    checkRange() {
        if (this.sliderHandleSprite.y <= 0) {
            this.sliderHandleSprite.y = 0;
        }

        if (this.sliderHandleSprite.y >= this.sliderBarSprite.height) {
            this.sliderHandleSprite.y = this.sliderBarSprite.height;
        }
    }
}