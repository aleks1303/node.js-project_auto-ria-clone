import { badWordsConstant } from "../constants/bad-words.constant";

class ModerationHelper {
    public hasBadWords(text: string): boolean {
        if (!text) return false;
        const lowerText = text.toLowerCase();
        return badWordsConstant.some((word) => {
            const pattern = `(^|[^a-zа-яё0-9])${word.toLowerCase()}(?![a-zа-яё0-9])`;
            const regex = new RegExp(pattern, "i");

            return regex.test(lowerText);
        });
    }
}

export const moderationHelper = new ModerationHelper();
