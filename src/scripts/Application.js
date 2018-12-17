import * as PIXI from 'pixi.js';
import ScreenManager from './screenManager/ScreenManager';
export default class Application {
    constructor() {
        this.loader = new PIXI.Loader();
        this.appStage = new PIXI.Container();

        document.addEventListener('webkitfullscreenchange', (event) => {
            window.isFullScreen = false;
            if (document.webkitFullscreenElement !== null) {
                window.isFullScreen = true;
            }
        });
        document.addEventListener('fullscreenchange', (event) => {
            window.isFullScreen = false;
            if (document.fullscreenElement !== null) {
                window.isFullScreen = true;
            }
        });

        window.iOS = !!navigator.platform && (/iPad|iPhone|iPod/).test(navigator.platform);
        window.isMobile = navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i);

        this.resolution = {
            x: 0,
            y: 0,
            width: 10,
            height: 10,
        };

        this.innerResolution = {
            x: 0,
            y: 0,
            width: 10,
            height: 10,
        };

        this.desktopResolution = {
            width: 750,
            height: 1334,
        };

        this.hScale = 1;

        if (window.isMobile) {
            this.resolution.width = window.innerWidth;
            this.resolution.height = window.innerHeight;
        } else {
            this.resolution.width = this.desktopResolution.width;
            this.resolution.height = this.desktopResolution.height;
        }
    }
    addScreenManager() {
        this.screenManager = new ScreenManager();
    }
    addManifest(manifest) {
        this.loader.add(manifest);
    }
    load() {
        this.loader.load(() => {
            this.onCompleteLoad();
        });
        this.loader.onProgress.add((progress) => {
            this.onProgress(progress);
        });
    }
    onProgress(progress) {
        // console.log(progress.progress);
    }
    onCompleteLoad() {
        this.updateRes();
        this.app = new PIXI.Application(this.resolution.width, this.resolution.height, {
            resolution: Math.min(window.devicePixelRatio, 2),
            autoResize: true,
            backgroundColor: 0xFFFFFF,
        });
        this.app.stage.addChild(this.appStage);
        this.renderer = this.app.renderer;
        document.body.appendChild(this.app.renderer.view);
        this.disableContextMenu(this.app.renderer.view);
        document.body.style.margin = 0;
        this.buildApplication();
    }
    buildApplication() {
        if (this.builded) {
            console.log('Trying to build more than once');

            return;
        }
        this.builded = true;
        this.resize();
        this.addScreenManager();
        this.appStage.addChild(this.screenManager);
        this.buildScreens();
        this.fixedFPS = 60;
        this.timestep = 1 / this.fixedFPS;

        this.fixedDelta = 0;
        this.lastFrameTimeMs = 0;

        let numUpdateSteps = 0;

        // this.app.ticker.add((evt) =>
        // {
        //     numUpdateSteps = 0;
        //     const timestamp = evt / this.fixedFPS;

        //     this.fixedDelta += timestamp - this.lastFrameTimeMs; // note += here
        //     // this.lastFrameTimeMs = timestamp;

        //     // console.log(this.fixedDelta, this.timestep, timestamp);

        //     // while (this.fixedDelta >= this.timestep)
        //     // {
        //     //     // console.log('FIXED');

        //     //     this.fixedUpdate(this.timestep);
        //     //     this.fixedDelta -= this.timestep;

        //     //     if (++numUpdateSteps >= 240)
        //     //     {
        //     //         console.log('PANIC');

        //     //         break; // bail out
        //     //     }

        //     //     // break;
        //     // }
        //     // console.log('NORMAL');
        //     // this.fixedUpdate(this.timestep);
        //     this.update(this.timestep);
        //     // this.update(timestamp);
        // });
        this.app.ticker.add((evt) => {
            this.update(evt / 60);
        });
        this.resize();
    }
    fixedUpdate(fixedDelta) {
        // console.log('fixed delta', fixedDelta);
        this.screenManager.fixedUpdate(fixedDelta);
    }
    update(delta) {
        this.fixedUpdate(delta);
        this.screenManager.update(delta);
    }
    resize() {
        if (!isMobile) {
            const sclX = window.innerWidth < this.desktopResolution.width ? window.innerWidth / this.desktopResolution.width : 1;
            const sclY = window.innerHeight < this.desktopResolution.height ? window.innerHeight / this.desktopResolution.height : 1;

            const scl = Math.min(sclX, sclY);

            this.renderer.view.style.position = 'absolute';

            const newSize = {
                width: this.desktopResolution.width * scl,
                height: this.desktopResolution.height * scl,
            };

            // console.log(newSize);

            this.renderer.view.style.width = `${newSize.width}px`;
            this.renderer.view.style.height = `${newSize.height}px`;

            if (newSize.height < window.innerHeight) {
                this.renderer.view.style.top = `${window.innerHeight / 2 - (newSize.height) / 2}px`;
            }
            if (newSize.width < window.innerWidth) {
                this.renderer.view.style.left = `${window.innerWidth / 2 - (newSize.width) / 2}px`;
            }

            this.resolution.width = this.desktopResolution.width;
            this.resolution.height = this.desktopResolution.height;

            this.innerResolution.width = this.desktopResolution.width;
            this.innerResolution.height = this.desktopResolution.height;

            if (this.screenManager) {
                this.screenManager.resize(this.resolution, this.innerResolution);
            }

            return;
        }

        this.updateRes();

        let deg = 0;
        let w = this.resolution.width;
        let h = this.resolution.height;
        let posX = (w - h) / 2;
        let posY = (w - h) / 2;
        const land = window.innerWidth > window.innerHeight;

        if (land) {
            const hNormal = w / window.screen.height;
            // let hNormal = w / window.screen.height;

            w = this.resolution.height;
            h = this.resolution.width;

            if (window.screen.width > window.screen.height) {
                posX = window.screen.width / 2 - h / 2; //* hNormal
                // alert(window.screen.height+' - '+ w)
                posY = window.innerHeight - window.screen.height;
            } else {
                posX = window.screen.width / 2 - w / 2; // window.screen.height / 2 - w / 2; //* hNormal
                // alert(window.screen.height+' - '+ w)
                posY = window.innerHeight - window.screen.width;
            }

            window.is90degree = false;
        } else {
            posX = this.innerResolution.x;
            posY = 0;
            // window.is90degree = true;
            deg = window.is90degree ? 90 : 0;

            if (window.isFullScreen) {
                // posX = (w - h) / 2;
                // posY = (w - h) / 2;
            }
        }
        this.renderer.view.style.webkitTransform = `rotate(${deg}deg) translate(${posX}px,${posY}px)`;
        this.renderer.view.style.mozTransform = `rotate(${deg}deg) translate(${posX}px,${posY}px)`;
        this.renderer.view.style.msTransform = `rotate(${deg}deg) translate(${posX}px,${posY}px)`;
        this.renderer.view.style.oTransform = `rotate(${deg}deg) translate(${posX}px,${posY}px)`;
        this.renderer.view.style.transform = `rotate(${deg}deg) translate(${posX}px,${posY}px)`;
        // alert('resize')
        if (this.screenManager) {
            this.screenManager.resize(this.resolution, this.innerResolution);
        }
    }

    updateRes() {
        let size;
        let innerSize;

        if (isMobile) {
            size = {
                width: window.screen.width,
                height: window.screen.height
            };

            innerSize = {
                width: window.innerWidth,
                height: window.innerHeight
            };

            // if (this.desktopResolution.width < this.desktopResolution.height)
            // {
            //     size = { height: window.screen.width, width: window.screen.height };
            //     innerSize = { height: window.innerWidth, width: window.innerHeight };

            //     console.log(size);
            //     console.log(size);
            //     console.log(size);
            //     console.log(size);
            // }
        } else {
            size = this.desktopResolution;
            innerSize = this.desktopResolution;
        }

        if (this.desktopResolution.width < this.desktopResolution.height) {
            // this.resolution.width = size.height;
            // this.resolution.height = size.width;
            this.resolution.width = size.width;
            this.resolution.height = size.height;
        } else {
            this.resolution.width = size.width;
            this.resolution.height = size.height;
        }

        if (this.desktopResolution.width < this.desktopResolution.height) {
            // this.innerResolution.width = innerSize.height;
            // this.innerResolution.height = innerSize.width;

            this.innerResolution.width = innerSize.width;
            this.innerResolution.height = innerSize.height;

            // this.innerResolution.x = this.resolution.width - this.innerResolution.width
        } else {
            this.innerResolution.width = innerSize.width;
            this.innerResolution.height = innerSize.height;
        }

        if (this.desktopResolution.width < this.desktopResolution.height) {
            // let temp = this.resolution.width;

            // this.resolution.width = this.resolution.height;
            // this.resolution.height = temp;

            // temp = this.innerResolution.width;
            // this.innerResolution.width = this.innerResolution.height;
            // this.innerResolution.height = temp;
        }
        // alert(`${this.resolution.width} - ${this.resolution.height}` + `\n${this.innerResolution.width} - ${this.innerResolution.height}`);
        this.innerResolution.x = this.resolution.width - this.innerResolution.width;
        this.innerResolution.y = this.resolution.height - this.innerResolution.height;

        // this.hScale = 1;
    }
    getRealCenter() {
        return {
            x: this.innerResolution.x + this.innerResolution.width / 2,
            y: this.innerResolution.y + this.innerResolution.height / 2,
        };
    }

    manageFullscreen() {
        return;
        if (document.body.mozRequestFullScreen) {
            // This is how to go into fullscren mode in Firefox
            // Note the "moz" prefix, which is short for Mozilla.
            document.body.mozRequestFullScreen();
        } else if (document.body.webkitRequestFullScreen) {
            // This is how to go into fullscreen mode in Chrome and Safari
            // Both of those browsers are based on the Webkit project, hence the same prefix.
            document.body.webkitRequestFullScreen();
        }
    }
    disableContextMenu(canvas) {
        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    unPause() {
        if (this.screenManager) {
            this.screenManager.timeScale = 1;
        }
        // SOUND_MANAGER.unmute();
    }

    pause() {
        if (this.screenManager) {
            this.screenManager.timeScale = 0;
        }

        // SOUND_MANAGER.mute();
    }
}