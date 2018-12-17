import * as PIXI from 'pixi.js';
export default class UIList extends PIXI.Container
{
    constructor()
    {
        super();
        this.container = new PIXI.Container();
        this.addChild(this.container);
        this.elementsList = [];
        this.w = 0;
        this.h = 0;
    }
    addBackground(color = 0xFF0000, alpha = 0)
    {
        this.background = new PIXI.Graphics().beginFill(color).drawRect(0, 0, this.w, this.h);
        this.container.addChildAt(this.background, 0);
        this.background.alpha = alpha;
    }
    debug()
    {
        this.debugGr = new PIXI.Graphics().beginFill(0xFFFFFF * Math.random()).drawRect(0, 0, this.w, this.h);
        this.container.addChild(this.debugGr);
        this.debugGr.alpha = 0.5;
    }
    removeElement(element)
    {
        for (let i = this.elementsList.length - 1; i >= 0; i--)
        {
            if (this.elementsList[i] == element)
            {
                this.container.removeChild(element);
                this.elementsList.splice(i, 1);
            }
        }
    }
    addElementAt(element, pos)
    {
        this.container.addChild(element);
        this.elementsList.splice(pos, 0, element);
    }
    addElement(element)
    {
        this.container.addChild(element);
        this.elementsList.push(element);
    }
    updateHorizontalList(showDots = false)
    {
        const listSizes = [];
        let sum = 0;
        let quant = 0;

        for (var i = 0; i < this.elementsList.length; i++)
        {
            if (this.elementsList[i].listScl)
            {
                listSizes.push(this.elementsList[i].listScl);
                sum += this.elementsList[i].listScl;
                quant++;
            }
            else
            {
                listSizes.push(0);
            }
        }
        const adjust = 1 - sum;
        const scales = adjust / ((this.elementsList.length) - quant);
        let chunkSize = 0;

        for (var i = 0; i < this.elementsList.length; i++)
        {
            if (listSizes[i] == 0)
            {
                listSizes[i] = scales;
            }
        }
        let plus = 0;
        const positions = [];
        let stdH = 1;
        let stdW = 1;

        for (var i = 0; i < listSizes.length; i++)
        {
            plus = 0;
            let nextX = 0;

            chunkSize = this.w * listSizes[i];
            if (i == 0)
            {
                nextX = 0;
            }
            else
            {
                nextX = positions[i - 1] + this.w * listSizes[i - 1];
            }
            positions.push(nextX);
            if (this.elementsList[i].fitHeight)
            {
                stdH = (this.elementsList[i].height / this.elementsList[i].scale.y);
                this.elementsList[i].scale.set(this.h / stdH * this.elementsList[i].fitHeight);
            }
            else if (this.elementsList[i].fitWidth)
            {
                stdW = (this.elementsList[i].width / this.elementsList[i].scale.x);
                this.elementsList[i].scale.set(chunkSize / stdW * this.elementsList[i].fitWidth);
            }
            else if (this.elementsList[i].scaleContent)
            {
                stdW = (this.elementsList[i].width / this.elementsList[i].scale.x);
                this.elementsList[i].scale.set(chunkSize / stdW);
            }

            if (this.elementsList[i].scaleContentMax && (this.elementsList[i].width > (chunkSize * this.elementsList[i].scaleContentMax)))
            {
                stdW = (this.elementsList[i].width / this.elementsList[i].scale.x / this.elementsList[i].scaleContentMax);
                this.elementsList[i].scale.set(chunkSize / stdW);
            }
            let align = 0.5;

            if (this.elementsList[i].align != undefined)
            {
                align = this.elementsList[i].align;
            }

            this.elementsList[i].x = nextX + chunkSize * align - this.elementsList[i].width * align;
            if (showDots)
            {
                const pixig = new PIXI.Graphics().beginFill(0xFF0000).drawCircle(0, 0, 5);

                this.container.addChild(pixig);
                pixig.x = this.elementsList[i].x;
            }
            // if (showDots)
            // {
            // }
            const vAnchor = this.elementsList[i].vAnchor != null ? this.elementsList[i].vAnchor : 0.5;

            this.elementsList[i].y = this.h * vAnchor - this.elementsList[i].height * vAnchor;
        }
    }

    updateVerticalList(showDots = false)
    {
        const listSizes = [];
        let sum = 0;
        let quant = 0;

        for (var i = 0; i < this.elementsList.length; i++)
        {
            if (this.elementsList[i].listScl)
            {
                listSizes.push(this.elementsList[i].listScl);
                sum += this.elementsList[i].listScl;
                quant++;
            }
            else
            {
                listSizes.push(0);
            }
        }
        const adjust = 1 - sum;
        const scales = adjust / ((this.elementsList.length) - quant);
        let chunkSize = 0;

        for (var i = 0; i < this.elementsList.length; i++)
        {
            if (listSizes[i] == 0)
            {
                listSizes[i] = scales;
            }
        }
        let plus = 0;
        const positions = [];
        let stdH = 1;
        let stdW = 1;

        for (var i = 0; i < listSizes.length; i++)
        {
            // let pixig = new PIXI.Graphics().beginFill(0xFF0000).drawCircle(0, 0, 5)
            // this.container.addChild(pixig)
            plus = 0;
            let nextX = 0;

            chunkSize = this.h * listSizes[i];
            if (i == 0)
            {
                nextX = 0;
            }
            else
            {
                nextX = positions[i - 1] + this.h * listSizes[i - 1];
            }
            positions.push(nextX);
            if (this.elementsList[i].fitHeight)
            {
                stdH = (this.elementsList[i].height / this.elementsList[i].scale.y);
                this.elementsList[i].scale.set(chunkSize / stdH * this.elementsList[i].fitHeight);
            }
            else if (this.elementsList[i].fitWidth)
            {
                stdW = (this.elementsList[i].width / this.elementsList[i].scale.x);
                this.elementsList[i].scale.set(this.w / stdW * this.elementsList[i].fitWidth);
            }
            else if (this.elementsList[i].scaleContent)
            {
                stdW = (this.elementsList[i].height / this.elementsList[i].scale.y);
                this.elementsList[i].scale.set(chunkSize / stdW);
            }
            else if (this.elementsList[i].scaleContentMax && (this.elementsList[i].height > chunkSize))
            {
                stdW = (this.elementsList[i].height / this.elementsList[i].scale.y / this.elementsList[i].scaleContentMax);
                this.elementsList[i].scale.set(chunkSize / stdW);
            }
            let align = 0.5;

            if (this.elementsList[i].align != undefined)
            {
                align = this.elementsList[i].align;
            }

            const nextY = nextX + chunkSize * align - this.elementsList[i].height * align;

            this.elementsList[i].y = nextY;
            // pixig.x = nextX

            if (showDots)
            {
                const pixig = new PIXI.Graphics().beginFill(0xFF0000).drawCircle(0, 0, 5);

                this.container.addChild(pixig);
                pixig.y = this.elementsList[i].y;
            }

            const hAnchor = this.elementsList[i].hAnchor != null ? this.elementsList[i].hAnchor : 0.5;

            this.elementsList[i].x = this.w * hAnchor - this.elementsList[i].width * hAnchor;
        }
    }
}
