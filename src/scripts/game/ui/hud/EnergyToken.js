export default class EnergyBar extends PIXI.Container
{
    constructor()
    {
        super();
        this.fillTokenGrey = new PIXI.Sprite.from('energyFill0001.png');
        this.fillToken = new PIXI.Sprite.from('energyFill.png');
        this.frontToken = new PIXI.Sprite.from('energyFront.png');

        this.fillMask = new PIXI.Graphics().beginFill(0xFF0000).drawRect(0, 0, this.fillToken.width, this.fillToken.height);
        this.fillToken.addChild(this.fillMask);
        this.fillToken.mask = this.fillMask;
        this.addChild(this.fillTokenGrey);
        this.addChild(this.fillToken);
        this.addChild(this.frontToken);
    }
    updateToken(value)
    {
        this.fillMask.scale.x = value;
    }
}
