import * as PIXI from 'pixi.js';

export default class ScreenManager extends PIXI.Container {
    constructor() {
        super();
        this.prevScreen = null;
        this.currentScreen = null;
        this.screenList = [];
        this.screensContainer = new PIXI.Container();
        this.addChild(this.screensContainer);
        this.timeScale = 1;
        this.resolution = {
            width: 10,
            height: 10
        };
    }
    addScreen(screen) {
        this.screenList.push(screen);
        this.currentScreen = screen;
        screen.screenManager = this;
        if (screen.onAdded) {
            screen.onAdded();
        }
    }
    backScreen() {
        this.change(this.prevScreen);
    }
    change(screenLabel, param) {
        this.removeCurrentScreen();
        let tempScreen;

        for (let i = 0; i < this.screenList.length; i++) {
            if (this.screenList[i].label == screenLabel) {
                tempScreen = this.screenList[i];
            }
        }
        if (this.currentScreen) {
            this.currentScreen.transitionOut(tempScreen, param);
            this.screensContainer.addChild(this.currentScreen);
            this.currentScreen.resize(this.resolution, this.innerResolution);
        }
    }
    removeCurrentScreen() {
        if (this.currentScreen && this.currentScreen.parent) {

            this.screensContainer.removeChild(this.currentScreen);
            this.prevScreen = this.currentScreen.label;
        }
    }
    // change between screens
    forceChange(screenLabel, param) {
        this.removeCurrentScreen();
        let tempScreen;

        for (let i = 0; i < this.screenList.length; i++) {
            if (this.screenList[i].label == screenLabel) {
                tempScreen = this.screenList[i];
            }
        }
        this.currentScreen = tempScreen;
        this.currentScreen.build(param);
        this.currentScreen.transitionIn();
        // this.currentScreen.resize(this.resolution, this.innerResolution);

        this.screensContainer.addChild(this.currentScreen);
    }
    resize(resolution, innerResolution) {
        this.resolution = resolution;
        this.innerResolution = innerResolution;
        if (this.screenList.length) {
            this.currentScreen.resize(this.resolution, this.innerResolution);
        }
    }
    fixedUpdate(fixedDelta) {
        if (this.screenList.length && this.currentScreen.fixedUpdate) {
            this.currentScreen.fixedUpdate(fixedDelta * this.timeScale);
        }
    }
    // update manager
    update(delta) {
        if (this.screenList.length) {
            this.currentScreen.update(delta * this.timeScale);
        }
    }
}