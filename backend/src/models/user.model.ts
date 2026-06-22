import mongoose, {Document, Schema} from 'mongoose'; 
import {UserType} from '../types/user.types'; 
import { string } from 'zod';


export interface IUser extends UserType, Document{
    _id: mongoose.Types.ObjectId, 
    createdAt: Date, 
    updatedAt: Date, 
}

const UserModelSchema: Schema = new Schema<IUser>(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["admin", "user"], default: "user" },
        phoneNumber: { type: String, default: null },       
        profilePicture: { type: String, default: null },   
    },
    { timestamps: true }
);
export default mongoose.model<IUser>(
    "User", // collection name in db.users
    UserModelSchema
);