import { Request, Response } from "express";

export const signup = async (req: Request, res: Response): Promise<void> => {};
export const login = async (req: Request, res: Response): Promise<void> => {};
export const logout = async (req: Request, res: Response): Promise<void> => {};
export const getMe = async (req: Request, res: Response): Promise<void> => {};
export const googleAuth = async (
  req: Request,
  res: Response
): Promise<void> => {};
export const googleAuthCallback = async (
  req: Request,
  res: Response
): Promise<void> => {};
export const githubAuth = async (
  req: Request,
  res: Response
): Promise<void> => {};
export const githubAuthCallback = async (
  req: Request,
  res: Response
): Promise<void> => {};
