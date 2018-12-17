import Collisions from '../core/Collisions';
import InGameInput from '../input/InGameInput';
import Utils from '../../utils';
import EntityBuilder from './EntityBuilder';
import p2 from 'p2';
import PlayerEntity from './PlayerEntity'
import utils from '../../utils';

export default class EntityManager {
    constructor(game) {
        this.game = game;
        this.entityContainer = game.entityContainer;
        this.onContact = false;
        this.onMouseDown = false;
        this.clickTime = 0;
        this.xLimit = 40;

        InGameInput.onMousePress.add((pos) => {
            console.log("Click")
            this.onMouseDown = true;
        });
        InGameInput.onMouseRelease.add(() => {
            console.log("Up")
            this.onMouseDown = false;
            this.clickTime = 0;
        });
    }
    build() {
        this.world = new p2.World({
            gravity: [0, 90.82]
        });
        this.world.defaultContactMaterial.restitution = 0.5;

        this.playerEntity = new PlayerEntity();
        this.playerEntity.build(this.entityContainer, this.world);

        this.groundBody = new p2.Body({
            mass: 0,
            angle: Math.PI * 0.95
        })

        const groundShape = new p2.Box({
            width: 500,
            height: 25,
        });

        this.groundBody.addShape(groundShape);
        this.floorGraph = new PIXI.Graphics().beginFill(0x32E2D2).drawRect(this.groundBody.position[0] - groundShape.width / 2, this.groundBody.position[1] - groundShape.height / 2, groundShape.width, groundShape.height);
        this.entityContainer.addChild(this.floorGraph);
        this.floorGraph.rotation = this.groundBody.angle;
        this.world.addBody(this.groundBody)
        console.log(this.playerEntity)
        //console.log(groundBody.position)
    }
    update(delta) {
        const fixedDelta = delta;

        this.world.step(1 / 60, fixedDelta, 10);
        //console.log(this.playerEntity.position)

        this.playerEntity.update();

        if (this.onMouseDown) {
            this.playerEntity.playerBody.velocity[1] -= 3;
            this.playerEntity.playerBody.velocity[0] -= this.clickTime;

            this.clickTime = Math.min(this.clickTime += fixedDelta, 1.5);
            this.playerEntity.playerBody.velocity[0] = Math.max(this.playerEntity.playerBody.velocity[0], -100);
            // console.log(this.clickTime)
        } else {
            //this.playerEntity.playerBody.velocity[1] += 9.82 * 0.5;
            if (this.playerEntity.playerBody.velocity[0] != 0) {
                const sign = Math.sign(this.playerEntity.playerBody.velocity[0]);
                this.playerEntity.playerBody.velocity[0] = utils.lerp(this.playerEntity.playerBody.velocity[0], this.xLimit * sign, fixedDelta);

                // if (this.playerEntity.playerBody.velocity[0] < this.xLimit && this.playerEntity.playerBody.velocity[0] > -this.xLimit) {
                //     this.playerEntity.playerBody.velocity[0] = this.xLimit * sign;
                // }
            }
        }

        console.log(this.playerEntity.playerBody.velocity[0])

        this.world.on("beginContact", function (evt) {
            // debugger
            if (!this.onContact) {
                //evt.bodyB.velocity[1] *= -0.5;
                this.onContact = true;
                console.log("contact", evt)
            }
        });

        this.world.on("endContact", function (evt) {
            if (this.onContact) {
                this.onContact = false;
                console.log("NOcontact")
            }
        });

        // console.log(this.playerEntity.playerBody.velocity[0])
    }
    reset() {

    }
}