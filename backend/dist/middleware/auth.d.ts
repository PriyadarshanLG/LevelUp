import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/User';
declare global {
    namespace Express {
        interface Request {
            user?: IUser;
            userId?: string;
        }
    }
}
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const authorize: (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
