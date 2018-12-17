import UIList from '../UIList';
import EnergyToken from './EnergyToken';

export default class EnergyBar extends PIXI.Container
{
    constructor()
    {
        super();
        this.build();
        this.maxWidth = window.App.desktopResolution.width;
        this.max;
    }

    build()
    {
        this.backShape = new PIXI.Sprite.from('backEnergy.png');
        this.addChild(this.backShape);

        this.backEnergyShape = new PIXI.Sprite.from('currentEnergyPanel.png');

        this.backShape.addChild(this.backEnergyShape);
        this.backEnergyShape.x = this.backShape / 2;
        this.backEnergyShape.y = -this.backEnergyShape.height;

        this.barGb = new PIXI.Graphics().beginFill(0x000000).drawRect(0, -4, window.App.desktopResolution.width, 38);
        // this.addChild(this.barGb);
        this.bar = new PIXI.Graphics().beginFill(0x256ae3).drawRect(0, 0, window.App.desktopResolution.width, 30);
        // this.addChild(this.bar);

        this.labelTokenList = new UIList();
        this.labelTokenList.w = this.backEnergyShape.width;
        this.labelTokenList.h = this.backEnergyShape.height;
        this.backEnergyShape.addChild(this.labelTokenList);

        this.smallToken = new PIXI.Sprite.from('energyToken0002.png');
        this.labelTokenList.addElement(this.smallToken);

        this.text = new PIXI.Text('00');
        this.text.x = 15;
        this.text.y = 15;
        this.text.style.fontFamily = 'feastofflesh';
        this.text.style.fontSize = 17;
        this.text.style.stroke = 0;
        this.text.style.strokeThickness = 2;
        this.text.style.fill = 0xFFFFFF;
        this.text.scale.set(2);
        this.labelTokenList.addElement(this.text);

        this.labelTokenList.updateHorizontalList();

        this.energyList = new UIList();
        this.energyList.w = this.backShape.width * 0.74;
        this.energyList.h = this.backShape.height;

        this.tokens = [];

        for (let index = 0; index < 10; index++)
        {
            const energyToken = new EnergyToken();

            energyToken.fitWidth = 0.9;
            energyToken.updateToken(0);
            this.tokens.push(energyToken);
            this.energyList.addElement(energyToken);
        }
        this.energyList.addBackground(0, 0);
        this.energyList.updateHorizontalList();

        this.backShape.addChild(this.energyList);
        this.energyList.x = this.backShape.width * 0.13;
        // this.energyList.y = this.backShape.height;
    }
    update()
    {
    }
    setWidth(current)
    {
        // console.log(current);

        for (let index = 0; index < this.tokens.length; index++)
        {
            const element = this.tokens[index];

            if (index < current)
            {
                element.updateToken(1);
            }
 else
{
                element.updateToken(0);
            }
        }

        this.bar.width = (this.maxWidth / this.max) * current;
        this.text.text = current;// `${current}/${this.max}`;
    }
    resize(innerResolution)
    {
        this.backShape.scale.set(innerResolution.width / this.backShape.width);

        this.backEnergyShape.x = 10;// this.backEnergyShape.width;
        this.backEnergyShape.y = 10;// - this.backEnergyShape.height;
    }
}
