import { badWordsConstant } from "../constants/bad-words.constant";

class ModerationHelper {
    // public hasBadWords(text: string): boolean {
    //     if (!text) return false;
    //
    //     const lowerText = text.toLowerCase();
    //
    //     // Перевіряємо, чи міститься хоча б одне погане слово у тексті
    //     return badWordsConstant.some((word) =>
    //         lowerText.includes(word.toLowerCase()),
    //     );
    // }

    // moderation.helper.ts

    // public hasBadWords(text: string): boolean {
    //     if (!text) return false;
    //
    //     const lowerText = text.toLowerCase();
    //
    //     return badWordsConstant.some((word) => {
    //         // \b означає "boundary" (межа слова)
    //         // Це змусить JS шукати саме "ass", а не "assistance"
    //         const regex = new RegExp(`\\b${word.toLowerCase()}\\b`, "i");
    //         return regex.test(lowerText);
    //     });
    // }

    // moderation.helper.ts

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
