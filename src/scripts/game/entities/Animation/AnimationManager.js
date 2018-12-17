import * as PIXI from 'pixi.js';
import Signals from 'signals';
export default class AnimationManager
{
    constructor()
    {
        this.onStart = new Signals();
        this.onFinish = new Signals();
        this.currentTexture = null;
        this.currentAnimation = null;
        this.animationData = {};
    }

    nameHelper(id, frames = 1, start = 0, extension = '.png')
    {
        const list = [];

        for (let index = start; index <= frames; index++)
        {
            let tempIndex = '0';

            if (index < 10)
            {
                tempIndex = `0${index}`;
            }
            else
            {
                tempIndex = index;
            }
            list.push(id + tempIndex + extension);
        }

        return list;
    }
    addAnimation(name, texture, frames = 1, speed = 0.1, param = {}, hasCallback = false)
    {
        if (!param.start)
        {
            param.start = 1;
        }
        if (param.loop == undefined)
        {
            param.loop = true;
        }

        let textures = [];

        if (frames == 0)
        {
            textures = texture;
        }
        else
        {
            textures = this.nameHelper(texture, frames, param.start);
            if (param.inverse)
            {
                textures.reverse();
            }

            if (param.boomerang)
            {
                const aux = this.nameHelper(texture, frames, param.start).reverse();

                textures = textures.concat(aux);
            }
        }

        this.animationData[name] = {
            textures,
            animationSpeed: speed,
            currentFrame: 0,
            currentTime: 0,
            loop: param.loop,
            hasCallback,
        };
    }
    destroy()
    {
        this.currentTexture = null;
        this.currentAnimation = null;
        this.animationData = {};
    }
    reset()
    {

    }
    playOnCurrentFrame(id, force = false)
    {
        this.play(id, this.animationData[this.currentAnimation].currentFrame, force);
    }
    play(id, frame = 0, force = false)
    {
        if (id === this.currentAnimation && !force)
        {
            // console.log(id);

            return;
        }
        this.currentAnimation = id;
        const animData = this.animationData[this.currentAnimation];

        animData.currentFrame = frame;
        this.currentTexture = PIXI.Texture.from(animData.textures[animData.currentFrame]);
    }
    forceFrame(frame)
    {
        const animData = this.animationData[this.currentAnimation];

        animData.currentFrame = frame;
        this.currentTexture = PIXI.Texture.from(animData.textures[animData.currentFrame]);
    }
    getNormalizedFrame()
    {
        return this.animationData[this.currentAnimation].currentFrame / this.animationData[this.currentAnimation].textures.length;
    }
    forceStop()
    {
        this.currentAnimation = null;
    }
    getCurrentFrame()
    {
        return this.animationData[this.currentAnimation].currentFrame;
    }
    updateAnimation(delta)
    {
        if (!this.currentAnimation || !this.animationData)
        {
            return;
        }
        const animData = this.animationData[this.currentAnimation];

        const next = animData.currentTime + delta;

        if (next >= animData.animationSpeed)
        {
            const jumpFrames =  Math.ceil((next - animData.currentTime) / animData.animationSpeed) + 1;

            animData.currentFrame += jumpFrames;
            // animData.currentTime = next;

            if (!animData.loop && animData.currentFrame >= animData.textures.length - 1)
            {
                animData.currentFrame = animData.textures.length - 1;

                if (animData.hasCallback)
                {
                    this.onFinish.dispatch(animData.currentFrame);
                }
            }
            else
            {
                animData.currentFrame %= animData.textures.length;
            }
            animData.currentTime = 0;
            // console.log(animData.textures[animData.currentFrame]);
            this.currentTexture = PIXI.Texture.from(animData.textures[animData.currentFrame]);
        }
        else
        {
            animData.currentTime = next;
        }
    }
}
