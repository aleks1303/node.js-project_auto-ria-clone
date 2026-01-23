import bcrypt from "bcrypt";

import { passwordRepository } from "../repositories/password.repository";

class PasswordService {
    public hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    public comparePassword(
        password: string,
        hashedPassword: string,
    ): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }

    public async isPasswordValid(
        userId: string,
        newPassword: string,
        days: number,
    ): Promise<boolean> {
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - days);

        const oldPasswords = await passwordRepository.findOldPasswords(
            userId,
            oldDate,
        );

        for (const password of oldPasswords) {
            const isCorrectPassword = await bcrypt.compare(
                newPassword,
                password.password,
            );
            if (isCorrectPassword) {
                return true;
            }
        }

        return false;
    }
}

export const passwordService = new PasswordService();
