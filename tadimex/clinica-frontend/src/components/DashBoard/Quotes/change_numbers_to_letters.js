export const changeNumbersToLetters = (numero) => {
  const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const especiales = {
    11: 'ONCE',
    12: 'DOCE',
    13: 'TRECE',
    14: 'CATORCE',
    15: 'QUINCE',
    16: 'DIECISÉIS',
    17: 'DIECISIETE',
    18: 'DIECIOCHO',
    19: 'DIECINUEVE'
  };
  const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  const convertirGrupo = (n) => {
    let resultado = '';

    // Maneja centenas
    if (n >= 100) {
      if (n === 100) return 'CIEN';
      resultado += centenas[Math.floor(n / 100)] + ' ';
      n = n % 100;
    }

    // Maneja casos especiales de 11-19
    if (n in especiales) {
      return resultado + especiales[n];
    }

    // Maneja decenas
    if (n >= 10) {
      resultado += decenas[Math.floor(n / 10)];
      n = n % 10;
      if (n > 0) {
        resultado += ' Y ';
      }
    }

    // Maneja unidades
    if (n > 0) {
      if (n === 1 && resultado === '') {
        resultado += 'UNO';
      } else {
        resultado += unidades[n];
      }
    }

    return resultado.trim();
  };

  const convertirHastaMillon = (numero) => {
    if (numero === 0) return 'CERO';
    let resultado = '';

    // Maneja millones
    if (numero >= 1000000) {
      if (Math.floor(numero / 1000000) === 1) {
        resultado += 'UN MILLÓN ';
      } else {
        resultado += convertirGrupo(Math.floor(numero / 1000000)) + ' MILLONES ';
      }
      numero = numero % 1000000;
    }

    // Maneja miles
    if (numero >= 1000) {
      if (Math.floor(numero / 1000) === 1) {
        resultado += 'MIL ';
      } else {
        resultado += convertirGrupo(Math.floor(numero / 1000)) + ' MIL ';
      }
      numero = numero % 1000;
    }

    // Maneja el resto
    if (numero > 0) {
      resultado += convertirGrupo(numero);
    }

    return resultado.trim();
  };

  // Separar parte entera y decimal
  const [parteEntera, parteDecimal = '00'] = numero.toFixed(2).split('.');
  const numeroEntero = parseInt(parteEntera);

  if (numeroEntero > 999999999) {
    return 'Número demasiado grande';
  }

  let resultado = convertirHastaMillon(numeroEntero);
  
  // Agregar "PESOS" y centavos
  resultado = resultado + ' PESOS ' + parteDecimal + '/100 MXN.';

  return resultado.trim();
};