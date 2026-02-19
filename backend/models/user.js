const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    email: {
        type: String,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ],
        unique: true,
        sparse: true, // Allow null/undefined but unique if present
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        trim: true,
        match: [/^[0-9]{10,15}$/, 'Phone number is invalid']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false // Don't return password by default
    },
    user_type: {
        type: String,
        enum: ['farmer', 'buyer', 'admin'],
        required: true
    },
    language: {
        type: String,
        default: 'en',
        maxlength: 10
    },
    location: {
        address_line1: String,
        city: String,
        state: String,
        pincode: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    is_active: {
        type: Boolean,
        default: true
    },
    is_verified: {
        type: Boolean,
        default: false
    },
    last_login: {
        type: Date
    },
    // References to profiles
    farmerProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FarmerProfile'
    },
    buyerProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BuyerProfile'
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    console.log('Hashing password for user:', this.phone);
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Cascade delete profiles when a user is deleted
UserSchema.pre('remove', async function () {
    if (this.user_type === 'farmer') {
        await this.model('FarmerProfile').deleteOne({ user: this._id });
    } else if (this.user_type === 'buyer') {
        await this.model('BuyerProfile').deleteOne({ user: this._id });
    }
});

// Virtual for 'id' to match frontend expectation
UserSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

module.exports = mongoose.model('User', UserSchema);
