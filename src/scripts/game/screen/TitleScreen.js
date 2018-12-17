import Screen from '../../screenManager/Screen';
import UILabelButton from '../ui/UILabelButton';

export default class TitleScreen extends Screen
{
    constructor(label)
    {
        super(label);
        const bg = new PIXI.Graphics().beginFill(0x543246).drawRect(0, 0, 1800, 1800);

        this.addChild(bg);
        this.playGameButton = new UILabelButton('ENTER DREAM', 0.5, {
            customBackTex: 'energyFill.png',
            customBackTexOn: 'energyFill0001.png',
        });
        this.playGameButton.onMouseUp.add(() =>
        {
            this.screenManager.change('Game');
        });
        this.addChild(this.playGameButton);
    }
    build()
    {
    }
    update(delta)
    {

    }
    resize(resolution, innerResolution)
    {
        super.resize(resolution, innerResolution);

        this.playGameButton.scale.set(innerResolution.width * 0.2 / this.playGameButton.width * this.playGameButton.scale.x);
        this.playGameButton.x = innerResolution.width / 2 - (this.playGameButton.width) * 0.5;
        this.playGameButton.y = innerResolution.height / 2;
    }
}
