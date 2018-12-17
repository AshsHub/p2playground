import * as PIXI from 'pixi.js';
export default class Aim extends PIXI.Container {
    constructor() {
        super();
        this.dist = 0 //300;
        // this.aimShadow = new PIXI.Graphics().lineStyle(3, 0x000000).moveTo(0, 0);
        // this.aimShadow.lineTo(this.dist, 0);
        // this.addChild(this.aimShadow);
        // this.aimShadow.alpha = 0.1;

        // this.aim = new PIXI.Graphics().lineStyle(2, 0xFFFFFF).moveTo(0, 0);
        // this.aim.lineTo(200, 0);
        // this.aim.alpha = 0.5;
        // // this.aim.endFill();
        // this.addChild(this.aim);

        this.t = 25;
        this.velocity = 13500;

        this.sin = 0;
        this.sinAcc = 0.3;
        this.adj = 0;
        this.high = 0;
        this.fixedHigh = false;
        this.laserCurveAngle = 0; // Math.PI;

        this.shootHigh = 500;
        this.firstPoint = {
            x: 0,
            y: this.high,
        };

        this.firstPointShadow = {
            x: 0,
            y: 0,
        };

        this.aimBalls = [];
        this.aimBallsShadow = [];

        this.currentAngle = 0;
        this.currentPoints = [];
        this.currentPointsShadow = [];

        this.aim = new PIXI.Sprite.from('target.png');
        this.aim.scale.set(1200 / this.aim.height);
        this.aim.scale.y *= 0.5;
        this.aim.anchor.set(0.5);
        this.aim.alpha = 0.2;
        //this.center = new PIXI.Graphics().beginFill(0xFF00000).drawCircle(0, 0, 30)
        //this.addChild(this.center)
        this.shadows = new PIXI.Container();
        this.addChild(this.shadows);
        this.addChild(this.aim);
        for (let index = 1; index <= this.t; index++) {
            const targ = (this.dist / this.t) * index;
            const currentAng = Math.PI / this.t * index;
            const targY = (this.firstPoint.y / this.t) * (this.t - index) + Number(Math.sin(currentAng)) * -15;

            const pos = {
                x: Math.cos(0) * targ,
                y: Math.sin(0) * targ + targY,
            };

            this.currentPoints.push(pos);

            const posShadow = {
                x: Math.cos(0) * targ,
                y: Math.sin(0) * targ,
            };

            this.currentPointsShadow.push(posShadow);

            const dotShadow = new PIXI.Sprite.from('line.png');

            dotShadow.scale.set(150 / dotShadow.height);

            dotShadow.tint = 0;
            dotShadow.anchor.set(0.5);

            this.shadows.addChild(dotShadow);
            dotShadow.x = posShadow.x;
            dotShadow.y = posShadow.y;

            dotShadow.scale.y *= 0.5;

            dotShadow.alpha = 0.25;

            dotShadow.id = index;

            this.aimBallsShadow.push(dotShadow);

            const dot = new PIXI.Sprite.from('line.png');

            dot.scale.set(150 / dot.height);
            dot.anchor.set(0.5);

            this.addChild(dot);
            dot.x = pos.x;
            dot.y = pos.y;
            dot.alpha = 0.25;

            this.aimBalls.push(dot);

            dot.accAlpha = index % 2 ? 1 : 0;
            dotShadow.accAlpha = index % 2 ? 1 : 0;

            // if (dot.accAlpha)
            // {
            //     dot.alpha = 0;
            // }

            // if (dotShadow.accAlpha)
            // {
            //     dotShadow.alpha = 0;
            // }

            this.dist = 200;
        }

        this.aimBalls[this.aimBalls.length - 1].visible = false;
        this.dotsAcc = 0;
    }
    updatePoints(delta) {
        this.dotsAcc += delta * 60;
        this.dotsAcc %= this.aimBalls.length;
        this.dotsAcc = Math.max(1, this.dotsAcc);
        this.updateDots(delta, this.aimBallsShadow, this.targetPointsShadow, this.currentPointsShadow);

        this.updateDots(delta, this.aimBalls, this.targetPoints, this.currentPoints);
    }
    updateDots(delta, balls, targetPoints, currentPoints) {
        for (let index = 0; index < targetPoints.length; index++) {
            const element = targetPoints[index];
            let current = currentPoints[index];

            current = this.calcPoint(delta, current, element);
            currentPoints[index] = current;

            const ball = balls[index];

            if (element.dist > 0) {
                ball.scale.y = (element.dist / ball.texture.height);
            }
            ball.rotation = element.rotation;
            ball.x = current.x;
            ball.y = current.y;
        }
    }
    updateLine(graphic, targetPoints, currentPoints, first) {
        graphic.clear();
        graphic.lineStyle(3, 0x000000);
        graphic.moveTo(first.x, first.y);

        for (let index = 0; index < targetPoints.length; index++) {
            const element = targetPoints[index];
            let current = currentPoints[index];

            current = this.calcPoint(1 / 60, current, element);
            graphic.lineTo(current.x, current.y);
            currentPoints[index] = current;
        }
    }
    calcPoint(delta, current, element) {
        const axis = ['x', 'y'];

        const dist = utils.distance(current.x, current.y, element.x, element.y);
        const tempVel = this.velocity * (1 + dist / this.dist);

        for (let index = 0; index < axis.length; index++) {
            if (current[axis[index]] < element[axis[index]]) {
                current[axis[index]] += tempVel * delta;
                if (current[axis[index]] >= element[axis[index]]) {
                    current[axis[index]] = element[axis[index]];
                }
            } else if (current[axis[index]] > element[axis[index]]) {
                current[axis[index]] -= tempVel * delta;
                if (current[axis[index]] <= element[axis[index]]) {
                    current[axis[index]] = element[axis[index]];
                }
            }
        }

        return current;
    }
    updateLaser(sinAcc = 0.3, adj = 5, forceSin = null) {
        this.sinAcc = sinAcc;
        this.adj = adj;
        if (forceSin != null) {
            this.sin = forceSin;
        }
    }
    updateAngle(angle) {
        // this.aimShadow.rotation = angle;
        this.targetAngle = angle;

        this.currentAngle = this.targetAngle; // utils.lerp(this.targetAngle,this.currentAngle, 0.9)

        this.aim.x = Math.cos(this.currentAngle) * this.dist;
        this.aim.y = Math.sin(this.currentAngle) * this.dist;

        this.targetPoints = [];
        this.targetPointsShadow = [];

        this.sin += this.sinAcc;

        for (let index = 1; index <= this.t; index++) {
            const targ = (this.dist / this.t) * index;
            const currentAng = this.laserCurveAngle / this.t * index;
            let targY = this.high; // ((this.firstPoint.y / this.t) * (this.t - index)) + Number(Math.sin(currentAng)) * -15;

            if (!this.fixedHigh) {
                // console.log(index * this.t, index, this.t);

                const cos = Math.sin((index / this.t) * Math.PI);

                // console.log(cos);

                targY = cos * this.shootHigh; // ((this.firstPoint.y / this.t) * (this.t - index)) + Number(Math.sin(currentAng)) * -150;
            }

            const targetPoint = {
                rotation: angle,
                dist: 0,
                x: Math.cos(angle) * targ,
                y: Math.sin(angle) * targ - targY,
            };

            targetPoint.y += Math.cos(this.sin + 0.5 * index) * this.adj;

            this.targetPoints.push(targetPoint);

            const targetPointShadow = {
                rotation: angle + Math.PI / 2,
                dist: 0,
                x: Math.cos(angle) * targ,
                y: Math.sin(angle) * targ,
            };

            targetPointShadow.y += Math.cos(this.sin + 0.5 * index) * this.adj;

            this.targetPointsShadow.push(targetPointShadow);
        }

        for (let index = 0; index < this.targetPoints.length - 1; index++) {
            const element = this.targetPoints[index];
            const elementN = this.targetPoints[index + 1];

            element.rotation = Math.atan2(element.y - elementN.y, element.x - elementN.x) + Math.PI / 2;
            element.dist = utils.distance(element.x, element.y, elementN.x, elementN.y);
            // console.log(element.dist);
        }
        // this.sin %= Math.PI / 2;

        // this.children.sort(utils.depthCompare);
        this.updatePoints(1);
    }
}