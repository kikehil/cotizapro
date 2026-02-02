const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../utils/jwt.util');

const prisma = new PrismaClient();

const register = async (req, res, next) => {
  try {
    const { nombre, email, password, rol } = req.body;

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        nombre,
        email,
        password: hashedPassword,
        rol: rol || 'VENTAS',
        permisos: JSON.stringify(req.body.permisos || [])
      },
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const accessToken = generateAccessToken(user);
    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        permisos: true,
        fecha_creacion: true
      }
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol, permisos, password } = req.body;

    const data = {
      nombre,
      email,
      rol,
      permisos: JSON.stringify(permisos || [])
    };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(password, salt);
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data
    });

    res.json({
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      permisos: user.permisos
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'No puedes eliminar tu propio usuario' });
    }

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refresh,
  getUsers,
  updateUser,
  deleteUser
};







