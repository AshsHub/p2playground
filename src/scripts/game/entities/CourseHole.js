import Entity from '../../game/entities/Entity';
import Fortress from './Fortress';

export default class CourseHole extends Entity {
    constructor(game) {
        super();
        this.game = game;
        this.radius = 50;
        this.team;
        this.data;
    }

    build() {
        this.hole = new PIXI.Sprite.fromFrame('cat_coin_particle.png');
        this.hole.tint = 0;
        this.hole.anchor.set(0.5);
        this.hole.scale.set(this.radius / this.hole.width * 3);
        this.hole.scale.y = this.hole.scale.x * 0.5;
        this.addChild(this.hole);
        this.fort = new Fortress();
        this.parent.addChild(this.fort);
        this.fort.build(this.x, this.y + 10);
    }
    setPosition(newPos) {
        this.x = newPos.x;
        this.y = newPos.y;

        this.fort.x = newPos.x;
        this.fort.y = newPos.y;
        this.fort.circleCollider.pos.x = newPos.x;
        this.fort.circleCollider.pos.y = newPos.y;
    }
}