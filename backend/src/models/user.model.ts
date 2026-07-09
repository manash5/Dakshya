import mongoose, {Document, Schema} from 'mongoose'; 
import {UserType} from '../types/user.types'; 
import { string } from 'zod';


export interface IUser extends Omit<UserType, 'universityId' | 'courseId' | 'targetRoles'>, Document {
    _id: mongoose.Types.ObjectId;
    universityId: mongoose.Types.ObjectId | null;
    courseId: mongoose.Types.ObjectId | null;
    targetRoles: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
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
        age: {
            type: Number,
            default: null
        },

    universityId: {
        type: Schema.Types.ObjectId,
        ref: "University",
        default: null
    },

    courseId: {
        type: Schema.Types.ObjectId,
        ref: "Course",
        default: null
    },

    currentSemester: {
        type: Number,
        default: null
    },

    targetRoles: [{
        type: Schema.Types.ObjectId,
        ref: "JobRole"
    }],

    onboardingCompleted: {
        type: Boolean,
        default: false
    }
    },
    { timestamps: true }
);
export default mongoose.model<IUser>(
    "User", // collection name in db.users
    UserModelSchema
);