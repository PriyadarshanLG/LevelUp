"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (user) => {
    const payload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role
    };
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jsonwebtoken_1.default.sign(payload, secret, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        issuer: 'learnhub-api'
    });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        return decoded;
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token has expired');
        }
        else if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid token');
        }
        else {
            throw new Error('Token verification failed');
        }
    }
};
exports.verifyToken = verifyToken;
const generateRefreshToken = (user) => {
    const payload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role
    };
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jsonwebtoken_1.default.sign(payload, secret, {
        expiresIn: '30d',
        issuer: 'learnhub-api'
    });
};
exports.generateRefreshToken = generateRefreshToken;
