const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getMaterials = async (req, res, next) => {
  try {
    const { search } = req.query;
    const where = search ? {
      OR: [
        { nombre: { contains: search } },
        { descripcion: { contains: search } },
        { categoria: { contains: search } }
      ]
    } : {};

    const materials = await prisma.material.findMany({
      where,
      orderBy: { fecha_creacion: 'desc' }
    });
    res.json(materials);
  } catch (error) {
    next(error);
  }
};

const createMaterial = async (req, res, next) => {
  try {
    const material = await prisma.material.create({
      data: req.body
    });
    res.status(201).json(material);
  } catch (error) {
    next(error);
  }
};

const updateMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const material = await prisma.material.update({
      where: { id: parseInt(id) },
      data: req.body
    });
    res.json(material);
  } catch (error) {
    next(error);
  }
};

const deleteMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.material.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Material deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial
};







