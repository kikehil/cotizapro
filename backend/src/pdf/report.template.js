const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
};

const reportTemplate = (quotes, company) => {
  const rowsHtml = quotes.map(quote => {
    const invoice = quote.invoices && quote.invoices.length > 0 ? quote.invoices[0] : null;
    return `
      <tr class="border-b border-gray-100">
        <td class="py-2 text-sm font-bold text-blue-600">${quote.folio}</td>
        <td class="py-2 text-sm">${new Date(quote.fecha).toLocaleDateString('es-MX')}</td>
        <td class="py-2 text-sm">${quote.cliente.nombre}</td>
        <td class="py-2 text-sm text-right">${formatCurrency(quote.total)}</td>
        <td class="py-2 text-sm text-center">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusStyle(quote.estado)}">
            ${quote.estado}
          </span>
        </td>
        <td class="py-2 text-sm text-center font-medium">${invoice ? invoice.numero_factura : '---'}</td>
        <td class="py-2 text-sm text-center">
          ${invoice ? `
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${getInvoiceStatusStyle(invoice.estatus)}">
              ${invoice.estatus}
            </span>
          ` : '---'}
        </td>
      </tr>
    `;
  }).join('');

  function getStatusStyle(status) {
    switch(status) {
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'Enviada': return 'bg-blue-100 text-blue-800';
      case 'Aceptada': return 'bg-green-100 text-green-800';
      case 'Rechazada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function getInvoiceStatusStyle(status) {
    switch(status) {
      case 'Pagada': return 'bg-green-100 text-green-800';
      case 'Pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  const logoSrc = company.logoBase64 || '/img/logo.png';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Reporte de Cotizaciones</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @page { size: A4; margin: 0; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; -webkit-print-color-adjust: exact; }
      </style>
    </head>
    <body class="p-10">
      <div class="flex justify-between items-center mb-10 pb-6 border-b-2 border-slate-800">
        <div class="flex items-center">
          <img src="${logoSrc}" class="h-16 w-auto mr-4" onerror="this.style.display='none'">
          <div>
            <h1 class="text-2xl font-black text-slate-800 tracking-tighter">${company.nombre_empresa}</h1>
            <p class="text-[10px] text-gray-500 font-bold uppercase tracking-widest">${company.rfc || ''}</p>
          </div>
        </div>
        <div class="text-right">
          <h2 class="text-xl font-black text-blue-600 uppercase">Reporte de Cotizaciones</h2>
          <p class="text-xs text-gray-500">Generado el: ${new Date().toLocaleString('es-MX')}</p>
        </div>
      </div>

      <table class="w-full">
        <thead>
          <tr class="bg-slate-800 text-white text-[10px] uppercase tracking-wider">
            <th class="py-3 px-2 text-left">Folio</th>
            <th class="py-3 px-2 text-left">Fecha</th>
            <th class="py-3 px-2 text-left">Cliente</th>
            <th class="py-3 px-2 text-right">Total</th>
            <th class="py-3 px-2 text-center">Estado Cot.</th>
            <th class="py-3 px-2 text-center">No. Factura</th>
            <th class="py-3 px-2 text-center">Estado Fac.</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div class="mt-10 pt-4 border-t flex justify-end">
        <div class="text-right">
          <p class="text-sm font-bold text-gray-700">Resumen de Totales:</p>
          <p class="text-2xl font-black text-blue-600">${formatCurrency(quotes.reduce((sum, q) => sum + q.total, 0))}</p>
          <p class="text-[10px] text-gray-400 uppercase font-bold mt-1">Total de ${quotes.length} cotizaciones</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { reportTemplate };

