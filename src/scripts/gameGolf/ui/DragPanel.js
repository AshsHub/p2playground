import * as PIXI from 'pixi.js';
import Signals from 'signals';
export default class DragPanel extends PIXI.Container {
    constructor(rect = {
        w: 500,
        h: 500
    }) {
        super();
        this.containerBackground = new PIXI.Graphics().beginFill(0xFF00FF).drawRect(0, 0, rect.w, rect.h);
        // this.addChild(this.containerBackground)
        this.containerBackground.alpha = 0.5;
        this.container = new PIXI.Container();
        this.listContainer = new PIXI.Container();

        this.rect = rect;       

        this.container.addChild(this.containerBackground);
        this.container.addChild(this.listContainer);
        this.addChild(this.container);
       
        this.container.interactive = true;

        this.container.on('mousemove', this.moveDrag.bind(this))
            .on('touchmove', this.moveDrag.bind(this))

        this.container.on('mouseover', this.moveOver.bind(this))
        this.container.on('mouseout', this.moveOut.bind(this))

        this.container.on('mousedown', this.startDrag.bind(this))
            .on('touchstart', this.startDrag.bind(this));

        this.container.on('mouseup', this.endDrag.bind(this))
            .on('touchend', this.endDrag.bind(this))
            .on('touchendoutside', this.endDrag.bind(this))
            .on('mouseupoutside', this.endDrag.bind(this));

        this.wheelDirection = -1;

        var mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel"; //FF doesn't recognize mousewheel as of FF3.x        
        if (document.attachEvent)
            document.attachEvent("on" + mousewheelevt, this.onWheelManager.bind(this));
        else if (document.addEventListener)
            document.addEventListener(mousewheelevt, this.onWheelManager.bind(this), false);

            this.onUpdate = new Signals();
            this.onEndDrag = new Signals();
            this.onStartDrag = new Signals();
    }
    moveOver(e) {
        this.mouseOver = true;
    }
    moveOut(e) {
        this.mouseOver = false;
    }
    onWheelManager(e) {
        if (!this.mouseOver) {
            return
        }
        var evt = window.event || e;
        var delta = evt.detail ? evt.detail : evt.wheelDelta;
        const wheelForce = (-delta / 120) / 8 * this.wheelDirection;

        if (wheelForce > 0) {
            this.containerBackground.interactive = true;
            this.sideMoving = 1;
        }
        else if (wheelForce < 0) {
            this.containerBackground.interactive = true;
            this.sideMoving = -1;
        }
       
    }

    endDrag(force = false) {
        if (!this.enableDrag && !force) {
            return;
        }
        this.dragging = false;
        this.containerBackground.interactive = false;
        this.onEndDrag.dispatch(this);
    }
   
    moveDrag(e) {
        if (!this.enableDrag) {
            this.sideMoving = 0;
            return;
        }
        if (this.dragging) {

            this.container.alpha = 1;
            this.dragVelocity = {
                x: (e.data.global.x - this.currentMousePos.x),
                y: this.currentMousePos.y - e.data.global.y
            }
            this.currentMousePos = {
                x: e.data.global.x,
                y: e.data.global.y
            };

            if (this.dragVelocity.y > 0) {
                this.containerBackground.interactive = true;
                this.sideMoving = 1;
            }
            else if (this.dragVelocity.y < 0) {
                this.containerBackground.interactive = true;
                this.sideMoving = -1;
            }
console.log(this.dragVelocity);

            this.onUpdate.dispatch(this.dragVelocity);
        }


    }
    startDrag(e) {
        this.enableDrag = true;
        this.sideMoving = 0;
        this.dragging = true;
        this.currentMousePos = {
            x: e.data.global.x,
            y: e.data.global.y
        };
        this.onStartDrag.dispatch(this);
    }
}