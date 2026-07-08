// tasaCambio.service.js - Servicio del Backend para Obtener Tipo de Cambio de Banguat y Fallbacks

const axios = require('axios');
const xml2js = require('xml2js');

/**
 * Obtiene el tipo de cambio compra/venta actual desde el Banco de Guatemala.
 * Si falla, retorna el tipo de cambio de contingencia local.
 */
async function obtenerTasaActual() {
  try {
    const xmlInput = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <TipoCambioDia xmlns="http://www.banguat.gob.gt/variables/ws/" />
  </soap:Body>
</soap:Envelope>`;

    const response = await axios.post(
      'https://www.banguat.gob.gt/variables/ws/tipocambio.asmx',
      xmlInput,
      {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'http://www.banguat.gob.gt/variables/ws/TipoCambioDia'
        },
        timeout: 4000
      }
    );

    const xmlResult = response.data;
    const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: true });
    const result = await parser.parseStringPromise(xmlResult);

    const envelope = result['soap:Envelope'] || result['SOAP-ENV:Envelope'] || result['Envelope'];
    const body = envelope ? (envelope['soap:Body'] || envelope['SOAP-ENV:Body'] || envelope['Body']) : null;
    const tcResponse = body ? (body['TipoCambioDiaResponse'] || body['ns1:TipoCambioDiaResponse']) : null;
    const tcResult = tcResponse ? tcResponse['TipoCambioDiaResult'] : null;
    const cambioDia = tcResult ? tcResult['CambioDia'] : null;
    const varItem = cambioDia ? cambioDia['Var'] : null;

    if (varItem && varItem.compra && varItem.venta) {
      return {
        compra: parseFloat(varItem.compra),
        venta: parseFloat(varItem.venta)
      };
    }
    throw new Error('Estructura XML de tasas inválida o incompleta');

  } catch (error) {
    console.warn('tasaCambio.service: Fallback de contingencia activo (Banguat inalcanzable):', error.message);
    return {
      compra: 7.73,
      venta: 7.78
    };
  }
}

module.exports = {
  obtenerTasaActual
};
