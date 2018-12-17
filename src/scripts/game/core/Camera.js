export default class Camera {
    constructor(cameraVel = 200, gameContainer, game) {
        this.game = game;
        this.gameContainer = gameContainer;
        this.cameraVel = cameraVel;

        const mousewheelevt = (/Firefox/i.test(navigator.userAgent)) ? 'DOMMouseScroll' : 'mousewheel';

        this.currentZoom = Number(window.GAME_SCALES);
        if (document.attachEvent) {
            document.attachEvent(`on${mousewheelevt}`, this.onWheelManager.bind(this));
        } else if (document.addEventListener) {
            document.addEventListener(mousewheelevt, this.onWheelManager.bind(this), false);
        }
        this.angularSpeed = 200;
        this.freeCamSpeed = 0.001;
        this.cameraData = {
            min: 0.5,
            max: 1.5
        };

        this.freeCamDropPos = {
            x: 0,
            y: 0
        }

        this.calcZoom(this.cameraData.min);
    }
    calcZoom(value) {
        const diff = this.cameraData.max - this.cameraData.min;

        this.currentZoom = this.cameraData.min + diff * value;
    }
    update(delta, entity, target, center) {
        // return;

        const futurePoint = {
            x: entity.x + target.x,
            y: entity.y + target.y,
        };
        const mX = 0;
        const nx = 0.75;
        const ny = 0.725;
        // if (entity.velocity.x > 0)
        // {
        //     mX = Math.min(entity.velocity.x * nx, entity.radius * ny);
        // }
        // else
        // {
        //     mX = Math.max(entity.velocity.x * nx, -entity.radius * ny);
        // }
        // futurePoint.x += mX;

        // let mY = 0;

        // if (entity.velocity.y > 0)
        // {
        //     mY = Math.min(entity.velocity.y * nx, entity.radius * nx);
        // }
        // else
        // {
        //     mY = Math.max(entity.velocity.y * nx, -entity.radius * nx);
        // }
        // futurePoint.y += mY;
        // console.log(entity.directionAngle * 180 / 3.14);

        const timescale = ((delta * 60) / 60);
        const lerpSpeed = 0.9; // 0.5//0.19999//(1 - delta) * 0.99;
        // const lerpSpeed = 0.02; // 0.5//0.19999//(1 - delta) * 0.99;

        // if (Math.abs(entity.velocity.x) + Math.abs(entity.velocity.y) > 0.2)
        // {
        //     // this.gameContainer.rotation = this.lerp((Math.cos(entity.directionAngle)) * 0.01, this.gameContainer.rotation, 0.95);
        //     this.gameContainer.rotation = this.lerp((Math.cos(entity.directionAngle)) * 0.015, this.gameContainer.rotation, lerpSpeed);
        // }
        // else
        // {
        //     this.gameContainer.rotation = this.lerp(0, this.gameContainer.rotation, 0.95);
        // }

        // console.log(timescale);

        // this.gameContainer.pivot.x = this.lerp(futurePoint.x, this.gameContainer.pivot.x, 0.95 * timescale);
        // this.gameContainer.pivot.y = this.lerp(futurePoint.y, this.gameContainer.pivot.y, 0.95 * timescale);
        // console.log(futurePoint.x, this.gameContainer.pivot.x);

        this.gameContainer.pivot.x = this.lerp(futurePoint.x, this.gameContainer.pivot.x, lerpSpeed);
        this.gameContainer.pivot.y = this.lerp(futurePoint.y, this.gameContainer.pivot.y, lerpSpeed);

        this.gameContainer.x = center.x;
        this.gameContainer.y = center.y; // + GameData.tileSize * 0.25;
    }
    lerp(v0, v1, t) {
        return v0 * (1 - t) + v1 * t;
    }

    forcePosition(entity, target) {
        this.gameContainer.pivot.x = entity.x;
        this.gameContainer.pivot.y = entity.y;

        this.gameContainer.x = target.x;
        this.gameContainer.y = target.y;
    }
    onWheelManager(e) {
        const evt = window.event || e;
        const delta = evt.detail ? evt.detail : evt.wheelDelta;
        const wheelForce = (delta / 120) / 8;

        this.currentZoom += Math.min(wheelForce, 0.1);
        this.updateZoom();
    }
    updateZoom(time = 0.75, ease = Cubic.easeOut) {
        // return;
        TweenLite.killTweensOf(this.gameContainer.scale);
        this.currentZoom = Math.max(this.currentZoom, this.cameraData.min) * window.GAME_SCALES;
        this.currentZoom = Math.min(this.currentZoom, this.cameraData.max) * window.GAME_SCALES;
        TweenLite.to(this.gameContainer.scale, time, {
            x: this.currentZoom,
            y: this.currentZoom,
            ease
        });
    }
}