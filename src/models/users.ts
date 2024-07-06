import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';

// Define an interface for the User document
export interface IUser extends Document {
    name: string;
    email: string;
    isAdmin: boolean;
    password: string;
}

// Define the User schema
const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    isAdmin: { type: Boolean, required: true },
    password: { type: String, required: true },
});

userSchema.pre<IUser>('save', async function (next) {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password = hashedPassword;
        next();
    } catch (error) {
        next(error as Error);
    }
});

// Create and export the User model
const User = model<IUser>('User', userSchema);

export default User;
