import * as PIXI from 'pixi.js';
import manifest from './manifest.json';
import utils from './utils';
import ExtendedApplication from './ExtendedApplication';

// window.Input = new Input();

window.console.warn = function () {};
window.console.groupCollapsed = function (teste) {};

window.addEventListener('resize', () => onresize());
window.addEventListener('focus', unPause, true);
window.addEventListener('blur', pause, true);

window.utils = utils;

let tempManifest = manifest.default.map(
    (a) => a.replace(/\\/g, '/')
);

tempManifest = tempManifest.map(
    (a) => a.replace(/dist\//g, '')
);

tempManifest = tempManifest.map(
    (a) => a.replace(/.json/g, '_mip.json')
);
console.log(tempManifest);
// for (let index = 0; index < tempManifest.length; index++) {
//     tempManifest[index].
//     tempManifest[index] += '_mip'

// }
console.log(tempManifest);

// tempManifest.push('assets/json/first.json');
tempManifest.push('assets/json/map2.json');

// let audioManifest = manifest.audio.map(
//     (a) => a.replace(/\\/g, '/')
// );

// audioManifest = audioManifest.map(
//     (a) => a.replace(/dist\//g, '')
// );
// for (let i = 0; i < audioManifest.length; i++)
// {
//     audioManifest[i] = audioManifest[i].replace(/\\/, '/');
//     let url = audioManifest[i].substr(0, audioManifest[i].length - 4);

//     url += '.mp3';
//     PIXI.loader.add(audioManifest[i], url);
// }
window.App = new ExtendedApplication();
window.App.addManifest(tempManifest);
window.App.load();

window.onresize = () => {
    window.App.resize();
};

function unPause() {
    window.App.unPause();
}

function pause() {
    window.App.pause();
}

const InteractionManager = PIXI.interaction.InteractionManager;

InteractionManager.prototype.mapPositionToPoint = function (point, x, y) {
    let rect;

    // IE 11 fix
    if (!this.interactionDOMElement.parentElement) {
        rect = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        };
    } else {
        rect = this.interactionDOMElement.getBoundingClientRect();
    }

    const angle = 90 * Math.PI / 180;

    const resolutionMultiplier = navigator.isCocoonJS ? this.resolution : (1.0 / this.resolution);

    if (window.is90degree) {
        point.x = ((y - rect.top) * (this.interactionDOMElement.height / rect.width)) * resolutionMultiplier;
        point.y = (this.interactionDOMElement.height - ((x - rect.left) * (this.interactionDOMElement.width / rect.height))) * resolutionMultiplier;
    } else {
        point.x = ((x - rect.left) * (this.interactionDOMElement.width / rect.width)) * resolutionMultiplier;
        point.y = ((y - rect.top) * (this.interactionDOMElement.height / rect.height)) * resolutionMultiplier;
    }
};