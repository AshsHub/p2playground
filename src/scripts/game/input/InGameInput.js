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

        this.startPos = {
            x: 0,
            y: 0,
        };

        this.isDown = false;
        this.mousePos = {
            x: 0,
            y: 0,
        };
        this.onMousePress = new Signals();
        this.onMouseRelease = new Signals();
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
        this.isDown = true;
        this.startPos.x = this.mousePos.x;
        this.startPos.y = this.mousePos.y;
    }
    onMouseUp(e) {
        this.mousePos.x = e.data.global.x;
        this.mousePos.y = e.data.global.y;
        this.isDown = false;
        this.onMouseRelease.dispatch();
    }
    onMouseOutside(e) {
        //this.cancelShot.dispatch();
        this.isDown = false;
        console.log('MouseOutside');
    }
    onMouseMove(e) {
        // return;
        // if (!this.testTouch(e)) {
        //     return;
        // }
    }
    update() {

    }
}
export default new InGameInput();