import utils from "../../utils";

export default class DropCardRange extends PIXI.Container {
    constructor(game) {
        super();

        this.game = game
        this.canPlace = false;
    }
    build() {
        this.alpha = 0;
        this.zoneSprite = new PIXI.Sprite.fromFrame('enemyRadious.png');
        this.debugShape = new PIXI.Graphics().beginFill(0xFFFFFF).drawCircle(0, 0, this.zoneSprite.width / 2)
        this.zoneSprite.addChild(this.debugShape)
        this.debugShape.alpha = 0.1
        this.zoneSprite.anchor.set(0.5);
        this.zoneSprite.scale.set(10);
        this.addChild(this.zoneSprite);
        this.radius = this.zoneSprite.width / 2;

        this.point = {
            x: 0,
            y: 0
        }

        this.tempPoint = {
            x: this.getGlobalPosition().x,
            y: this.getGlobalPosition().y
        }

        this.graph = new PIXI.Graphics().lineStyle(5, 0x32E2D2).drawCircle(0, 0, 200);
        this.addChild(this.graph);
    }
    changeContactPoint(mousePos) {
        const dist = utils.distance(mousePos.x, mousePos.y, this.tempPoint.x, this.tempPoint.y)
        if (dist < 5) {
            return
        }
        const angle = utils.getAngle(this.tempPoint.x, this.tempPoint.y, mousePos.x, mousePos.y);
        this.point = {
            // x: (Math.cos(angle) * this.zoneSprite.width / 2) + mousePos.x,
            // y: (Math.sin(angle) * this.zoneSprite.width / 2) + mousePos.y,

            x: (Math.cos(angle) * this.zoneSprite.width / 2) + mousePos.x * this.parent.scale.x,
            y: (Math.sin(angle) * this.zoneSprite.width / 2) + mousePos.y * this.parent.scale.y,
        };


        this.tempPoint = {
            x: mousePos.x,
            y: mousePos.y
        }

        this.contactPoint = this.game.entityContainer.toLocal(mousePos);
        // this.graph.x = this.point.x;
        // this.graph.y = this.point.y;
        this.graph.x = this.contactPoint.x;
        this.graph.y = this.contactPoint.y;
        this.tooClose = false;
    }
    updateEntity(mousePos, entityContainer, clickZone) {
        const dropPos = entityContainer.toLocal(mousePos);
        this.x = dropPos.x;
        this.y = dropPos.y;
        this.alpha = 1
        this.changeContactPoint(mousePos);
        this.checkTargetDistance(clickZone);
    }
    checkCanPlace(data) {
        if (!this.tooClose) {
            (data.deadly || data.green) ? this.canBePlaced(false): this.canBePlaced(true);
        }
    }
    canBePlaced(canPlace) {
        if (!canPlace) {
            this.debugShape.tint = 0xFF0000;
            this.canPlace = false;
        } else {
            this.debugShape.tint = 0xFFFFFF
            this.canPlace = true;
        }
    }
    checkTargetDistance(target) {
        const distance = utils.distance(this.x, this.y, target.x, target.y);

        if (distance < (this.zoneSprite.width / 2) + (target.width / 2)) {
            this.canBePlaced(false);
            this.tooClose = true;
        } else {
            this.tooClose = false;
        }
    }
}