/*
  Warnings:

  - A unique constraint covering the columns `[cotizacion_id]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `invoice` ADD COLUMN `estatus` ENUM('Pendiente', 'Pagada', 'Cancelada') NOT NULL DEFAULT 'Pendiente';

-- CreateIndex
CREATE UNIQUE INDEX `Invoice_cotizacion_id_key` ON `Invoice`(`cotizacion_id`);
