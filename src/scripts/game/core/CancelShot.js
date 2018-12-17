export default class CancelShot extends PIXI.Container
{
    constructor()
    {
        super();
        this.build();
    }
    build()
    {
        this.cancelZoneContainer = new PIXI.Container();
        this.cancelZoneContainer.tint = 0xFFFFFF;
        this.addChild(this.cancelZoneContainer);

        this.cancelZone = new PIXI.Sprite.fromFrame('cancelButton.png');
        this.cancelZoneContainer.addChild(this.cancelZone);
        this.cancelZone.anchor.set(0.5);
        this.cancelZone.scale.set(0.75);
        this.reset();
    }
    isOver()
    {
        this.cancelZone.alpha = 1;
    }
    isNotOver()
    {
        this.cancelZone.alpha = 0.5;
    }
    reset()
    {
        this.cancelZone.alpha = 0;
    }
}
