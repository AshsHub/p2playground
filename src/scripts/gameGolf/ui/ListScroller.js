import * as PIXI from 'pixi.js';
import Signals from 'signals';
export default class ListScroller extends PIXI.Container {
    constructor(rect = {
        w: 500,
        h: 500
    }, itensPerPage = 1, masked = true, space = 0) {
        super();
        this.containerBackground = new PIXI.Graphics().beginFill(0xFF0000).drawRect(0, 0, rect.w, rect.h);
        // this.addChild(this.containerBackground)
        this.containerBackground.alpha = 0.5;
        this.marginTop = 0;
        this.space = space;
        this.itens = [];
        this.itensPool = [];
        this.container = new PIXI.Container();
        this.listContainer = new PIXI.Container();

        this.rect = rect;
        this.itemsPerPage = itensPerPage;
        this.itemHeight = this.rect.h / this.itemsPerPage;
        this.snap = true;
        this.ease = Cubic.easeOut;
        // this.ease = Back.easeOut;

        this.container.addChild(this.containerBackground);
        this.container.addChild(this.listContainer);
        this.addChild(this.container);
        if (masked) {
            this.maskGraphic = new PIXI.Graphics().beginFill(0x000000).drawRect(0, 0, rect.w, rect.h);
            this.addChild(this.maskGraphic)
            this.container.mask = this.maskGraphic;
        }
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
        if (this.ableToMove()) {
            TweenLite.killTweensOf(this.listContainer);
            this.listContainer.y -= wheelForce * 50;
        }
        this.testBounds();
    }
    resetPosition() {
        this.listContainer.y = 0;
        this.enableDrag = false;
    }
    addItem(item, fit = 0, center = false) {
        this.listContainer.addChild(item)
        item.y = (this.itemHeight + this.space) * this.itens.length - 1 + this.marginTop;

        if (fit) {
            item.scale.set(this.itemHeight / item.height * fit);
        }
        if (center) {
            item.x = this.rect.w / 2 - (item.width) / 2;
            item.y += item.height / 2
        }

        this.itens.push(item);
    }
    addItens(itens, fit = 0, center = false) {
        for (var i = 0; i < itens.length; i++) {
            let tempItem = itens[i];
            this.addItem(tempItem, 0, center)

        }
        this.lastItemClicked = this.itens[0]
    }
    endDrag(force = false) {
        if (!this.enableDrag && !force) {
            return;
        }
        this.dragging = false;
        this.containerBackground.interactive = false;
        this.testBounds();

    }
    ableToMove() {
        let tempHeight = this.itemHeight + this.space
        let maxH = tempHeight * this.itens.length;

        let top = this.sideMoving < 0 && this.listContainer.y >= 0
        let bottom = this.sideMoving > 0 && maxH + this.listContainer.y < this.containerBackground.height;
        if (top || bottom) {
            return false
        } else {
            return true
        }



    }
    testBounds() {
        let target = 0;
        let targY = this.listContainer.y
        let tempHeight = this.itemHeight + this.space
        let maxH = tempHeight * this.itens.length;
        // this.detectOnScreenObjects();

        if (this.snap) {
            if (this.sideMoving == 1) {
                targY -= tempHeight / 2;
                target = Math.floor(targY / tempHeight) * tempHeight
            }
            else if (this.sideMoving == -1) {

                targY += tempHeight / 2;
                target = Math.ceil(targY / tempHeight) * tempHeight
            }
        }
        if (target >= 0) {
            this.detectOnScreenObjects(0)
            TweenLite.killTweensOf(this.listContainer);
            TweenLite.to(this.listContainer, 0.75,
                {
                    y: 0,
                    ease: this.ease,
                    onComplete: () => {
                        this.detectOnScreenObjects();
                    }
                })
        }
        else if (target + maxH < this.containerBackground.height) {
            this.detectOnScreenObjects(this.containerBackground.height - maxH)
            TweenLite.killTweensOf(this.listContainer);
            TweenLite.to(this.listContainer, 0.75,
                {
                    y: this.containerBackground.height - maxH, // - this.listContainer.height,
                    ease: this.ease,
                    onComplete: () => {
                        this.detectOnScreenObjects();
                    }
                })
        }
        else if (target != 0) {
            this.detectOnScreenObjects(target)
            TweenLite.killTweensOf(this.listContainer);
            TweenLite.to(this.listContainer, 0.75,
                {
                    y: target,
                    ease: this.ease,
                    onComplete: () => {
                        this.detectOnScreenObjects();
                    }
                })
        }


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

            this.listContainer.y -= this.dragVelocity.y

            if (this.dragVelocity.y > 0) {
                this.containerBackground.interactive = true;
                this.sideMoving = 1;
            }
            else if (this.dragVelocity.y < 0) {
                this.containerBackground.interactive = true;
                this.sideMoving = -1;
            }
            this.detectOnScreenObjects();
        }


    }
    detectOnScreenObjects(simulatedY = this.listContainer.y) {
        let tempHeight = this.itemHeight + this.space;
        let first = Math.abs(Math.ceil(simulatedY / tempHeight))
        let last = this.rect.h / tempHeight + first - 1
        // console.log(first, last);

        // for (let index = 0; index < this.itens.length; index++) {
        //     this.itens[index].alpha = 0.5;            
        // }
        // for (let index = first; index <= last; index++) {
        //     this.itens[index].alpha = 1;            
        // }
        // console.log(this.itens.length * tempHeight, this.listContainer.y, this.rect.h);

    }
    startDrag(e) {
        if (this.listContainer.height < this.containerBackground.height) {
            return
        }
        this.enableDrag = true;
        this.sideMoving = 0;
        TweenLite.killTweensOf(this.listContainer);
        this.dragging = true;
        this.currentMousePos = {
            x: e.data.global.x,
            y: e.data.global.y
        };
    }
}