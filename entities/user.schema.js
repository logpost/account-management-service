import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
    {
      username: { type: String, required: true, unique: true},
      password: { type: String, required: true },
      profile: {
        age: { type: Number, default: null },
        vip: { type: Boolean, default: false }
      },
    },
    {
        versionKey: false,
        timestamps: { createdAt: 'created_at', updatedAt: "updated_at" } 
    },
)

export default UserSchema