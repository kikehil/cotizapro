const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getCompany = async (req, res, next) => {
  try {
    let company = await prisma.companyConfig.findFirst();
    if (!company) {
      company = await prisma.companyConfig.create({
        data: {
          nombre_empresa: 'Tu Empresa S.A. de C.V.',
          id: 1
        }
      });
    }
    res.json(company);
  } catch (error) {
    next(error);
  }
};

const updateCompany = async (req, res, next) => {
  try {
    const company = await prisma.companyConfig.upsert({
      where: { id: 1 },
      update: req.body,
      create: { ...req.body, id: 1 }
    });
    res.json(company);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCompany,
  updateCompany
};







