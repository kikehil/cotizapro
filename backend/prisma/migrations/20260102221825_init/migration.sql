-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `rol` ENUM('ADMIN', 'VENTAS', 'LECTURA') NOT NULL DEFAULT 'VENTAS',
    `fecha_creacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Client` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `rfc` VARCHAR(191) NULL,
    `telefono` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `direccion` VARCHAR(191) NULL,
    `giro` VARCHAR(191) NULL,
    `contacto_principal` VARCHAR(191) NULL,
    `notas` TEXT NULL,
    `fecha_alta` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NULL,
    `unidad` VARCHAR(191) NULL,
    `precio_unitario` DOUBLE NOT NULL,
    `categoria` VARCHAR(191) NULL,
    `estatus` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Quote` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `folio` VARCHAR(191) NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_vencimiento` DATETIME(3) NOT NULL,
    `cliente_id` INTEGER NOT NULL,
    `contacto_cliente` VARCHAR(191) NULL,
    `condiciones_pago` TEXT NULL,
    `validez` VARCHAR(191) NULL,
    `notas` TEXT NULL,
    `subtotal` DOUBLE NOT NULL,
    `iva` DOUBLE NOT NULL,
    `total` DOUBLE NOT NULL,
    `estado` ENUM('Pendiente', 'Enviada', 'Aceptada', 'Rechazada', 'Vencida') NOT NULL DEFAULT 'Pendiente',
    `fecha_envio` DATETIME(3) NULL,
    `fecha_aceptacion` DATETIME(3) NULL,
    `fecha_rechazo` DATETIME(3) NULL,
    `creado_por_id` INTEGER NOT NULL,

    UNIQUE INDEX `Quote_folio_key`(`folio`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuoteItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cotizacion_id` INTEGER NOT NULL,
    `cantidad` DOUBLE NOT NULL,
    `unidad` VARCHAR(191) NULL,
    `descripcion` TEXT NOT NULL,
    `precio_unitario` DOUBLE NOT NULL,
    `subtotal` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cotizacion_id` INTEGER NOT NULL,
    `monto` DOUBLE NOT NULL,
    `fecha_pago` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `metodo_pago` VARCHAR(191) NOT NULL,
    `referencia` VARCHAR(191) NULL,
    `archivo_comprobante` VARCHAR(191) NULL,
    `estatus` ENUM('parcial', 'completo') NOT NULL DEFAULT 'completo',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Invoice` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cotizacion_id` INTEGER NOT NULL,
    `numero_factura` VARCHAR(191) NOT NULL,
    `fecha_factura` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `xml_url` VARCHAR(191) NULL,
    `pdf_url` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuoteEvent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cotizacion_id` INTEGER NOT NULL,
    `usuario_id` INTEGER NULL,
    `descripcion_evento` TEXT NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CompanyConfig` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `nombre_empresa` VARCHAR(191) NOT NULL,
    `rfc` VARCHAR(191) NULL,
    `telefono` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `direccion` TEXT NULL,
    `logo_url` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Quote` ADD CONSTRAINT `Quote_cliente_id_fkey` FOREIGN KEY (`cliente_id`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Quote` ADD CONSTRAINT `Quote_creado_por_id_fkey` FOREIGN KEY (`creado_por_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuoteItem` ADD CONSTRAINT `QuoteItem_cotizacion_id_fkey` FOREIGN KEY (`cotizacion_id`) REFERENCES `Quote`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_cotizacion_id_fkey` FOREIGN KEY (`cotizacion_id`) REFERENCES `Quote`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_cotizacion_id_fkey` FOREIGN KEY (`cotizacion_id`) REFERENCES `Quote`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuoteEvent` ADD CONSTRAINT `QuoteEvent_cotizacion_id_fkey` FOREIGN KEY (`cotizacion_id`) REFERENCES `Quote`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuoteEvent` ADD CONSTRAINT `QuoteEvent_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
