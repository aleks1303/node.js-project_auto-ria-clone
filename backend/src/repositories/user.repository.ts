import { IUser, IUserCreateDTO } from "../interfaces/user.interface";
import { User } from "../models/user.model";

class UserRepository {
    public getAll(): Promise<IUser[]> {
        return User.find();
    }

    public create(user: IUserCreateDTO): Promise<IUser> {
        return User.create(user);
    }

    public getByEmail(email: string): Promise<IUser> {
        return User.findOne({ email });
    }

    public getById(userId: string): Promise<IUser> {
        return User.findById(userId);
    }

    public updateById(userId: string, dto: Partial<IUser>): Promise<IUser> {
        return User.findByIdAndUpdate(userId, dto, { new: true });
    }
}
export const userRepository = new UserRepository();
