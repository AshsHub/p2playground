import Deck from './Deck';
import CardView from './CardView';
import InGameInput from '../../game/input/InGameInput';
import Signals from 'signals';
import Utils from '../../utils';
import EnergyBar from '../ui/hud/EnergyBar';
import {
    TweenLite,
    Back,
    Elastic,
} from 'gsap';
import utils from '../../utils';

// CurrEnergy
// Cards
// Update energy based on time (1ps), var energyPerSec
// Entire deck

export default class DeckManager extends PIXI.Container {
    constructor() {
        super();
        this.currentEnergy = 2;
        this.energyToBeUsed = 0;
        this.energyReplenishRate = 1;
        this.energyTimer = 1;
        this.maxEnergy = 10;
        this.energyIncreaseRate;
        this.deckIndex = 0;
        this.cardList = [];
        this.deck = new Deck();
        this.canPlaceActive = false;

        this.currentCardContainer = new PIXI.Container();
        this.addChild(this.currentCardContainer);
        // cardView.build(data)
        this.deckContainer = new PIXI.Container();
        this.addChild(this.deckContainer);
        this.bg = new PIXI.Graphics().beginFill().drawRect(0, 0, window.App.desktopResolution.width, 300);
        this.deckContainer.addChild(this.bg);
        this.bg.alpha = 0;

        this.energyBar = new EnergyBar();
        this.energyBar.y = this.deckContainer.y;
        this.energyBar.max = this.maxEnergy;
        this.addChild(this.energyBar);

        this.cardListContainer = new PIXI.Container();
        this.deckContainer.addChild(this.cardListContainer);

        this.createDeck();

        this.onCardUsed = new Signals();
        this.onReturnCard = new Signals();
        this.onPlaceCard = new Signals();

        InGameInput.onUpdateMouse.add((pos) => {
            this.checkIsOverCard(pos);
            this.moveCard(pos);
        });

        this.canUseAction = false;

        this.ableToShoot = true;
        this.cardIndex = 0;

        this.currentMousePosition = {
            x: 0,
            y: 0,
        };

        this.clickRadius = 0;
    }
    show() {
        const tot = this.cardList.length;
        const dis = window.App.innerResolution.width * 0.2;
        const angDis = 0.05;

        for (let index = 0; index < tot; index++) {
            const card = this.cardList[index];

            card.visible = true;
            card.x = dis * index - tot / 2 * dis + dis * 0.5; // card.back.width * 0.5

            card.rotation = Math.sin((index) * angDis) - Math.sin((tot - 1) * angDis) / 2; // -(0.05*tot)//-(0.1*tot/2)//- 0.1
            card.y = -card.scale.x * card.back.height * 0.35 + card.back.height * Math.abs(card.rotation);
            card.savePosition();
            // console.log( card.rotation);

            TweenLite.from(card, 0.5, {
                delay: 0.1 * index + 0.5,
                y: 250,
                x: 0,
                rotation: 0,
                ease: Back.easeOut,
            });
        }
    }
    forceCard() {
        this.activeCard = this.cardList[0];
        // this.ableToShoot = true;
    }
    moveCard(pos) {
        this.currentMousePosition = pos;
        if (!this.currentCard) {
            return;
        }
        this.currentCard.x = pos.x; // - this.currentCard.width / 2;
        this.currentCard.y = pos.y; // - this.currentCard.height / 2;
    }
    update(delta) {
        this.energyReplenishTimer(delta);
        this.energyBar.setWidth(this.currentEnergy);
        this.energyBar.max = this.maxEnergy;

        this.cardListContainer.children.sort(utils.xCompare);
    }
    energyReplenishTimer(delta) {
        if (this.currentEnergy < this.maxEnergy) {
            if (this.energyTimer > 0) {
                this.energyTimer -= delta;
            } else {
                this.currentEnergy += this.energyReplenishRate;
                this.energyTimer = 1;
            }
        }
    }
    createDeck() {
        const tot = 4;
        const rot = 0.05;

        for (let index = 0; index < tot; index++) {
            this.deckIndex++;
            const data = this.deck.getCard();

            const card = new CardView();
            // card.x = 120 * index - tot/2 * 120

            card.visible = false;
            // card.y = this.bg.height - card.height
            card.rotation = Math.sin((index) * rot) - Math.sin((tot - 1) * rot) / 2; // -(0.05*tot)//-(0.1*tot/2)//- 0.1
            // card.rotation = Math.sin((index) * 0.1) - Math.sin((tot - 1) * 0.1) / 2; // -(0.05*tot)//-(0.1*tot/2)//- 0.1

            card.onHold.add((card) => {
                if (this.currentEnergy < card.data.energy) {
                    card.cross.alpha = 1;
                    return
                }
                if (card == this.activeCard) {
                    this.returnCardToHand(false);

                    return;
                }
                if (this.activeCard) {
                    return;
                }
                this.currentCard = card;
                this.currentCard.alpha = 0.2;
                TweenLite.to(this.currentCard, 1.5, {
                    rotation: 0,
                    ease: Elastic.easeOut,
                });
                this.currentCard.parent.removeChild(this.currentCard);
                this.addChild(this.currentCard);

                this.currentCard.x = this.currentMousePosition.x; // - this.currentCard.width / 2
                this.currentCard.y = this.currentMousePosition.y; // - this.currentCard.height / 2
                // this.ableToShoot = false;
            });
            card.onRelease.add((card) => {
                if (!this.currentCard) {
                    return;
                }
                this.releaseCard(card);
            });
            card.build();
            card.setData(data);
            card.scale.set(window.App.innerResolution.width * 0.15 / card.back.width);
            this.cardList.push(card);
            this.cardListContainer.addChild(card);
        }
    }
    releaseCard(card) {
        if (card.data.type === 'passive') {
            this.currentCard.parent.removeChild(this.currentCard);

            const center = window.App.getRealCenter();

            const cardCenter = {
                x: this.currentCard.x, // + (this.currentCard.width / 2),
                y: this.currentCard.y, // + (this.currentCard.height / 2)
            };

            // this.graph = new PIXI.Graphics().beginFill(0x32E2D2, 0.5).drawCircle(0, 0, 400);
            // this.graph.x = center.x;
            // this.graph.y = center.y - 150;
            // this.addChild(this.graph);

            const dist = Utils.distance(cardCenter.x, cardCenter.y, center.x, center.y);

            if (dist < this.clickRadius && this.currentEnergy >= this.currentCard.data.energy) {
                this.addCurrentCard(this.currentCard);
                this.onCardUsed.dispatch(this.currentCard);
                this.currentCard = null;
            } else {
                this.cardListContainer.addChild(this.currentCard);
                this.currentCard.reset();
                this.onReturnCard.dispatch(this.currentCard);
            }
        } else if (card.data.type === 'active') {
            if (this.currentEnergy >= this.currentCard.data.energy && this.canPlaceActive) {
                this.placeCardDown();
            } else {
                this.cardListContainer.addChild(this.currentCard);
                this.currentCard.reset();
                this.onReturnCard.dispatch(this.currentCard);
            }
        }
    }
    placeCardDown() {
        this.onPlaceCard.dispatch(this.currentCard);
        this.addCurrentCard(this.currentCard);
        this.cardListContainer.addChild(this.currentCard);
        this.currentCard.reset();
        this.currentCard = null;
        this.returnCardToDeck();
    }
    returnCardToHand() {
        if (!this.activeCard) {
            return;
        }
        // this.onReturnCard.dispatch(this.activeCard);

        // this.ableToShoot = false;
        this.activeCard.alpha = 1;
        this.activeCard.parent.removeChild(this.activeCard);
        this.cardListContainer.addChild(this.activeCard);
        // this.activeCard.reset()
        this.activeCard.tweenReset();
        this.currentCard = null;
        this.activeCard = null;
        this.onReturnCard.dispatch(this.currentCard);
    }
    returnCardToDeck() {
        this.currentEnergy -= this.activeCard.data.energy;
        this.deck.takeCard(this.activeCard.data);
        (this.deckIndex < this.deck.deckSize) ? this.deckIndex++: this.deckIndex = 0;
        this.activeCard.setData(this.deck.getCard());
        this.returnCardToHand();
        this.onReturnCard.dispatch(this.currentCard);
    }
    addCurrentCard(card) {
        // this.ableToShoot = true;
        this.activeCard = card;
        this.currentCardContainer.addChild(this.activeCard);
        this.activeCard.x = 0;
        this.activeCard.y = -20;
        // this.currentCard.x = this.currentCard.width / 2;
        // this.currentCard.y = this.currentCard.height - 50;

        this.activeCard.alpha = 0;
        TweenLite.to(this.activeCard, 0.15, {
            alpha: 0.8,
        });
        TweenLite.to(this.activeCard, 0.25, {
            y: this.activeCard.height / 2,
            ease: Back.easeOut,
        });
    }
    checkIsOverCard(pos) {
        // console.log(pos);
    }
    resize(resolution, innerResolution) {
        // this.innerResolution = innerResolution;
        const firstCard = this.cardList[0];

        this.cardListContainer.x = innerResolution.width / 2; // - cardSize / 2//this.deckContainer.width / 2 - (cardSize * this.cardList.length)/2 + cardSize*0.5
        // this.cardListContainer.y = this.deckContainer.height / 2; // - this.cardListContainer.height / 2 + 60

        this.currentCardContainer.x = innerResolution.width / 2; // - cardSize.width / 2
        this.currentCardContainer.y = 20;

        this.energyBar.resize(innerResolution);
        this.energyBar.y = innerResolution.height - (this.energyBar.backShape.height); // * 1.25;
        this.deckContainer.y = innerResolution.height - firstCard.height * 0.9; // firstCard.scale.y
    }
}