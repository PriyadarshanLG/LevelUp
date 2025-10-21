import { Request, Response } from 'express';
export declare const chatWithAI: (req: Request, res: Response) => Promise<void>;
export declare const getConversationSuggestions: (req: Request, res: Response) => Promise<void>;
export declare const testAIService: (req: Request, res: Response) => Promise<void>;
export declare const generateAIQuiz: (req: Request, res: Response) => Promise<void>;
