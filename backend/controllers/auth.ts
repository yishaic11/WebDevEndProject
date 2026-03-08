import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User, { type IUser } from '../models/user';
import { signAccessToken, signRefreshToken, sendError, getBaseUrl } from '../utils';
import type { LoginDto, RegisterDto } from '../dtos/auth.dto';
import type { TokenPayload } from '../types/auth';

export const register = async (
  req: Request<Record<string, string>, unknown, RegisterDto>,
  res: Response,
): Promise<void> => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    sendError(res, 400, 'Username, email, and password are required.');
  }

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      sendError(res, 400, 'Username or email already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);

    let photoUrl: string | undefined;
    if (req.file) {
      const base = getBaseUrl();
      const filePath = req.file.path.replace(/\\/g, '/');
      photoUrl = `${base}${filePath}`;
    }

    const userDoc = new User({
      username,
      email,
      password: encryptedPassword,
      photoUrl,
    });
    const createdUser = await userDoc.save();

    res.status(201).json({
      _id: createdUser._id,
      username: createdUser.username,
      email: createdUser.email,
      photoUrl: createdUser.photoUrl,
    });
  } catch {
    sendError(res, 400, 'Error registering user.');
  }
};

export const login = async (req: Request<Record<string, string>, unknown, LoginDto>, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    return sendError(res, 400, 'Username and password are required.');
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return sendError(res, 400, 'Invalid username or password.');
    }

    if (!user.password) {
      return sendError(res, 400, 'This account uses social login. Please sign in with Google.');
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return sendError(res, 400, 'Invalid username or password.');
    }

    const accessToken = signAccessToken({ _id: user._id });
    const refreshToken = signRefreshToken({ _id: user._id });

    if (!user.refreshTokens) {
      user.refreshTokens = [refreshToken];
    } else {
      user.refreshTokens.push(refreshToken);
    }

    await user.save();

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      photoUrl: user.photoUrl,
      accessToken,
      refreshToken,
    });
  } catch {
    sendError(res, 400, 'Error during login.');
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const authHeaders = req.headers['authorization'];
  const token = authHeaders && authHeaders.split(' ')[1];
  const secret = process.env.REFRESH_TOKEN_SECRET;

  if (!token) {
    return sendError(res, 401, 'No token provided');
  }

  if (!secret) {
    return sendError(res, 500, 'REFRESH_TOKEN_SECRET is not defined');
  }

  try {
    const userInfo = jwt.verify(token, secret) as TokenPayload;
    const userId = userInfo._id;

    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 403, 'Invalid Request');
    }

    const tokenExists = user.refreshTokens.includes(token);

    if (!tokenExists) {
      user.refreshTokens = [];
      await user.save();

      return sendError(res, 403, 'Token reuse detected');
    }

    const accessToken = signAccessToken({ _id: user._id });
    const newRefreshToken = signRefreshToken({ _id: user._id });

    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    user.refreshTokens.push(newRefreshToken);

    await user.save();
    res.status(200).json({ accessToken, refreshToken: newRefreshToken });
  } catch {
    sendError(res, 403, 'Invalid or expired token');
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const authHeaders = req.headers['authorization'];
  const token = authHeaders && authHeaders.split(' ')[1];
  const secret = process.env.REFRESH_TOKEN_SECRET;

  if (!token) {
    return sendError(res, 401, 'No token provided');
  }

  if (!secret) {
    return sendError(res, 500, 'REFRESH_TOKEN_SECRET is not defined');
  }

  try {
    const userInfo = jwt.verify(token, secret) as TokenPayload;
    const user = await User.findById(userInfo._id);
    if (!user) {
      return sendError(res, 403, 'Invalid Request');
    }

    if (!user.refreshTokens.includes(token)) {
      user.refreshTokens = [];
      await user.save();

      return sendError(res, 403, 'Invalid Request');
    }

    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);

    await user.save();
    res.status(200).send({ message: 'Logged out successfully' });
  } catch {
    sendError(res, 403, 'Logout Error');
  }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const secret = process.env.ACCESS_TOKEN_SECRET;

    if (!token) {
      return sendError(res, 401, 'No token provided');
    }

    if (!secret) {
      return sendError(res, 500, 'ACCESS_TOKEN_SECRET is not defined');
    }

    const payload = jwt.verify(token, secret) as TokenPayload;
    const user = await User.findById(payload._id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    const { _id, username, email, photoUrl } = user;
    res.json({
      _id,
      username,
      email,
      photoUrl,
    });
  } catch {
    sendError(res, 403, 'Get current user error, invalid or expired token');
  }
};

export const oauthCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as unknown as IUser;
    if (!user) {
      res.redirect(`${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/login?error=oauth_failed`);
      return;
    }

    const accessToken = signAccessToken({ _id: user._id });
    const refreshToken = signRefreshToken({ _id: user._id });

    user.refreshTokens = [...(user.refreshTokens ?? []), refreshToken];
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
    const params = new URLSearchParams({
      accessToken,
      refreshToken,
      _id: (user._id as unknown as string).toString(),
      username: user.username,
      email: user.email,
      ...(user.photoUrl ? { photoUrl: user.photoUrl } : {}),
    });

    res.redirect(`${frontendUrl}/oauth-callback?${params.toString()}`);
  } catch {
    res.redirect(`${process.env.FRONTEND_URL ?? 'http://localhost:5173'}/login?error=oauth_failed`);
  }
};
