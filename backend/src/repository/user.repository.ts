import User, { IUser } from "../models/user.model";
import mongoose, { UpdateQuery } from "mongoose";

export interface IUserRepository {
  findByUsername(username: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  create(user: IUser): Promise<IUser>;
  findById(id: string): Promise<IUser | null>;
  findAll(): Promise<IUser[]>;
  findByCourseId(courseId: string): Promise<IUser[]>;
  update(id: string, user: UpdateQuery<IUser>): Promise<IUser | null>;
  delete(id: string): Promise<boolean>;
  findByResetToken(token: string): Promise<IUser | null>;
  findByGoogleId(googleId: string): Promise<IUser | null>;
}
export class UserMongoRepository implements IUserRepository {
  async findByUsername(username: string): Promise<IUser | null> {
    const foundUser = await User.findOne({ username: username });
    return foundUser;
  }
  async findByEmail(email: string): Promise<IUser | null> {
    const foundUser = await User.findOne({ email: email });
    return foundUser;
  }
  async create(user: IUser): Promise<IUser> {
    const createdUser = await User.create(user);
    return createdUser;
  }
  async findById(id: string): Promise<IUser | null> {
    const foundUser = await User.findById(id);
    return foundUser;
  }

  async findAll(): Promise<IUser[]> {
    const users = await User.find();
    return users;
  }
  async findByCourseId(courseId: string): Promise<IUser[]> {
    const users = await User.find({
      courseId: new mongoose.Types.ObjectId(courseId),
    });
    return users;
  }
  async update(id: string, user: UpdateQuery<IUser>): Promise<IUser | null> {
    const updatedUser = await User.findByIdAndUpdate(id, user, {
      returnDocument: "after",
    });
    return updatedUser;
  }
  async delete(id: string): Promise<boolean> {
    const deletedUser = await User.findByIdAndDelete(id);
    return !!deletedUser;
  }

  async getAllPaginated(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ data: IUser[]; total: number }> {
    const query: any = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const total = await User.countDocuments(query);
    const data = await User.find(query)
      .skip((page - 1) * limit)
      .limit(limit);
    return { data, total };
  }

  async findByResetToken(token: string): Promise<IUser | null> {
    const foundUser = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordExpires");
    return foundUser;
  }

async findByGoogleId(googleId: string): Promise<IUser | null> {
    const foundUser = await User.findOne({ googleId });
    return foundUser;
}
}
