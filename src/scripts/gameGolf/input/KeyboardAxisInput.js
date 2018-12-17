export default class KeyboardAxisInput
{
    constructor()
    {
        this.axis = [0, 0];
        this.angle = 0;
        this.touchID = null;

        this.axisValue = {
            left: ['A', 'a', 'ArrowLeft'],
            right: ['D', 'd', 'ArrowRight'],
            up: ['W', 'w', 'ArrowUp'],
            down: ['S', 's', 'ArrowDown'],
        };

        this.currentPressed = [];
        document.addEventListener('keydown', (event) =>
        {
            const tempKey = event.key;

            const tempAxi = this.getMappedAxi(tempKey);// null;

            if (!this.currentPressed.includes(tempAxi))
            {
                this.currentPressed.push(tempAxi);
            }
            // console.log(this.currentPressed);
        });

        document.addEventListener('keyup', (event) =>
        {
            const tempKey = event.key;

            const tempAxi = this.getMappedAxi(tempKey);// null;

            for (let index = 0; index < this.currentPressed.length; index++)
            {
                const element = this.currentPressed[index];

                if (element === tempAxi)
                {
                    this.currentPressed.splice(index, 1);
                    break;
                }
            }
            // console.log(this.currentPressed);
        });
    }
    getMappedAxi(id)
    {
        for (const axi in this.axisValue)
        {
            const axiArray = this.axisValue[axi];

            for (let index = 0; index < axiArray.length; index++)
            {
                const element = axiArray[index];

                if (id === element)
                {
                    return axi;
                }
            }
        }

        return false;
    }
    reset()
    {
        this.axis = [0, 0];
        this.currentPressed = [];
    }
    update()
    {
        this.axis = [0, 0];
        this.angle = null;
        for (let index = 0; index < this.currentPressed.length; index++)
        {
            const element = this.currentPressed[index];

            if (element === 'left')
            {
                this.axis[0] = -1;
            }
            else if (element === 'right')
            {
                this.axis[0] = 1;
            }
            else if (element === 'up')
            {
                this.axis[1] = -1;
            }
            else if (element === 'down')
            {
                this.axis[1] = 1;
            }
        }
        if (this.axis[0] !== 0 || this.axis[1] !== 0)
        {
            this.angle = Math.atan2(this.axis[1], this.axis[0]);
            // console.log(this.axis, Math.cos(this.angle) * 100, Math.sin(this.angle) * 100);
        }
    }
}
