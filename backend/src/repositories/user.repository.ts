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
}
export const userRepository = new UserRepository();
