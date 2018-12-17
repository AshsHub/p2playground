import CardData from './CardData';
import cardInfo from './cardDetails';

export default class Deck
{
    constructor()
    {
        this.staticCardList = []; // 20 cards
        this.cardList = []; // 20 cards
        this.deckSize = cardInfo.cards.length; // enoughtDAta;

        this.deckSize = Math.min(this.deckSize, 20);
        for (let index = 0; index < this.deckSize; index++)
        {
            const data = new CardData();

            data.setData(cardInfo.cards[index]);
            this.staticCardList.push(data);
            this.cardList.push(data.clone());
        }

        utils.shuffle(this.cardList);
    }
    getCard()
    {
        const cardData = this.cardList[0];

        this.cardList.splice(0, 1);

        return cardData;
    }
    takeCard(data)
    {
        this.cardList.push(data);
    }
}
