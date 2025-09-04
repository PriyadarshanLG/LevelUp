"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authorize = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const User_1 = __importDefault(require("../models/User"));
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'Access denied. No valid token provided.'
            });
            return;
        }
        const token = authHeader.substring(7);
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Access denied. Token is required.'
            });
            return;
        }
        const decoded = (0, jwt_1.verifyToken)(token);
        const user = await User_1.default.findById(decoded.userId);
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
            return;
        }
        req.user = user;
        req.userId = user._id.toString();
        next();
    }
    catch (error) {
        console.error('Authentication error:', error.message);
        if (error.message === 'Token has expired') {
            res.status(401).json({
                success: false,
                message: 'Token has expired. Please login again.',
                code: 'TOKEN_EXPIRED'
            });
        }
        else if (error.message === 'Invalid token') {
            res.status(401).json({
                success: false,
                message: 'Invalid token. Please login again.',
                code: 'INVALID_TOKEN'
            });
        }
        else {
            res.status(401).json({
                success: false,
                message: 'Authentication failed. Please login again.'
            });
        }
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Access denied. Please authenticate first.'
            });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.',
                requiredRoles: roles,
                userRole: req.user.role
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            if (token) {
                const decoded = (0, jwt_1.verifyToken)(token);
                const user = await User_1.default.findById(decoded.userId);
                if (user) {
                    req.user = user;
                    req.userId = user._id.toString();
                }
            }
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
