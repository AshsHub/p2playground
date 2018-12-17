import * as PIXI from 'pixi.js';
export default class Entity extends PIXI.Container
{
    constructor(radius = 80)
    {
        super();

        this.stats = {
            level: 1,
            tired: 0.5,
            shootSpeed: 1,
            life: 5,
            standardSpeed: 200,
            standardStamina: 3,
            standardMass: 50,
            jumpInvencibleTimer: 0.5,
        };
        this.dynamicStats = {
            speed: 200,
            sprint: 300,
            stamina: 3,
            mass: 50,
        };

        this.multipliers = {
            speed: 1,
            sprint: 1.1,
            stamina: 1,
            mass: 1,
            jump: 3,
        };
        this.mainRadius = radius;
        this.radius = radius;
        this.startScale = 1;// this.radius / this.sprite.height;
        this.scaleSin = Math.random();
        this.mainScale = this.startScale;
        this.velocity = { x: 0, y: 0 };
        this.resetVelocity();

        this.spriteContainer = new PIXI.Container();
        this.addChild(this.spriteContainer);

        // this.spriteContainer.scale.set(this.startScale);
        this.directionAngle = 0;
        this.killed = false;

        this.acceleration = {
            x: this.dynamicStats.speed * 5, // config.width * 0.05,
            y: this.dynamicStats.speed * 5, // config.height * 0.02
        };

        this.id = Math.random() * 9999;
        this.directionSpeed = 0;
        this.directionVirtualSpeed = 0;
        // this.isProtected = true;
        this.tileBlockers = [1];

        // used to know if is created first time (to add the events)
        this.isNew = true;
        this.jumpTimer = 0;

        this.collidable = true;
        this.updateable = true;
    }

    applyMultipliers()
    {
        this.dynamicStats.sprintSpeed = this.stats.standardSpeed * this.multipliers.sprint;
        this.dynamicStats.sprintSpeed = this.stats.standardSpeed * this.multipliers.mass;
        this.dynamicStats.speed = this.stats.standardSpeed * this.multipliers.speed;
        this.dynamicStats.mass = this.stats.standardMass * this.multipliers.mass;
    }

    sprinting()
    {
        this.isSprinting = true;
        // this.dynamicStats.sprintSpeed = this.stats.standardSpeed * this.multipliers.sprint;
        this.applyMultipliers();
        this.dynamicStats.speed = (this.stats.standardSpeed * this.multipliers.speed) + this.dynamicStats.sprintSpeed;
    }
    walking()
    {
        this.isSprinting = false;
        this.dynamicStats.speed = this.stats.standardSpeed;
    }
    getMagnetude()
    {
        const magn = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);

        return magn / this.dynamicStats.speed;
    }
    reset()
    {
        this.killed = false;
        this.resetVelocity();
        this.acceleration = {
            x: this.dynamicStats.speed * 3, // config.width * 0.05,
            y: this.dynamicStats.speed * 3, // config.height * 0.02
        };
    }
    zeroVelSmooth()
    {
        this.zeroVel(false, 0.75);
    }
    zeroVel(force = false, velDecrease = 1)
    {
        this.virtualVelocity = { x: 0, y: 0 };
        if (force)
        {
            this.velocity = { x: 0, y: 0 };
        }
        else
        {
            this.velocity.x *= velDecrease;
            this.velocity.y *= velDecrease;
        }
        this.directionAngle = null;
        this.stopped = true;
    }
    applyVelocity(angle, mult = 1, force = false)
    {
        this.directionAngle = angle;
        this.virtualVelocity.x = Math.cos(angle) * this.dynamicStats.speed * mult;
        this.virtualVelocity.y = Math.sin(angle) * this.dynamicStats.speed * mult;
        if (force)
        {
            this.velocity.x = this.virtualVelocity.x;
            this.velocity.y = this.virtualVelocity.y;
        }

        this.stopped = false;
    }
    update(delta)
    {
        this.udpateVelocity(delta);
    }
    move(delta)
    {
        this.x += this.velocity.x * delta;
        this.y += this.velocity.y * delta;

        // debugger
    }

    udpateVelocity(delta)
    {
        const axis = ['x', 'y'];

        for (let i = 0; i < axis.length; i++)
        {
            if (this.velocity[axis[i]] < this.virtualVelocity[axis[i]])
            {
                this.velocity[axis[i]] += this.acceleration[axis[i]] * delta;
                if (this.velocity[axis[i]] > this.virtualVelocity[axis[i]])
                {
                    this.velocity[axis[i]] = this.virtualVelocity[axis[i]];
                }
            }
            else if (this.velocity[axis[i]] > this.virtualVelocity[axis[i]])
            {
                this.velocity[axis[i]] -= this.acceleration[axis[i]] * delta;
                if (this.velocity[axis[i]] < this.virtualVelocity[axis[i]])
                {
                    this.velocity[axis[i]] = this.virtualVelocity[axis[i]];
                }
            }
        }
    }
    resetVelocity()
    {
        this.velocity = {
            x: 0,
            y: 0,
        };
        this.virtualVelocity = {
            x: 0,
            y: 0,
        };
        this.stopped = true;
    }
}
