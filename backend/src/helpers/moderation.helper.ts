import { badWordsConstant } from "../constants/bad-words.constant";

const BAD_WORD_REGEX = new RegExp(`\\b(${badWordsConstant.join("|")})\\b`, "i");

class ModerationHelper {
    public hasBadWords(text: string): boolean {
        if (!text) return false;

        return BAD_WORD_REGEX.test(text);
    }
}

export const moderationHelper = new ModerationHelper();
