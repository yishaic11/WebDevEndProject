import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import type { UserResponseDto } from '../dtos/user.dto';
import { sendError } from '../utils/errors';
import { signAccessToken, signRefreshToken } from '../utils/auth';
import type { AuthTokensDto, LoginDto, RegisterDto } from '../dtos/auth.dto';
import type { TokenPayload } from '../types/auth';

export const register = async (
  req: Request<Record<string, string>, unknown, RegisterDto>,
  res: Response,
): Promise<UserResponseDto> => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    sendError(res, 400, 'Username, email, and password are required.');
    throw new Error('Username, email, and password are required.');
  }

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      sendError(res, 400, 'Username or email already exists.');
      throw new Error('Username or email already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);

    let photoUrl: string | undefined;
    if (req.file) {
      const { getBaseUrl } = await import('../utils/url');
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

    return {
      _id: createdUser._id.toString(),
      username: createdUser.username,
      email: createdUser.email,
      photoUrl: createdUser.photoUrl,
    };
  } catch (error) {
    sendError(res, 400, 'Error registering user.');
    throw error;
  }
};

export const login = async (
  req: Request<Record<string, string>, unknown, LoginDto>,
  res: Response,
): Promise<AuthTokensDto | void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    sendError(res, 400, 'Username and password are required.');
    throw new Error('Username and password are required.');
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      sendError(res, 400, 'Invalid username or password.');
      throw new Error('Invalid username or password.');
    }

    if (!user.password) {
      sendError(res, 400, 'This account uses social login. Please sign in with Google or Facebook.');
      throw new Error('No password on this account.');
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      sendError(res, 400, 'Invalid username or password.');
      throw new Error('Invalid username or password.');
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

    return { accessToken, refreshToken };
  } catch (error) {
    sendError(res, 400, 'Error during login.');
    throw error;
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const authHeaders = req.headers['authorization'];
  const token = authHeaders && authHeaders.split(' ')[1];
  const secret = process.env.REFRESH_TOKEN_SECRET;

  if (!token) {
    sendError(res, 401, 'No token provided');
    throw new Error('No token provided');
  }

  if (!secret) {
    sendError(res, 500, 'REFRESH_TOKEN_SECRET is not defined');
    throw new Error('REFRESH_TOKEN_SECRET is not defined');
  }

  try {
    const userInfo = jwt.verify(token, secret) as TokenPayload;
    const userId = userInfo._id;

    const user = await User.findById(userId);
    if (!user) {
      sendError(res, 403, 'Invalid Request');
      throw new Error('Invalid Request');
    }

    const tokenExists = user.refreshTokens.includes(token);

    if (!tokenExists) {
      user.refreshTokens = [];
      await user.save();

      sendError(res, 403, 'Token reuse detected');
      throw new Error('Token reuse detected');
    }

    const accessToken = signAccessToken({ _id: user._id });
    const newRefreshToken = signRefreshToken({ _id: user._id });

    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    user.refreshTokens.push(newRefreshToken);

    await user.save();
    res.status(200).json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    sendError(res, 403, 'Invalid or expired token');
    throw error;
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const authHeaders = req.headers['authorization'];
  const token = authHeaders && authHeaders.split(' ')[1];
  const secret = process.env.REFRESH_TOKEN_SECRET;

  if (!token) {
    sendError(res, 401, 'No token provided');
    throw new Error('No token provided');
  }

  if (!secret) {
    sendError(res, 500, 'REFRESH_TOKEN_SECRET is not defined');
    throw new Error('REFRESH_TOKEN_SECRET is not defined');
  }

  try {
    const userInfo = jwt.verify(token, secret) as TokenPayload;
    const user = await User.findById(userInfo._id);
    if (!user) {
      sendError(res, 403, 'Invalid Request');
      throw new Error('Invalid Request');
    }

    if (!user.refreshTokens.includes(token)) {
      user.refreshTokens = [];
      await user.save();

      sendError(res, 403, 'Invalid Request');
      throw new Error('Invalid Request');
    }

    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    await user.save();
    res.status(200).send({ message: 'Logged out successfully' });
  } catch (error) {
    sendError(res, 403, 'Logout Error');
    throw error;
  }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      sendError(res, 401, 'No token provided');
      return;
    }

    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as jwt.JwtPayload & { _id: string };
    const user = await User.findById(payload._id);
    if (!user) {
      sendError(res, 404, 'User not found');
      return;
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      photoUrl: user.photoUrl,
    });
  } catch {
    sendError(res, 403, 'Invalid or expired token');
  }
};
