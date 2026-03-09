import type { Request, Response } from 'express';
import type { UpdateUserDto, UserResponseDto } from '../dtos/user.dto';
import type { AuthenticatedRequest } from '../types/auth';
import User from '../models/user';
import { getActiveUserId, getBaseUrl, sendError } from '../utils';
import type { IdParam } from '../types/common';

export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find();
    const userDtos: UserResponseDto[] = users.map((user) => ({
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      photoUrl: user.photoUrl,
    }));

    res.json(userDtos);
  } catch {
    sendError(res, 500, 'Failed to get all users.');
  }
};

export const getUserById = async (req: Request<IdParam>, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return sendError(res, 404, `User not found for Id: ${id}`);
    }

    res.json({
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      photoUrl: user.photoUrl,
    });
  } catch {
    sendError(res, 500, `Failed to get user by Id: ${id}`);
  }
};

export const updateUser = async (
  req: AuthenticatedRequest<IdParam, unknown, UpdateUserDto>,
  res: Response,
): Promise<void> => {
  const senderId = getActiveUserId(req);
  const { id: userId } = req.params;

  if (senderId !== userId) {
    sendError(res, 403, 'You can only update your own profile.');
    return;
  }

  try {
    const updateData: Partial<UpdateUserDto> = {};
    if (req.body.username) updateData.username = req.body.username;
    if (req.file) {
      const base = getBaseUrl();
      const filePath = req.file.path.replace(/\\/g, '/');
      updateData.photoUrl = `${base}${filePath}`;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { returnDocument: 'after' });
    if (!updatedUser) {
      return sendError(res, 404, `User not found for Id: ${userId}`);
    }

    res.json({
      _id: updatedUser._id.toString(),
      username: updatedUser.username,
      email: updatedUser.email,
      photoUrl: updatedUser.photoUrl,
    });
  } catch {
    sendError(res, 500, `Failed to update user with Id: ${userId}`);
  }
};

export const deleteUser = async (req: AuthenticatedRequest<IdParam>, res: Response): Promise<void> => {
  const senderId = getActiveUserId(req);
  const { id: userId } = req.params;

  if (senderId !== userId) {
    sendError(res, 403, 'You can only delete your own profile.');
    return;
  }

  try {
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return sendError(res, 404, `User not found for Id: ${userId}`);
    }

    res.json({
      _id: deletedUser._id.toString(),
      username: deletedUser.username,
      email: deletedUser.email,
      photoUrl: deletedUser.photoUrl,
    });
  } catch {
    sendError(res, 500, `Failed to delete user with Id: ${userId}`);
  }
};
