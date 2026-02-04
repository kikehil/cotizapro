const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
};

const quoteTemplate = (quote, company) => {
  const itemsHtml = quote.items.map(item => `
    <tr class="border-b border-gray-100">
      <td class="py-3 text-center">${item.cantidad}</td>
      <td class="py-3 text-center">${item.unidad || 'PZA'}</td>
      <td class="py-3">${item.descripcion}</td>
      <td class="py-3 text-right">${formatCurrency(item.precio_unitario)}</td>
      <td class="py-3 text-right font-bold">${formatCurrency(item.subtotal)}</td>
    </tr>
  `).join('');

  // Priorizar el logo en Base64 si existe (para PDF), si no usar la ruta relativa (para Web)
  const logoSrc = company.logoBase64 || '/img/logo.png';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Cotización ${quote.folio}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @page { size: A4; margin: 0; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; -webkit-print-color-adjust: exact; }
        .text-blue-600 { color: #2563eb !important; }
        .bg-blue-600 { background-color: #2563eb !important; }
      </style>
    </head>
    <body class="p-10">
      <div class="flex justify-between items-start mb-10 pb-10 border-b border-gray-100">
        <div class="flex items-center">
          <img src="${logoSrc}" class="h-24 w-auto mr-6" style="max-height: 100px;" onerror="this.style.display='none'">
          <div>
            <h1 class="text-3xl font-black text-slate-800 tracking-tighter">${company.nombre_empresa}</h1>
            <p class="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">${company.rfc || ''}</p>
          </div>
        </div>
        <div class="text-right">
          <div class="bg-blue-600 text-white px-6 py-2 rounded-lg inline-block mb-4">
            <h2 class="text-xl font-black uppercase tracking-widest">Cotización</h2>
          </div>
          <p class="text-2xl font-bold text-blue-600">${quote.folio}</p>
          <div class="mt-4 text-sm text-gray-500 font-medium">
            <p>Solicitante: ${quote.solicitante || 'No especificado'}</p>
            <p>Fecha: ${new Date(quote.fecha).toLocaleDateString('es-MX')}</p>
          </div>
        </div>
      </div>

      <div class="mb-10 p-4 bg-gray-50 rounded-lg border">
        <h3 class="font-bold text-gray-700 mb-2 border-b pb-1">CLIENTE</h3>
        <p class="font-semibold text-lg">${quote.cliente.nombre}</p>
        <p class="text-sm text-gray-600">RFC: ${quote.cliente.rfc || 'N/A'}</p>
        <p class="text-sm text-gray-600">${quote.cliente.direccion || ''}</p>
        <p class="text-sm text-gray-600">Atención: ${quote.contacto_cliente || quote.cliente.contacto_principal || ''}</p>
      </div>

      <table class="w-full mb-10">
        <thead>
          <tr class="bg-blue-600 text-white">
            <th class="py-2 px-1 text-center w-16">CANT</th>
            <th class="py-2 px-1 text-center w-20">UNIDAD</th>
            <th class="py-2 px-1 text-left">DESCRIPCIÓN</th>
            <th class="py-2 px-1 text-right w-32">P. UNITARIO</th>
            <th class="py-2 px-1 text-right w-32">IMPORTE</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="flex justify-between">
        <div class="w-1/2">
          <div class="mb-4">
            <h4 class="font-bold text-gray-700 text-sm">NOTAS Y CONDICIONES</h4>
            <p class="text-xs text-gray-600 whitespace-pre-line">${quote.notas || 'Sin notas adicionales.'}</p>
          </div>
          <div class="mb-4">
            <h4 class="font-bold text-gray-700 text-sm">CONDICIONES DE PAGO</h4>
            <p class="text-xs text-gray-600">${quote.condiciones_pago || 'N/A'}</p>
          </div>
          <div class="mb-4">
            <h4 class="font-bold text-gray-700 text-sm">VALIDEZ</h4>
            <p class="text-xs text-gray-600">${quote.validez || 'N/A'}</p>
          </div>
        </div>
        <div class="w-1/3">
          <div class="flex justify-between py-1 border-b">
            <span class="font-semibold">Subtotal:</span>
            <span>${formatCurrency(quote.subtotal)}</span>
          </div>
          <div class="flex justify-between py-1 border-b">
            <span class="font-semibold">IVA (16%):</span>
            <span>${formatCurrency(quote.iva)}</span>
          </div>
          ${quote.retencion > 0 ? `
          <div class="flex justify-between py-1 border-b">
            <span class="font-semibold">RET ISR (1.25%):</span>
            <span>${formatCurrency(quote.retencion)}</span>
          </div>
          ` : ''}
          <div class="flex justify-between py-2 text-xl font-bold text-blue-600">
            <span>TOTAL:</span>
            <span>${formatCurrency(quote.total)}</span>
          </div>
        </div>
      </div>

      <div class="mt-20 pt-10 border-t flex justify-between items-center text-xs text-gray-500">
        <div>
          <p>Esta es una cotización informativa, sujeta a cambios sin previo aviso.</p>
        </div>
        <div class="text-center">
          <p>Puedes aceptar esta cotización en:</p>
          <p class="text-blue-500 font-bold">${process.env.APP_URL}/cotizacion/${quote.id}/public</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { quoteTemplate };

