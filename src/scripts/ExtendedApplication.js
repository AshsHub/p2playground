import Application from './Application';
import GameScreen from './game/screen/GameScreen';
import KeyboardAxisInput from './game/input/KeyboardAxisInput';
import TouchAxisInput from './game/input/TouchAxisInput';
import TitleScreen from './game/screen/TitleScreen';
export default class ExtendedApplication extends Application
{
    constructor()
    {
        super();
    }
    hideInputs()
    {
        if (window.isMobile)
        {
            this.axis.visible = false;
            this.headAxis.visible = false;
        }
    }
    showInputs()
    {
        if (window.isMobile)
        {
            this.axis.visible = true;
            this.headAxis.visible = true;
        }
    }
    buildScreens()
    {
        const gameScreen = new GameScreen('Game');
        const titleScreen = new TitleScreen('Title');

        this.screenManager.addScreen(gameScreen);
        this.screenManager.addScreen(titleScreen);
        this.screenManager.forceChange('Title');
        if (!window.isMobile)
        {
            this.axis = new KeyboardAxisInput();
        }
        else
        {
            this.axis = new TouchAxisInput();
            this.screenManager.addChild(this.axis);
            this.axis.x = 100;
            this.axis.y = this.resolution.height - 100;

            this.headAxis = new TouchAxisInput();
            this.screenManager.addChild(this.headAxis);
            this.headAxis.x = this.resolution.width - 100;
            this.headAxis.y = this.resolution.height - 100;
            // if (!window.iOS)
            if (false)
            {
                this.fullScreenShape = new PIXI.Graphics();
                this.fullScreenShape.beginFill(0xff0000).drawRect(0, 0, this.resolution.width, this.resolution.height);
                this.appStage.addChild(this.fullScreenShape);
                this.fullScreenShape.interactive = true;
                this.fullScreenShape.alpha = 0;
                this.fullScreenShape.on('click', this.manageFullscreen.bind(this)).on('tap', this.manageFullscreen.bind(this));
            }
            this.hideInputs();
        }
    }
    manageFullscreen()
    {
        this.fullScreenShape.visible = false;

        // return;
        super.manageFullscreen();
    }
    update(delta)
    {
        super.update(delta);
        this.axis.update();
    }
    resize()
    {
        super.resize();
        if (window.isMobile && this.axis)
        {
            const axisDis = 120;

            this.axis.x = this.innerResolution.x + axisDis;
            this.axis.y = this.innerResolution.y + this.innerResolution.height - axisDis * 0.85;

            this.headAxis.x = this.innerResolution.x + this.innerResolution.width - axisDis;
            this.headAxis.y = this.innerResolution.y + this.innerResolution.height - axisDis * 0.85;
        }
    }
    unPause()
    {
        super.unPause();
        // SOUND_MANAGER.unmute();
        if (this.axis)
        {
            this.axis.reset();
        }
        if (this.headAxis)
        {
            this.headAxis.reset();
        }
    }

    pause()
    {
        super.pause();
        if (this.axis)
        {
            this.axis.reset();
        }
        if (this.headAxis)
        {
            this.headAxis.reset();
        }
    }
}
