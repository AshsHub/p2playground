import SAT from 'sat';

export default class Environment extends PIXI.Container {
    constructor() {
        super();
        this.type = 'HARD';
        this.isHazardous = false;

        this.baseColors = [0x8E804C, 0x8E6A24, 0x7A5B1F, 0x916F2F];

        this.graph = new PIXI.Graphics();
        this.addChild(this.graph);

        this.clockwisePolygon = [];
    }
    build(points, envData, debug = false) {
        this.clockwisePolygon = [];

        // points = points.reverse()
        points.forEach((element) => {
            this.clockwisePolygon.push(new SAT.Vector(element.x, element.y));
        });

        this.clockwisePolygon = this.setClockwise(this.clockwisePolygon);
        let cl = envData.color;

        if (envData.type == 'ISLANDSIDE') {
            cl = this.baseColors[Math.floor(Math.random() * this.baseColors.length)];
        }

        if (!envData.ignoreCollider) {
            this.poly = new SAT.Polygon(new SAT.Vector(), this.clockwisePolygon);
        }
        // let graph = new PIXI.Graphics().lineStyle(2, 0xFF0000)
        // console.log(envData);
        this.graph.clear();
        this.graph.beginFill(cl);

        // graph.lineStyle(20, 0)
        this.graph.moveTo(this.clockwisePolygon[0].x, this.clockwisePolygon[0].y);
        for (let index = 1; index < this.clockwisePolygon.length; index++) {
            const element = this.clockwisePolygon[index];

            this.graph.lineTo(element.x, element.y);
        }

        this.graph.endFill();
        this.ignoreCollision = envData.ignoreCollider;
        // graph.lineTo(this.poly.points[0].x, this.poly.points[0].y)
        this.data = envData;
    }
    setClockwise(points) {
        points.sort((a, b) => b.y - a.y);
        const cy = (points[0].y + points[points.length - 1].y) / 2;
        // Sort from right to left

        points.sort((a, b) => b.x - a.x);

        // Get center x
        const cx = (points[0].x + points[points.length - 1].x) / 2;

        // Center point
        const center = {
            x: cx,
            y: cy,
        };

        let startAng;

        points.forEach((point) => {
            let ang = Math.atan2(point.y - center.y, point.x - center.x);

            if (!startAng) {
                startAng = ang;
            } else
            if (ang < startAng) { // ensure that all triangleTess are clockwise of the start point
                ang += Math.PI * 2;
            }
            point.angle = ang; // add the angle to the point
        });

        // first sort clockwise
        points.sort((a, b) => a.angle - b.angle);

        return points;
    }
    calcArea(poly) {
        if (!poly || poly.length < 3) return null;
        const end = poly.length - 1;
        let sum = poly[end].x * poly[0].y - poly[0].x * poly[end].y;

        for (let i = 0; i < end; ++i) {
            const n = i + 1;

            sum += poly[i].x * poly[n].y - poly[n].x * poly[i].y;
        }

        return sum;
    }

    isClockwise(poly) {
        return this.calcArea(poly) > 0;
    }
}