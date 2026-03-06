import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import type { UpdateUserDto, UserResponseDto } from '../dtos/user.dto';
import User from '../models/user';
import { getBaseUrl, sendError } from '../utils';
import type { ParamsDictionary } from 'express-serve-static-core';

interface IdParam extends ParamsDictionary {
  id: string;
}

export const getAllUsers = async (_req: Request, res: Response): Promise<UserResponseDto[]> => {
  try {
    const users = await User.find();
    const userDtos: UserResponseDto[] = users.map((user) => ({
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      photoUrl: user.photoUrl,
    }));

    res.json(userDtos);
    return userDtos;
  } catch (error) {
    sendError(res, 500, 'Failed to get all users.');
    throw error;
  }
};

export const getUserById = async (req: Request<IdParam>, res: Response): Promise<UserResponseDto> => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) throw new Error(`User not found for Id: ${id}`);

    const userDto: UserResponseDto = {
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      photoUrl: user.photoUrl,
    };

    res.json(userDto);
    return userDto;
  } catch (error) {
    sendError(res, 500, `Failed to get user by Id: ${id}`);
    throw error;
  }
};

export const updateUser = async (
  req: Request<IdParam, unknown, UpdateUserDto>,
  res: Response,
): Promise<UserResponseDto> => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    if (req.file) {
      const base = getBaseUrl();
      const filePath = req.file.path.replace(/\\/g, '/');
      updateData.photoUrl = `${base}${filePath}`;
    }

    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedUser) throw new Error(`User not found for Id: ${id}`);

    const userDto: UserResponseDto = {
      _id: updatedUser._id.toString(),
      username: updatedUser.username,
      email: updatedUser.email,
      photoUrl: updatedUser.photoUrl,
    };

    res.json(userDto);
    return userDto;
  } catch (error) {
    sendError(res, 500, `Failed to update user by Id: ${id}`);
    throw error;
  }
};

export const deleteUser = async (req: Request<IdParam>, res: Response): Promise<UserResponseDto> => {
  const { id } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) throw new Error(`User not found for Id: ${id}`);

    const userDto: UserResponseDto = {
      _id: deletedUser._id.toString(),
      username: deletedUser.username,
      email: deletedUser.email,
      photoUrl: deletedUser.photoUrl,
    };

    res.json(userDto);
    return userDto;
  } catch (error) {
    sendError(res, 500, `Failed to delete user by Id: ${id}`);
    throw error;
  }
};
