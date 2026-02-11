import { IPassword } from "../interfaces/password.interface";
import { Password } from "../models/password.model";

class PasswordRepository {
    public async createPassword(dto: Partial<IPassword>): Promise<IPassword> {
        return Password.create(dto);
    }

    public findOldPasswords(
        _userId: string,
        sinceDate: Date,
    ): Promise<IPassword[]> {
        return Password.find({
            _userId,
            createdAt: { $gte: sinceDate },
        });
    }

    public async deleteBeforeDate(date: Date): Promise<number> {
        const { deletedCount } = await Password.deleteMany({
            createdAt: { $lt: date },
        });
        return deletedCount;
    }
}
export const passwordRepository = new PasswordRepository();
