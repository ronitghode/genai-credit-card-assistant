import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    pin: { type: String, required: true },
    // Personal Details
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    dob: { type: Date },
    address: { type: String },
    // Account Details
    balance: { type: Number, default: 0 },
    creditScore: { type: Number, default: 750 },
    // Card Delivery Details
    cardDeliveryStatus: { type: String, enum: ["Pending", "In Transit", "Delivered", "Cancelled"], default: "Pending" },
    cardDeliveryDate: { type: Date },
    expectedDeliveryDate: { type: Date },
    trackingNumber: { type: String },
    metadata: { type: Object, default: {} }
}, { timestamps: true });

// Hash password and PIN before saving
// Hash password and PIN before saving
userSchema.pre("save", async function () {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    if (this.isModified("pin")) {
        this.pin = await bcrypt.hash(this.pin, 10);
    }
});

// Methods to compare credentials
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.comparePin = async function (candidatePin) {
    return bcrypt.compare(candidatePin, this.pin);
};

export default mongoose.model("User", userSchema);
