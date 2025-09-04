import { Request, Response } from 'express';
export declare const getCourses: (req: Request, res: Response) => Promise<void>;
export declare const getCourse: (req: Request, res: Response) => Promise<void>;
export declare const enrollCourse: (req: Request, res: Response) => Promise<void>;
export declare const getUserEnrollments: (req: Request, res: Response) => Promise<void>;
export declare const getCategories: (req: Request, res: Response) => Promise<void>;
export declare const createCourse: (req: Request, res: Response) => Promise<void>;
