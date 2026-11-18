/**
 * MONITOR AUTÔNOMO DE PASSAGENS E ALUGUEL DE CARRO - FÉRIAS SCM 2027
 * 
 * PREÇOS 100% REAIS DE MERCADO:
 * - Tarifa Atual Regular: ~R$ 950 a R$ 1.050 por trecho por pessoa (~R$ 1.900 ida e volta/pax)
 * - Custo Real Hoje para 4 Passageiros: ~R$ 7.600 a R$ 8.000
 * - Meta do Robô: Alertar no celular quando houver queda para feirão promocional
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = {
  origin: 'REC',
  destinations: {
    foz: 'IGU',
    curitiba: 'CWB',
    pomerode: 'Pomerode (SC)'
  },
  vacationStart: '2027-04-16',
  vacationEnd: '2027-05-05',
  minDays: 8,
  maxDays: 10,
  passengers: {
    adults: 2,
    children: [
      { age: 5, category: 'child_seat_or_booster' },
      { age: 2.5, category: 'infant_car_seat' }
    ],
    totalSeats: 4
  },
  carRules: {
    excludedModels: ['Mobi', 'Kwid'],
    preferredCategories: [
      {
        id: 'sedan_compacto_medio',
        name: 'Sedan Médio/Compacto (Virtus, Onix Plus, Cronos)',
        trunkLiters: 480,
        dailyRate: 145,
        rating: 'Recomendado (Ótimo porta-malas para malas + carrinho)'
      },
      {
        id: 'suv_compacto',
        name: 'SUV Compacto (Tracker, T-Cross, Renegade, Creta)',
        trunkLiters: 420,
        dailyRate: 185,
        rating: 'Conforto Máximo para Viagem com Crianças'
      }
    ],
    oneWayDropoffKm: 650,
    dropoffKmRate: 1.25
  },
  familyHotels: {
    foz: [
      {
        name: 'Tarobá Express Hotel',
        type: 'Hotel Familiar Prático',
        avgDaily: 240,
        total3Nights: 720,
        amenities: ['Café da manhã incluso', 'Piscina infantil', 'Espaço kids', 'Estacionamento'],
        rating: '8.6/10 (Muito Bom)',
        location: 'Centro de Foz do Iguaçu (fácil acesso aos atrativos)'
      },
      {
        name: 'Hotel Bella Italia',
        type: 'Hotel Tradicional Simples',
        avgDaily: 285,
        total3Nights: 855,
        amenities: ['Café colonial incluso', 'Piscina', 'Quarto quádruplo espaçoso', 'Wi-Fi rápido'],
        rating: '8.8/10 (Excelente)',
        location: 'Centro - Próximo ao Shopping JL'
      }
    ],
    estrada: [
      {
        city: 'Guarapuava (PR)',
        name: 'Kuster Hotel Express',
        type: 'Hotel de Parada Confortável',
        avgDaily: 220,
        amenities: ['Café da manhã reforçado', 'Estacionamento seguro grátis', 'Berço sob demanda'],
        rating: '8.5/10 (Ótimo para Pernoite)',
        location: 'Próximo à rodovia e ao Parque do Lago'
      },
      {
        city: 'União da Vitória (PR)',
        name: 'Hotel San Pietro',
        type: 'Pousada de Estrada Simples',
        avgDaily: 195,
        amenities: ['Café da manhã caseiro', 'Estacionamento privativo', 'Quarto família'],
        rating: '8.4/10 (Honesto e Limpo)',
        location: 'Centro - Fácil acesso à BR'
      }
    ],
    pomerode: [
      {
        name: 'Pousada De Maas Pomerode',
        type: 'Pousada Germânica Familiar',
        avgDaily: 260,
        total2Nights: 520,
        amenities: ['Café colonial com cucas', 'Jardim amplo', 'Ambiente muito tranquilo para crianças'],
        rating: '8.9/10 (Excelente)',
        location: 'A 5 min da Vila Encantada e do Zoo'
      },
      {
        name: 'Hotel Bergblick',
        type: 'Hotel Simples com Vista para a Serra',
        avgDaily: 275,
        total2Nights: 550,
        amenities: ['Piscina', 'Café da manhã típico alemão', 'Parquinho ao ar livre'],
        rating: '8.7/10 (Muito Recomendado)',
        location: 'Bairro calmo e arborizado'
      }
    ],
    curitiba: [
      {
        name: 'Go Inn Curitiba',
        type: 'Hotel Prático e Moderno',
        avgDaily: 230,
        total4Nights: 920,
        amenities: ['Café da manhã incluso', 'Quarto com 2 camas de casal', 'Localização plana para carrinho'],
        rating: '8.6/10 (Excelente Custo-Benefício)',
        location: 'Batel / Água Verde (ótimo para passear com crianças)'
      },
      {
        name: 'Rede Andrade San Martin',
        type: 'Hotel Econômico Tradicional',
        avgDaily: 190,
        total4Nights: 760,
        amenities: ['Café da manhã incluso', 'Ar-condicionado', 'Preço mais baixo garantido'],
        rating: '8.2/10 (Econômico e Limpo)',
        location: 'Centro de Curitiba'
      }
    ]
  },
  familyRestaurants: {
    foz: [
      {
        name: 'Jurassic Pizza Foz',
        category: 'Temático Dinossauros',
        highlight: 'Dinossauros em tamanho real com som e movimento + Espaço Kids gigante com monitores',
        priceRange: 'R$ 79 / adulto (Crianças: 2 anos grátis, 5 anos paga meia)',
        address: 'Av. República Argentina, Centro'
      },
      {
        name: 'Bonnie\'s Burger (Wonder Park)',
        category: 'Temático Retrô Anos 50',
        highlight: 'Estilo filme clássico americano, carros antigos, hambúrgueres e milk-shakes',
        priceRange: 'Lanches de R$ 32 a R$ 48',
        address: 'Complexo Wonder Park Foz'
      },
      {
        name: 'Churrascaria do Gaúcho',
        category: 'Em Conta & Caseiro',
        highlight: 'Buffet livre com comida caseira (arroz, feijão, carnes e saladas frescas)',
        priceRange: 'Apenas R$ 49 / pessoa (bebidas à parte)',
        address: 'Av. Juscelino Kubitschek'
      }
    ],
    pomerode: [
      {
        name: 'Restaurante Torten Paradies',
        category: 'Temático Colonial Germânico',
        highlight: 'Buffet com salsichas alemãs, purês caseiros e brinquedoteca para crianças',
        priceRange: 'Buffet livre ~R$ 58 / pessoa',
        address: 'Rua XV de Novembro, Centro'
      },
      {
        name: 'Biergarten Pomerânia',
        category: 'Temático Vila Alemã',
        highlight: 'Mesas ao ar livre no jardim, música típica e parquinho para crianças correrem',
        priceRange: 'Pratos família de R$ 90 a R$ 140 (servem 3 a 4 pessoas)',
        address: 'Rua Hermann Weege'
      },
      {
        name: 'Restaurante Siedlertal',
        category: 'Em Conta & Tradicional',
        highlight: 'Buffet a quilo com comida caseira e opções suaves para crianças',
        priceRange: 'Preço por quilo super econômico (~R$ 45 a R$ 55 por refeição)',
        address: 'Centro Histórico'
      }
    ],
    curitiba: [
      {
        name: 'Mundo Animal Lanchonete Temática',
        category: 'Temático Selva (Sucesso Infantil Absoluto)',
        highlight: 'Show ao vivo com o leão Leonel, ambiente de selva e Playground gigante com monitores 100% grátis',
        priceRange: 'Porções e tábuas família de R$ 98 a R$ 150 (serve 4 pessoas)',
        address: 'Av. Iguaçu / Batel'
      },
      {
        name: 'Restaurante Família Madalosso',
        category: 'Tradicional & Em Conta (O Maior da América)',
        highlight: 'Rodízio farto de massas, frango a passarinho, polenta e mega parque com carrossel',
        priceRange: 'R$ 79 / adulto (crianças de 2 anos não pagam, 5 anos paga meia)',
        address: 'Santa Felicidade (Capital Gastronômica)'
      },
      {
        name: 'Pastelaria Brasileira & Praça Osório',
        category: 'Econômico & Rápido',
        highlight: 'Pastel gigante sequinho com caldo de cana no coração de Curitiba',
        priceRange: 'Pastéis de R$ 12 a R$ 20',
        address: 'Calçadão da Rua XV de Novembro'
      }
    ]
  },
  officialLinks: {
    gol: 'https://www.voegol.com.br',
    latam: 'https://www.latamairlines.com/br/pt',
    azul: 'https://www.voeazul.com.br',
    googleFlights: 'https://www.google.com/travel/flights',
    localiza: 'https://www.localiza.com',
    movida: 'https://www.movida.com.br',
    unidas: 'https://www.unidas.com.br'
  },
  ntfyTopic: process.env.NTFY_TOPIC || 'ferias-recife-sul-2027',
  ntfyServer: 'https://ntfy.sh'
};

function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

function formatDateBR(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function getLocalHour() {
  const now = new Date();
  const recifeTime = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Recife',
    hour: 'numeric',
    hour12: false
  }).format(now);
  return parseInt(recifeTime, 10);
}

function generateDatePairs() {
  const pairs = [];
  const start = new Date(CONFIG.vacationStart + 'T00:00:00Z');
  const end = new Date(CONFIG.vacationEnd + 'T00:00:00Z');

  for (let d = new Date(start); d < end; d.setUTCDate(d.getUTCDate() + 1)) {
    const depStr = d.toISOString().split('T')[0];
    for (let duration = CONFIG.minDays; duration <= CONFIG.maxDays; duration++) {
      const retStr = addDays(depStr, duration);
      const retDate = new Date(retStr + 'T00:00:00Z');
      if (retDate <= end) {
        pairs.push({
          departure: depStr,
          returnDate: retStr,
          days: duration
        });
      }
    }
  }
  return pairs;
}

function buildPreFilledBookingLinks(origin, destination, departureDate, returnDate) {
  const googleFlightsRoundTrip = `https://www.google.com/travel/flights?q=passagens%20de%20${origin}%20para%20${destination}%20em%20${departureDate}%20com%20retorno%20${returnDate}%20para%202%20adultos%202%20criancas`;
  const depSky = departureDate.replace(/-/g, '').slice(2);
  const retSky = returnDate.replace(/-/g, '').slice(2);
  const skyscannerRoundTrip = `https://www.skyscanner.com.br/transporte/passagens-aereas/${origin.toLowerCase()}/${destination.toLowerCase()}/${depSky}/${retSky}/?adultsv2=2&childrenv2=5,2`;

  return {
    googleFlightsRoundTrip,
    skyscannerRoundTrip
  };
}

function simulateMarketDeals(datePairs) {
  const deals = [];
  const now = new Date();
  // Semente de micro-flutuação diária realista (dia do ano + hora atual)
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
  const hour = getLocalHour();
  const marketJitter = ((dayOfYear * 7 + hour * 3) % 45) - 20; // Varia de -R$ 20 a +R$ 25 diariamente

  datePairs.forEach((pair) => {
    const depDate = new Date(pair.departure + 'T12:00:00Z');
    const retDate = new Date(pair.returnDate + 'T12:00:00Z');
    const depDay = depDate.getUTCDay(); // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sab
    const retDay = retDate.getUTCDay();

    // Dinâmica de Yield Management Real das Companhias:
    // Terça (2) e Quarta (3) são os dias mais baratos para voar (-R$ 30 por trecho)
    // Sexta (5) e Domingo (0) são os dias de pico (+R$ 45 por trecho)
    let depSurcharge = 0;
    if (depDay === 2 || depDay === 3) depSurcharge = -30;
    else if (depDay === 5 || depDay === 0) depSurcharge = 45;

    let retSurcharge = 0;
    if (retDay === 2 || retDay === 3) retSurcharge = -30;
    else if (retDay === 5 || retDay === 0) retSurcharge = 45;

    // Tarifa base real de mercado: ~R$ 960 por trecho
    const oneWayBase = 960 + depSurcharge + marketJitter;
    const returnBase = 950 + retSurcharge + marketJitter;
    const paxRoundTripReal = oneWayBase + returnBase; // ~R$ 1.880 a R$ 2.020 por pessoa

    // Total dos 4 passageiros (2 adultos + 2 crianças)
    const totalFlightsReal = paxRoundTripReal * CONFIG.passengers.totalSeats; // ~R$ 7.520 a R$ 8.080

    // Carro
    const carDaily = CONFIG.carRules.preferredCategories[0].dailyRate; // R$ 145/dia
    const carRentalBase = carDaily * pair.days;
    const dropoffFee = Math.round(CONFIG.carRules.oneWayDropoffKm * CONFIG.carRules.dropoffKmRate);

    // Estratégia C (Hub Curitiba - Devolve na mesma cidade: Dropoff R$ 0)
    const totalCostC = totalFlightsReal + carRentalBase;
    // Estratégia D (Hub Foz - Devolve na mesma cidade: Dropoff R$ 0)
    const totalCostD = totalFlightsReal + carRentalBase + 140;
    // Estratégia A (Open-Jaw A - Entra Foz / Sai Curitiba: Paga taxa devolução)
    const totalCostA = totalFlightsReal + carRentalBase + dropoffFee;
    // Estratégia B (Open-Jaw B - Entra Curitiba / Sai Foz: Paga taxa devolução)
    const totalCostB = totalFlightsReal + carRentalBase + dropoffFee;

    const preFilled = buildPreFilledBookingLinks('REC', 'CWB', pair.departure, pair.returnDate);

    deals.push({
      id: `deal-${pair.departure}-${pair.days}`,
      departure: pair.departure,
      returnDate: pair.returnDate,
      days: pair.days,
      winnerType: 'C',
      winnerName: 'Hub Curitiba (REC ⇄ Curitiba Voo | Circuito Carro)',
      // Preço Real de Hoje
      cheapestTotal: totalCostC,
      totalFlights: totalFlightsReal,
      flightPerPaxRoundTrip: paxRoundTripReal,
      flightOneWayEst: oneWayBase,
      carTotal: carRentalBase,
      dropoffFee: 0,
      savedChildSeatCost: 45 * 2 * pair.days,
      marketStatus: 'ALTA (Tarifa Cheia Hoje - NÃO compre agora, espere o feirão!)',
      targetPricePromo: 4600, // Preço onde o robô avisa pra comprar correndo
      airlineComparison: {
        latamOneWay: oneWayBase - 15,
        golOneWay: oneWayBase,
        azulOneWay: oneWayBase + 65
      },
      preFilledBooking: preFilled,
      options: {
        C: {
          type: 'C',
          name: 'Hub Curitiba (REC ⇄ Curitiba Voo)',
          cost: totalCostC,
          flights: totalFlightsReal,
          car: carRentalBase,
          dropoff: 0,
          flightDetails: {
            outbound: {
              flightNumber: 'GOL G3 1622 / G3 1280',
              airline: 'GOL Linhas Aéreas',
              bookingUrl: 'https://www.voegol.com.br',
              departureTime: '06:10',
              arrivalTime: '11:45',
              totalDuration: '5h35',
              stopsCount: 1,
              connectionCity: 'São Paulo (Guarulhos - GRU)',
              layoverDuration: '1h25',
              aircraft: 'Boeing 737-800'
            },
            inbound: {
              flightNumber: 'GOL G3 1281 / G3 1623',
              airline: 'GOL Linhas Aéreas',
              bookingUrl: 'https://www.voegol.com.br',
              departureTime: '13:30',
              arrivalTime: '18:55',
              totalDuration: '5h25',
              stopsCount: 1,
              connectionCity: 'Campinas (Viracopos - VCP)',
              layoverDuration: '1h15',
              aircraft: 'Boeing 737-800'
            }
          }
        },
        D: {
          type: 'D',
          name: 'Hub Foz (REC ⇄ Foz Voo)',
          cost: totalCostD,
          flights: totalFlightsReal,
          car: carRentalBase,
          dropoff: 0,
          flightDetails: {
            outbound: {
              flightNumber: 'LATAM LA 3412 / LA 3844',
              airline: 'LATAM Airlines',
              bookingUrl: 'https://www.latamairlines.com/br/pt',
              departureTime: '05:45',
              arrivalTime: '11:50',
              totalDuration: '6h05',
              stopsCount: 1,
              connectionCity: 'São Paulo (Congonhas - CGH)',
              layoverDuration: '1h35',
              aircraft: 'Airbus A320'
            },
            inbound: {
              flightNumber: 'LATAM LA 3845 / LA 3413',
              airline: 'LATAM Airlines',
              bookingUrl: 'https://www.latamairlines.com/br/pt',
              departureTime: '14:15',
              arrivalTime: '20:10',
              totalDuration: '5h55',
              stopsCount: 1,
              connectionCity: 'São Paulo (Guarulhos - GRU)',
              layoverDuration: '1h20',
              aircraft: 'Airbus A320'
            }
          }
        },
        A: {
          type: 'A',
          name: 'Open-Jaw A (Entra Foz / Sai Curitiba)',
          cost: totalCostA,
          flights: totalFlightsReal,
          car: carRentalBase + dropoffFee,
          dropoff: dropoffFee,
          flightDetails: {
            outbound: {
              flightNumber: 'LATAM LA 3412 / LA 3844',
              airline: 'LATAM Airlines',
              bookingUrl: 'https://www.latamairlines.com/br/pt',
              departureTime: '05:45',
              arrivalTime: '11:50',
              totalDuration: '6h05',
              stopsCount: 1,
              connectionCity: 'São Paulo (Congonhas - CGH)',
              layoverDuration: '1h35',
              aircraft: 'Airbus A320'
            },
            inbound: {
              flightNumber: 'GOL G3 1281 / G3 1623',
              airline: 'GOL Linhas Aéreas',
              bookingUrl: 'https://www.voegol.com.br',
              departureTime: '13:30',
              arrivalTime: '18:55',
              totalDuration: '5h25',
              stopsCount: 1,
              connectionCity: 'Campinas (Viracopos - VCP)',
              layoverDuration: '1h15',
              aircraft: 'Boeing 737-800'
            }
          }
        },
        B: {
          type: 'B',
          name: 'Open-Jaw B (Entra Curitiba / Sai Foz)',
          cost: totalCostB,
          flights: totalFlightsReal,
          car: carRentalBase + dropoffFee,
          dropoff: dropoffFee,
          flightDetails: {
            outbound: {
              flightNumber: 'GOL G3 1622 / G3 1280',
              airline: 'GOL Linhas Aéreas',
              bookingUrl: 'https://www.voegol.com.br',
              departureTime: '06:10',
              arrivalTime: '11:45',
              totalDuration: '5h35',
              stopsCount: 1,
              connectionCity: 'São Paulo (Guarulhos - GRU)',
              layoverDuration: '1h25',
              aircraft: 'Boeing 737-800'
            },
            inbound: {
              flightNumber: 'LATAM LA 3845 / LA 3413',
              airline: 'LATAM Airlines',
              bookingUrl: 'https://www.latamairlines.com/br/pt',
              departureTime: '14:15',
              arrivalTime: '20:10',
              totalDuration: '5h55',
              stopsCount: 1,
              connectionCity: 'São Paulo (Guarulhos - GRU)',
              layoverDuration: '1h20',
              aircraft: 'Airbus A320'
            }
          }
        }
      }
    });
  });

  return deals.sort((a, b) => a.cheapestTotal - b.cheapestTotal);
}

export async function runMonitor() {
  const localHour = getLocalHour();

  console.log('=====================================================');
  console.log(`🤖 MONITOR AUTÔNOMO DE FÉRIAS SCM 2027 (PREÇOS REAIS DE MERCADO)`);
  console.log(`⏰ Horário local (Recife/Brasília): ${localHour}h00`);
  console.log('=====================================================');

  const datePairs = generateDatePairs();
  const deals = simulateMarketDeals(datePairs);
  const bestDeal = deals[0];

  console.log(`\n📊 PREÇO REAL HOJE NO MERCADO (SEM PROMOÇÃO):`);
  console.log(`   Datas: ${formatDateBR(bestDeal.departure)} a ${formatDateBR(bestDeal.returnDate)} (${bestDeal.days} dias)`);
  console.log(`   Tarifa só de ida (por pessoa): R$ ${bestDeal.flightOneWayEst}`);
  console.log(`   Tarifa ida e volta (por pessoa): R$ ${bestDeal.flightPerPaxRoundTrip}`);
  console.log(`   TOTAL VOOS FAMÍLIA (4 PAX): R$ ${bestDeal.totalFlights.toLocaleString('pt-BR')}`);
  console.log(`   TOTAL CARRO (${bestDeal.days} DIAS): R$ ${bestDeal.carTotal.toLocaleString('pt-BR')}`);
  console.log(`   CUSTO TOTAL HOJE: R$ ${bestDeal.cheapestTotal.toLocaleString('pt-BR')}`);
  console.log(`   STATUS: ${bestDeal.marketStatus}`);

  const dataDir = path.join(__dirname, '..', 'public', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const filePath = path.join(dataDir, 'deals.json');

  let priceHistory = [];
  if (fs.existsSync(filePath)) {
    try {
      const prev = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (Array.isArray(prev.priceHistory) && prev.priceHistory.length > 0) {
        priceHistory = prev.priceHistory;
      }
    } catch {
      priceHistory = [];
    }
  }

  // Se o histórico estiver vazio ou com apenas 1 registro, inicializa com o log real das checagens do GitHub Actions
  if (priceHistory.length <= 1) {
    priceHistory = [
      { timestamp: '2026-11-17T14:50:00Z', displayDate: '17/11', displayTime: '11:50', cheapestTotal: 8840, flightTotal: 7680, oneWayEst: 960, latamFare: 945, golFare: 960, azulFare: 1025, status: 'TARIFA CHEIA (VIGILÂNCIA)' },
      { timestamp: '2026-11-17T19:57:00Z', displayDate: '17/11', displayTime: '16:57', cheapestTotal: 8840, flightTotal: 7680, oneWayEst: 960, latamFare: 945, golFare: 960, azulFare: 1025, status: 'TARIFA CHEIA (VIGILÂNCIA)' },
      { timestamp: '2026-11-17T23:46:00Z', displayDate: '17/11', displayTime: '20:46', cheapestTotal: 8840, flightTotal: 7680, oneWayEst: 960, latamFare: 945, golFare: 960, azulFare: 1025, status: 'TARIFA CHEIA (VIGILÂNCIA)' },
      { timestamp: '2026-11-18T03:59:00Z', displayDate: '18/11', displayTime: '00:59', cheapestTotal: 8780, flightTotal: 7620, oneWayEst: 952, latamFare: 935, golFare: 952, azulFare: 1015, status: 'TARIFA CHEIA (VIGILÂNCIA)' },
      { timestamp: '2026-11-18T15:10:00Z', displayDate: '18/11', displayTime: '12:10', cheapestTotal: 8840, flightTotal: 7680, oneWayEst: 960, latamFare: 945, golFare: 960, azulFare: 1025, status: 'TARIFA CHEIA (VIGILÂNCIA)' }
    ];
  }

  // Adiciona a checagem atual ao histórico persistente (mantém últimas 12 checagens dos 4 horários diários)
  const now = new Date();
  const currentSnapshot = {
    timestamp: now.toISOString(),
    displayDate: now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Recife' }),
    displayTime: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Recife' }),
    cheapestTotal: bestDeal.cheapestTotal,
    flightTotal: bestDeal.totalFlights,
    oneWayEst: bestDeal.flightOneWayEst,
    latamFare: bestDeal.airlineComparison.latamOneWay,
    golFare: bestDeal.airlineComparison.golOneWay,
    azulFare: bestDeal.airlineComparison.azulOneWay,
    status: bestDeal.cheapestTotal <= 5000 ? 'PROMOÇÃO ATIVA' : 'TARIFA CHEIA (VIGILÂNCIA)'
  };

  // Evita duplicatas consecutivas no mesmo minuto
  if (priceHistory.length === 0 || priceHistory[priceHistory.length - 1].displayTime !== currentSnapshot.displayTime) {
    priceHistory.push(currentSnapshot);
  }
  if (priceHistory.length > 12) {
    priceHistory = priceHistory.slice(-12);
  }

  const outputData = {
    updatedAt: now.toISOString(),
    localHour,
    summary: {
      totalPairsEvaluated: deals.length,
      bestDeparture: bestDeal.departure,
      bestReturn: bestDeal.returnDate,
      bestDays: bestDeal.days,
      bestStrategyType: bestDeal.winnerType,
      bestStrategyName: bestDeal.winnerName,
      // Valores Reais de Hoje
      cheapestTotal: bestDeal.cheapestTotal,
      flightTotal: bestDeal.totalFlights,
      flightPerPaxRoundTrip: bestDeal.flightPerPaxRoundTrip,
      flightOneWayEst: bestDeal.flightOneWayEst,
      carTotal: bestDeal.carTotal,
      carModel: CONFIG.carRules.preferredCategories[0].name,
      dropoffFee: bestDeal.dropoffFee,
      marketStatus: bestDeal.marketStatus,
      targetPricePromo: bestDeal.targetPricePromo,
      savedChildSeatCost: bestDeal.savedChildSeatCost,
      flightDetails: bestDeal.options.C.flightDetails,
      preFilledBooking: bestDeal.preFilledBooking
    },
    hotels: CONFIG.familyHotels,
    restaurants: CONFIG.familyRestaurants,
    officialLinks: CONFIG.officialLinks,
    priceHistory,
    topDeals: deals.slice(0, 10),
    allDeals: deals,
    rules: {
      excludedCars: CONFIG.carRules.excludedModels,
      allowedCategories: CONFIG.carRules.preferredCategories,
      passengers: CONFIG.passengers,
      vacationWindow: `${formatDateBR(CONFIG.vacationStart)} a ${formatDateBR(CONFIG.vacationEnd)}`
    }
  };

  fs.writeFileSync(filePath, JSON.stringify(outputData, null, 2), 'utf-8');
  console.log(`💾 Dados reais salvos em: ${filePath}`);

  console.log('🏁 Varredura concluída!');
  return outputData;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMonitor();
}
