import Utils from '../../utils';
import Signals from 'signals';
import {
    TiltShiftFilter,
} from 'pixi-filters';
import utils from '../../utils';
class InGameInput {
    constructor(game) {
        // this.game = game;
        // if (window.isMobile) {
        //     // window.App.headAxis.onStartDrag.add(()=>this.onMouseDown())
        //     // window.App.headAxis.onStopDrag.add(()=>this.onMouseUp())
        // } else {
        //     this.game.interactivePanel.interactive = true;
        //     this.game.interactivePanel.on('mousemove', this.onMouseMove.bind(this)).on('touchmove', this.onMouseMove.bind(this));
        //     this.game.interactivePanel.on('mousedown', this.onMouseDown.bind(this)).on('touchstart', this.onMouseDown.bind(this));
        //     this.game.interactivePanel.on('rightdown', this.onRightDown.bind(this));
        //     this.game.interactivePanel.on('mouseup', this.onMouseUp.bind(this)).on('touchend', this.onMouseUp.bind(this));
        //     this.game.interactivePanel.on('mouseout', this.onMouseOutside.bind(this)).on('touchendoutside', this.onMouseOutside.bind(this));
        // }

        // document.addEventListener('keydown', (event) => {
        //     const tempKey = event.key;

        //     if (tempKey === 'Shift') {
        //         this.isShift = true;
        //     }
        // });

        // document.addEventListener('keyup', (event) => {
        //     const tempKey = event.key;

        //     if (tempKey === 'Shift') {
        //         this.isShift = false;
        //     }
        // });

        // this.isShift = false;

        // this.isDown = false;
        // this.isOverBall = false;
        // this.mousePos = {
        //     x: 0,
        //     y: 0
        // }
        // this.onShoot = new Signals();
        // this.onUpdateMouse = new Signals();
        // this.onMousePress = new Signals();
        // this.cancelShot = new Signals();

    }
    init(game) {
        this.game = game;
        // if (window.isMobile) {
        //     // window.App.headAxis.onStartDrag.add(()=>this.onMouseDown())
        //     // window.App.headAxis.onStopDrag.add(()=>this.onMouseUp())
        // } else {
        this.game.interactivePanel.interactive = true;
        this.game.interactivePanel.on('mousemove', this.onMouseMove.bind(this)).on('touchmove', this.onMouseMove.bind(this));
        this.game.interactivePanel.on('mousedown', this.onMouseDown.bind(this)).on('touchstart', this.onMouseDown.bind(this));
        this.game.interactivePanel.on('rightdown', this.onRightDown.bind(this));
        this.game.interactivePanel.on('mouseup', this.onMouseUp.bind(this)).on('touchend', this.onMouseUp.bind(this));
        this.game.interactivePanel.on('mouseout', this.onMouseOutside.bind(this)).on('touchendoutside', this.onMouseOutside.bind(this));
        // }

        document.addEventListener('keydown', (event) => {
            const tempKey = event.key;

            if (tempKey === 'Shift') {
                this.isShift = true;
            }
        });

        document.addEventListener('keyup', (event) => {
            const tempKey = event.key;

            if (tempKey === 'Shift') {
                this.isShift = false;
            }
        });
        this.powerDist = 0;
        this.isShift = false;
        this.canShoot = false;
        this.startPos = {
            x: 0,
            y: 0,
        };

        this.isDown = false;
        this.isOverBall = false;
        this.mousePos = {
            x: 0,
            y: 0,
        };
        this.onShoot = new Signals();
        this.onUpdateMouse = new Signals();
        this.onMousePress = new Signals();
        this.onMouseOutside = new Signals();
        this.cancelShot = new Signals();
        this.setTop = new Signals();
        this.startedHere = false;
        this.setCancel = false;
        this.isFreeCam = false;
    }
    testTouch(e) {
        return this.isDown; // window.App.axis.touchID != e.data.identifier;
    }
    onRightDown(e) {
        console.log('MouseRightDown');
    }
    onMouseDown(e) {
        if (this.testTouch(e)) {
            return;
        }

        this.mousePos.x = e.data.global.x;
        this.mousePos.y = e.data.global.y;
        this.onMousePress.dispatch(this.mousePos);
    }
    shootConfirmed() {
        this.isDown = true;
        this.startPos.x = this.mousePos.x;
        this.startPos.y = this.mousePos.y;
        this.startedHere = true;
        this.secondPoint = this.startPos;
        this.isFreeCam = false;
    }
    dragConfirmed() {
        this.isDown = true;
        this.startPos.x = this.mousePos.x;
        this.startPos.y = this.mousePos.y;
        this.isFreeCam = true;
    }
    onMouseUp(e) {
        this.mousePos.x = e.data.global.x;
        this.mousePos.y = e.data.global.y;
        if (this.startedHere) {
            this.onShoot.dispatch(this.mousePos);
            this.startedHere = false;
        }
        this.isDown = false;
        this.powerDist = 0;
        this.setCancel = false;
        this.isFreeCam = false;
    }
    onMouseOutside(e) {
        this.cancelShot.dispatch();
        this.isDown = false;
        this.isFreeCam = false;
        console.log('MouseOutside');
    }
    onMouseMove(e) {
        // return;
        // if (!this.testTouch(e)) {
        //     return;
        // }
        this.mousePos.x = e.data.global.x;
        this.mousePos.y = e.data.global.y;
        this.onUpdateMouse.dispatch(this.mousePos);

        // //////////////////////////////////////////Use distance to check if far enough away to check if up or down
        if (this.isDown && !this.setCancel) {
            const distance = utils.distance(this.mousePos.x, this.mousePos.y, this.startPos.x, this.startPos.y);

            if (distance > 50) {
                this.setCancel = true;
                (this.mousePos.y < this.startPos.y) ? this.setTop.dispatch(false): this.setTop.dispatch(true);
            }
        }

        (this.checkDistance()) ? this.canShoot = true: this.canShoot = false;
    }
    checkDistance() {
        const tempDist = Utils.distance(this.mousePos.x, this.mousePos.y, this.startPos.x, this.startPos.y);

        if (this.isDown) {
            this.powerDist = Utils.distance(this.mousePos.x, this.mousePos.y, this.startPos.x, this.startPos.y);
        }

        if (tempDist > 25) {
            return true;
        }
    }
    update() {

    }
}
export default new InGameInput();