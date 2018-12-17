import p2 from 'p2'
export default class PlayerEntity extends PIXI.Container {
    constructor() {
        super();
        this.playerRadius = 10
        this.entityContainer;
    }
    build(entityContainer, world) {
        this.entityContainer = entityContainer;

        this.playerBody = new p2.Body({
            mass: 0.5,
            position: [250, -200],
            // type: p2.Body.KINEMATIC,
        });


        const circleShape = new p2.Circle({
            radius: this.playerRadius
        });

        this.playerGraph = new PIXI.Graphics().beginFill(0x32E2D2).drawCircle(0, 0, this.playerRadius);
        this.entityContainer.addChild(this.playerGraph);
        this.playerBody.addShape(circleShape);
        world.addBody(this.playerBody);
    }
    update() {
        this.playerGraph.x = this.playerBody.interpolatedPosition[0];
        this.playerGraph.y = this.playerBody.interpolatedPosition[1];
    }
}