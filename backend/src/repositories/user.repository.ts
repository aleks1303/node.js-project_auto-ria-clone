import { FilterQuery } from "mongoose";

import { RoleEnum } from "../enums/user-enum/role.enum";
import { IUser, IUserListQuery } from "../interfaces/user.interface";
import { User } from "../models/user.model";

class UserRepository {
    public async getAll(query: IUserListQuery): Promise<[IUser[], number]> {
        const skip = (query.page - 1) * query.pageSize;
        const filter: FilterQuery<IUser> = {
            isDeleted: query.isDeleted,
        };
        if (query.search) {
            filter.$or = [
                { name: { $regex: query.search, $options: "i" } },
                { surname: { $regex: query.search, $options: "i" } },
                { email: { $regex: query.search, $options: "i" } },
            ];
        }

        if (query.role) {
            filter.role = query.role;
        }

        const sortOrder = query.order === "desc" ? -1 : 1;

        return Promise.all([
            User.find(filter)
                .sort({ [query.orderBy]: sortOrder as any })
                .skip(skip)
                .limit(query.pageSize),
            User.countDocuments(filter),
        ]);
    }
    public create(user: Partial<IUser>): Promise<IUser> {
        return User.create(user);
    }

    public getByEmail(email: string): Promise<IUser | null> {
        return User.findOne({ email });
    }
    public getByPhone(phone: string): Promise<IUser | null> {
        return User.findOne({ phone });
    }
    public findByRole(role: RoleEnum): Promise<IUser[]> {
        return User.find({ role });
    }

    public getById(userId: string): Promise<IUser> {
        return User.findById(userId);
    }

    public updateById(userId: string, dto: Partial<IUser>): Promise<IUser> {
        return User.findByIdAndUpdate(userId, dto, { new: true });
    }
}
export const userRepository = new UserRepository();
