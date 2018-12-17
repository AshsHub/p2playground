import Fortress from '../entities/Fortress';
import earcut from 'earcut';
import Collisions from '../core/Collisions';
import EntityBuilder from '../entities/EntityBuilder';

export default class BuildEnvironment {
    constructor(game) {
        this.game = game;
        this.mapScale = 1
    }
    getEnvironmet() {
        return EntityBuilder.getEnvironment();
    }
    build(courseData) {
        this.courseData = courseData;
        this.environmentData = {};
        // courseData.layers.reverse()
        for (let index = 0; index < this.courseData.layers.length; index++) {
            if (this.courseData.layers[index].name === 'Objects') {
                for (let j = 0; j < this.courseData.layers[index].objects.length; j++) {
                    if (this.courseData.layers[index].objects[j].name == 'playerBall') {
                        const newPos = {
                            x: this.courseData.layers[index].objects[j].x * this.mapScale,
                            y: this.courseData.layers[index].objects[j].y * this.mapScale
                        }
                        this.game.playerBall.setPosition(newPos);
                    } else if (this.courseData.layers[index].objects[j].name == 'courseHole') {
                        const newPos = {
                            x: this.courseData.layers[index].objects[j].x * this.mapScale,
                            y: this.courseData.layers[index].objects[j].y * this.mapScale
                        }
                        this.game.courseHole.setPosition(newPos);
                    }
                }
            } else if (this.courseData.layers[index].name === 'EnvironmentLayer') {
                for (let k = 0; k < this.courseData.layers[index].objects.length; k++) {
                    const name = this.courseData.layers[index].objects[k].name;

                    if (name !== 'EnemyZone') {
                        const func = `get${name}`;

                        const entity = EntityBuilder[func]();
                        const location = {
                            x: this.courseData.layers[index].objects[k].x * this.mapScale,
                            y: this.courseData.layers[index].objects[k].y * this.mapScale,
                        };

                        entity.build(location.x, location.y);
                        this.game.entityContainer.addChild(entity);

                        const lowerName = name.toLowerCase();
                        const list = `${lowerName}List`;
                        // debugger // eslint-disable-line

                        if (list) {
                            this.game.entityManager[list].push(entity);
                        }
                    }
                }
            } else {
                const envData = {};

                for (let j = 0; j < this.courseData.layers[index].properties.length; j++) {
                    const element = this.courseData.layers[index].properties[j];
                    const name = element.name;
                    const value = element.value;


                    envData[name] = value;
                }
                this.setEnviroment(index, envData);
            }
        }

        // console.log(this.environmentList);
        // let str = ''
        // for (let index = 0; index < this.environmentList.length; index++) {
        //     const element = this.environmentList[index];
        //     str += ("\n[");
        //     str += ("\n{x:" + element.x + ",y:" + element.y + "},");
        //     str += ("\n{x:" + (element.x + element.width) + ",y:" + element.y + "},");
        //     str += ("\n{x:" + (element.x + element.width) + ",y:" + (element.y + element.height) + "},");
        //     str += ("\n{x:" + element.x + ",y:" + (element.y + element.height) + "}");
        //     str += ("\n],");
        // }
        // console.log(str);

        Collisions.setEnvironmentList(this.environmentData);
    }
    setEnviroment(index, data) {
        let pointsArray = [];

        // console.log(data);
        for (let i = 0; i < this.courseData.layers[index].objects.length; i++) {
            const copyData = {};

            for (const key in data) {
                copyData[key] = data[key];
            }
            const layer = this.courseData.layers[index];
            const wall = this.courseData.layers[index].objects[i];

            const poly = wall.polygon;

            if (!layer.offsetx) {
                layer.offsetx = 0;
            }
            if (!layer.offsety) {
                layer.offsety = 0;
            }
            pointsArray = [];
            let layerData;

            if (!this.environmentData[layer.name]) {
                this.environmentData[layer.name] = {
                    objects: [],
                };
            }
            layerData = this.environmentData[layer.name];
            // console.log(wall);

            if (wall.properties) {
                for (let index = 0; index < wall.properties.length; index++) {
                    const element = wall.properties[index];

                    copyData[element.name] = element.value;
                }
            }

            for (let j = 0; j < poly.length; j++) {
                const element = poly[j];

                pointsArray.push({
                    x: (element.x + wall.x + layer.offsetx) * this.mapScale,
                    y: (element.y + wall.y + layer.offsety) * this.mapScale,
                });
            }

            const tess = this.tesselateBounds(pointsArray);

            for (let index = 0; index < tess.length; index++) {
                const element = tess[index];
                const points = [{
                        x: pointsArray[element[0]].x,
                        y: pointsArray[element[0]].y,
                    },
                    {
                        x: pointsArray[element[1]].x,
                        y: pointsArray[element[1]].y,
                    },
                    {
                        x: pointsArray[element[2]].x,
                        y: pointsArray[element[2]].y,
                    },
                ];

                const env = this.getEnvironmet();

                env.build(points, copyData, wall.properties);
                // env.build(pointsArray, copyData, wall.properties);
                layerData.objects.push(env);

                // this.groundContainer.addChild(env);
            }
        }

        for (const key in this.environmentData) {
            const list = this.environmentData[key].objects;

            for (let index = 0; index < list.length; index++) {
                const element = list[index];

                this.game.groundContainer.addChild(element);
                // element.alpha = 0.5
            }
        }
    }
    destroy() {
        for (const key in this.environmentData) {
            const list = this.environmentData[key].objects;

            for (let index = 0; index < list.length; index++) {
                const element = list[index];

                this.game.groundContainer.removeChild(element);

                EntityBuilder.returnPool(element);
                // element.alpha = 0.5
            }
        }
    }
    tesselateBounds(bounds) {
        let triangles = [];

        for (var k = 0; k < bounds.length; k++) {
            triangles.push(bounds[k].y);
            triangles.push(bounds[k].x);
        }

        triangles = earcut(triangles, 2);

        // polygon tesselated

        const tessVerticies = [];
        let newTr = [];

        // separate the new array of verticies in small triangles arrays
        for (var k = 0; k < triangles.length; k++) {
            newTr.push(triangles[k]);
            if (newTr.length >= 3) {
                tessVerticies.push(newTr);
                newTr = [];
            }
        }

        return tessVerticies;
    }
    replaceData(originalData, secondaryData) {
        for (let i = 0; i < originalData.length; i++) {
            const element = originalData[i];

            for (let j = 0; j < secondaryData.length; j++) {
                const object = secondaryData[j];
            }
        }
    }
}