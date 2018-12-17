import Environment from '../builder/Environment';
import Tree from '../builder/Tree';
import Rock from '../builder/Rock';
import EnemyZone from './EnemyZone';
import PlayerBall from './PlayerBall';

class EntityBuilder {
    constructor() {
        this.environmentPool = [];
        this.treePool = [];
        this.rockPool = [];
        this.enemyPool = [];
        this.playerPool = [];

        this.classes = {
            Environment,
            Tree,
            Rock,
            EnemyZone,
            PlayerBall
        };
    }
    popEntity(entityData) {
        let ent = null;

        if (this[entityData.pool].length) {
            ent = this[entityData.pool][0];
            this[entityData.pool].splice(0, 1);
            console.log('BUILDER WORKING');
        }
        if (!ent) {
            ent = new this.classes[entityData.type](entityData.data);
        }

        ent.pool = entityData.pool;

        ent.inPool = false;

        return ent;
    }
    returnPool(entity) {
        if (entity.inPool) {
            return;
        }
        entity.inPool = true;
        this[entity.pool].push(entity);
    }
    getEnvironment(type = 'Environment', data) {
        const ent = this.popEntity({
            pool: 'environmentPool',
            type,
            data
        });

        return ent;
    }
    getTree(type = 'Tree', data) {
        const ent = this.popEntity({
            pool: 'treePool',
            type,
            data
        });

        return ent;
    }
    getRock(type = 'Rock', data) {
        const ent = this.popEntity({
            pool: 'rockPool',
            type,
            data
        });

        return ent;
    }
    getEnemyZone(type = 'EnemyZone', data) {
        const ent = this.popEntity({
            pool: 'enemyPool',
            type,
            data
        });

        return ent;
    }
    getPlayerBall(type = 'PlayerBall', data) {
        const ent = this.popEntity({
            pool: 'playerPool',
            type,
            data
        });

        return ent;
    }
}
export default new EntityBuilder();