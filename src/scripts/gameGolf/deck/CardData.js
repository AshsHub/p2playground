export default class CardData {
    constructor() {
        this.data;
    }
    setData(data) {
        this.data = data;

        for (const key in data) {
            this[key] = data[key];
        }
    }
    clone(index) {
        const cloneCard = new CardData();

        for (const key in this) {
            cloneCard[key] = this[key];
        }

        return cloneCard;
    }
}