import SAT from 'sat';
class Collisions {
    constructor(game) {
        this.game = game;
    }
    setEnvironmentList(list) {
        this.envList = list;
    }
    collideWithEnvironment(element, force = false) {
        if (!this.envList) {
            return;
        }
        const listOrder = [];

        for (const key in this.envList) {
            listOrder.push(key);
        }
        listOrder.reverse();
        for (let index = 0; index < listOrder.length; index++) {
            const listId = listOrder[index];

            const list = this.envList[listId].objects;

            if (this.listCollide(element, list, force)) {
                return;
            }
        }
    }
    solidCollision(element, obj, delta, force = false) {
        if (-element.z > obj.realHeight || obj.ignoreCollision) {
            return;
        }

        let collided;

        if (force || Math.abs(element.velocity.x) + Math.abs(element.velocity.y) > 0) {
            const nextStep = {
                x: element.x + element.velocity.x * delta + Math.cos(element.angle) * element.radius,
                y: element.y + element.velocity.y * delta + Math.sin(element.angle) * element.radius,
            };

            const response = new SAT.Response();
            const circle = new SAT.Circle(new SAT.Vector(nextStep.x, nextStep.y), element.radius);

            collided = SAT.testCircleCircle(obj.circleCollider, circle, response);
            if (collided) {
                let kickback = 0.1;
                let bounce = 200;

                if (obj.checkHigh(element)) {
                    kickback = obj.rebound;
                    bounce = obj.zForce;
                }

                this.hardCollision(element, response, kickback, bounce, obj.minusAngle);

                if (obj.type == 'fort') {
                    obj.damageHit(element.force * 0.7);
                }
            }
        }

        return collided;
    }
    listCollide(element, envList, force = false) {
        let collideOnce = false;
        let env;
        let collidedElement;

        if (force || element.force > 0) {
            for (let index = 0; index < envList.length; index++) {
                env = envList[index];
                if (!env.ignoreCollision) {
                    const circle = new SAT.Circle(new SAT.Vector(element.contactPoint.x, element.contactPoint.y), element.radius);
                    const response = new SAT.Response();
                    const collided = SAT.testPolygonCircle(env.poly, circle, response);

                    if (collided) {
                        collideOnce = env.data.type;
                        collidedElement = env;
                        break;
                    }
                }
            }
        }

        if (collideOnce) {
            // collidedElement.alpha = 0
            if (!force) {
                this.doCollision(element, collidedElement.data);
            } else {
                element.checkCanPlace(collidedElement.data);
            }
        }

        return collideOnce;
    }
    doCollision(element, data) {
        element.applyTerrainModifiers(data);
    }
    skillBasedCollision(element, env) {
        if (element.currentSkill == 'breaker') {
            env.alpha = 0;
            element.throughObstacle();
        }
    }

    contains(rect, point) {
        return rect.x <= point.x && point.x <= rect.x + rect.width &&
            rect.y <= point.y && point.y <= rect.y + rect.height;
    }
    hardCollision(element, response, rebound = 0.008, zForce = 20, reverse = false) {
        element.wallColide();

        let collAngle = Math.atan2(response.overlapN.y, response.overlapN.x);

        if (!reverse) {
            collAngle -= Math.PI / 2;
        }
        const collVec = new SAT.Vector(Math.cos(collAngle), Math.sin(collAngle));

        const ballVector = new SAT.Vector(Math.cos(element.angle), Math.sin(element.angle));

        ballVector.reflect(collVec);

        const tempAngle = Math.atan2(ballVector.y, ballVector.x);

        element.angle = tempAngle;

        element.x += response.overlapV.x;
        element.y += response.overlapV.y;
        // element.applyVelocity(tempAngle);

        let forceMod = element.force;

        if (forceMod < 200) {
            forceMod = 1000;
        }
        if (element.velocityZ > -10) {
            forceMod = 500;
        }

        element.bouncy(tempAngle, forceMod * rebound, zForce * (forceMod * 0.0001));
    }
    testAABB(rect, element) {
        if (rect.x < element.x + (element.radius) &&
            rect.x + rect.width > element.x &&
            rect.y < element.y + (element.radius) &&
            rect.height + rect.y > element.y) {
            // collision detected!
            return true;
        }

        return false;
    }
    checkPointInRect(rect, point) {
        if (point.x > rect.x &&
            point.x < rect.x + (rect.width) &&
            point.y > rect.y &&
            point.y < rect.y + (rect.height)) {
            // collision detected!
            return true;
        }

        return false;
    }
}
export default new Collisions();