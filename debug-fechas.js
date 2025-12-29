require('dotenv').config();
const mongoose = require('mongoose');
const Bill = require('./models/bill.model');

async function debug() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
    
    // Obtener una factura reciente
    const factura = await Bill.findOne({ estado: 'pagada' }).lean().sort({ pagadoEn: -1 });
    
    if (!factura) {
      console.log('No hay facturas pagadas');
      await mongoose.connection.close();
      return;
    }
    
    const pagadoEn = factura.pagadoEn;
    console.log('\n📊 ANÁLISIS DE UNA FACTURA:');
    console.log('ISO String:', pagadoEn.toISOString());
    console.log('Timestamp:', pagadoEn.getTime());
    
    const crDate = new Date(pagadoEn).toLocaleDateString('en-CA', { timeZone: 'America/Costa_Rica' });
    const crTime = new Date(pagadoEn).toLocaleTimeString('en-US', { timeZone: 'America/Costa_Rica' });
    console.log('En CR:', crDate, crTime);
    
    // Ahora probar: si selecciono esa fecha como "hoy" en el formulario
    console.log('\n🧪 SI SELECCIONO ESTA FECHA EN EL FORMULARIO:');
    
    // Mi función actual
    function dateStringToStartOfDayCR(dateString) {
      const [year, month, day] = dateString.split('-').map(Number);
      const d = new Date(Date.UTC(year, month - 1, day - 1, 18, 0, 0, 0));
      return d;
    }
    
    function dateStringToEndOfDayCR(dateString) {
      const [year, month, day] = dateString.split('-').map(Number);
      const d = new Date(Date.UTC(year, month - 1, day, 17, 59, 59, 999));
      return d;
    }
    
    const desde = dateStringToStartOfDayCR(crDate);
    const hasta = dateStringToEndOfDayCR(crDate);
    
    console.log('Desde (UTC):', desde.toISOString());
    console.log('Hasta (UTC):', hasta.toISOString());
    
    // ¿Caería la factura en este rango?
    const estaDentro = pagadoEn >= desde && pagadoEn <= hasta;
    console.log('¿Factura cae en este rango?', estaDentro);
    
    // Contar cuántas facturas caen en este rango
    const facturas = await Bill.find({
      estado: 'pagada',
      pagadoEn: { $gte: desde, $lte: hasta }
    });
    
    console.log(`\nFacturas en el rango ${crDate}:`, facturas.length);
    if (facturas.length > 0) {
      facturas.forEach((f, i) => {
        const fcrDate = new Date(f.pagadoEn).toLocaleDateString('en-CA', { timeZone: 'America/Costa_Rica' });
        const fcrTime = new Date(f.pagadoEn).toLocaleTimeString('en-US', { timeZone: 'America/Costa_Rica' });
        console.log(`  ${i+1}. ${fcrDate} ${fcrTime} - Total: ₡${f.total}`);
      });
    }
    
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

debug();
