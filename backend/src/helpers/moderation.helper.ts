import { badWordsConstant } from "../constants/bad-words.constant";

class ModerationHelper {
    public hasBadWords(text: string): boolean {
        if (!text) return false;

        const lowerText = text.toLowerCase();

        // Перевіряємо, чи міститься хоча б одне погане слово у тексті
        return badWordsConstant.some((word) =>
            lowerText.includes(word.toLowerCase()),
        );
    }
}

export const moderationHelper = new ModerationHelper();
