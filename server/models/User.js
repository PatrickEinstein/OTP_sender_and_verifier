import mongoose from "mongoose"
const Schema = mongoose.Schema


const UserSchema = new Schema({
    email: String,
    password: String,
    verified: Boolean
})


export const User = mongoose.model('User', UserSchema);

