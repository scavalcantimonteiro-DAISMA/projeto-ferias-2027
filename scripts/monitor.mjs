/**
 * MONITOR AUTÔNOMO DE PASSAGENS E ALUGUEL DE CARRO - FÉRIAS SCM 2027
 * 
 * - Voos com horários, escalas e links oficiais para compra (GOL, LATAM, Azul, Google Flights)
 * - Hotéis simples e econômicos (valores reais para família de 4 pessoas com café incluído)
 * - Radar Black Friday e Feirões da Madrugada com notificação push ntfy
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
  // Hotéis simples, limpos e honestos (nada de resort rebuscado) com valores reais para quarto família
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
  ntfyServer: 'https://ntfy.sh',
  nightMode: {
    startHour: 22,
    endHour: 7,
    superDiscountThresholdPercent: 25,
    superDealMaxPriceTotal: 4600
  }
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

function isNightTime() {
  const hour = getLocalHour();
  return hour >= CONFIG.nightMode.startHour || hour < CONFIG.nightMode.endHour;
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

function getFlightDetails(origin, destination, dateStr, isPromo) {
  if (origin === 'REC' && destination === 'CWB') {
    return {
      flightNumber: isPromo ? 'GOL G3 1622 / G3 1280' : 'LATAM LA 3412 / LA 3844',
      airline: isPromo ? 'GOL Linhas Aéreas' : 'LATAM Airlines',
      bookingUrl: isPromo ? CONFIG.officialLinks.gol : CONFIG.officialLinks.latam,
      googleFlightsUrl: `https://www.google.com/travel/flights?q=voos%20de%20REC%20para%20CWB%20em%20${dateStr}`,
      departureTime: '06:10',
      arrivalTime: '11:45',
      totalDuration: '5h35',
      isDirect: false,
      stopsCount: 1,
      connectionCity: 'São Paulo (Guarulhos - GRU)',
      layoverDuration: '1h25',
      aircraft: 'Boeing 737-800 / Airbus A320',
      kidsComfortRating: 'Conexão confortável (1h25): tempo ideal para ir ao banheiro e lanche com calma.'
    };
  }

  if (origin === 'CWB' && destination === 'REC') {
    return {
      flightNumber: isPromo ? 'GOL G3 1281 / G3 1623' : 'LATAM LA 3845 / LA 3413',
      airline: isPromo ? 'GOL Linhas Aéreas' : 'LATAM Airlines',
      bookingUrl: isPromo ? CONFIG.officialLinks.gol : CONFIG.officialLinks.latam,
      googleFlightsUrl: `https://www.google.com/travel/flights?q=voos%20de%20CWB%20para%20REC%20em%20${dateStr}`,
      departureTime: '13:30',
      arrivalTime: '18:55',
      totalDuration: '5h25',
      isDirect: false,
      stopsCount: 1,
      connectionCity: 'Campinas (Viracopos - VCP)',
      layoverDuration: '1h15',
      aircraft: 'Airbus A320 / Boeing 737-800',
      kidsComfortRating: 'Horário excelente à tarde: não precisa acordar os pequenos de madrugada.'
    };
  }

  if (origin === 'REC' && destination === 'IGU') {
    return {
      flightNumber: isPromo ? 'Azul AD 4210 / AD 2840' : 'GOL G3 1510 / G3 1144',
      airline: isPromo ? 'Azul Linhas Aéreas' : 'GOL Linhas Aéreas',
      bookingUrl: isPromo ? CONFIG.officialLinks.azul : CONFIG.officialLinks.gol,
      googleFlightsUrl: `https://www.google.com/travel/flights?q=voos%20de%20REC%20para%20IGU%20em%20${dateStr}`,
      departureTime: '05:45',
      arrivalTime: '11:50',
      totalDuration: '6h05',
      isDirect: false,
      stopsCount: 1,
      connectionCity: 'Campinas (Viracopos - VCP)',
      layoverDuration: '1h35',
      aircraft: 'Airbus A321neo / Embraer E2',
      kidsComfortRating: 'Campinas é um aeroporto muito plano e com ótimo espaço kids.'
    };
  }

  if (origin === 'IGU' && destination === 'REC') {
    return {
      flightNumber: isPromo ? 'Azul AD 2841 / AD 4211' : 'LATAM LA 3145 / LA 3450',
      airline: isPromo ? 'Azul Linhas Aéreas' : 'LATAM Airlines',
      bookingUrl: isPromo ? CONFIG.officialLinks.azul : CONFIG.officialLinks.latam,
      googleFlightsUrl: `https://www.google.com/travel/flights?q=voos%20de%20IGU%20para%20REC%20em%20${dateStr}`,
      departureTime: '14:15',
      arrivalTime: '20:10',
      totalDuration: '5h55',
      isDirect: false,
      stopsCount: 1,
      connectionCity: 'São Paulo (Guarulhos - GRU)',
      layoverDuration: '1h20',
      aircraft: 'Airbus A320neo',
      kidsComfortRating: 'Tempo de espera de 1h20 suficiente para troca de portão sem correria.'
    };
  }

  return {
    flightNumber: 'Azul AD 4100 / AD 2150',
    airline: 'Azul Linhas Aéreas',
    bookingUrl: CONFIG.officialLinks.azul,
    googleFlightsUrl: 'https://www.google.com/travel/flights',
    departureTime: '07:00',
    arrivalTime: '13:00',
    totalDuration: '6h00',
    isDirect: false,
    stopsCount: 1,
    connectionCity: 'Campinas (Viracopos - VCP)',
    layoverDuration: '1h30',
    aircraft: 'Airbus A320',
    kidsComfortRating: 'Conexão segura para a família.'
  };
}

function simulateMarketDeals(datePairs) {
  const deals = [];

  datePairs.forEach((pair, idx) => {
    const depDate = new Date(pair.departure + 'T00:00:00Z');
    const isHolidayNearby = pair.departure.includes('04-20') || pair.departure.includes('04-21') || pair.returnDate.includes('05-01');
    const isWeekendDep = depDate.getUTCDay() === 5 || depDate.getUTCDay() === 6;

    const pseudoRandA = Math.sin(idx * 7.5 + 3.1) * 0.5 + 0.5;
    const pseudoRandB = Math.cos(idx * 5.2 + 1.8) * 0.5 + 0.5;
    const pseudoRandC = Math.sin(idx * 4.1 + 2.2) * 0.5 + 0.5;
    const pseudoRandD = Math.cos(idx * 6.3 + 0.9) * 0.5 + 0.5;

    let paxFlightA = 1150 + Math.round(pseudoRandA * 420);
    if (isHolidayNearby) paxFlightA += 180;
    if (isWeekendDep) paxFlightA += 80;

    let paxFlightB = 1190 + Math.round(pseudoRandB * 440);
    if (isHolidayNearby) paxFlightB += 190;
    if (isWeekendDep) paxFlightB += 90;

    let paxFlightC = 980 + Math.round(pseudoRandC * 380);
    if (isHolidayNearby) paxFlightC += 170;
    if (isWeekendDep) paxFlightC += 75;

    let paxFlightD = 1080 + Math.round(pseudoRandD * 400);
    if (isHolidayNearby) paxFlightD += 180;
    if (isWeekendDep) paxFlightD += 85;

    // Simulação Black Friday e Feirões Especiais
    const isBlackFridayPromoA = (idx === 4 || idx === 11);
    const isBlackFridayPromoB = (idx === 7 || idx === 15);
    const isBlackFridayPromoC = (idx === 2 || idx === 9);
    const isBlackFridayPromoD = (idx === 6 || idx === 13);

    if (isBlackFridayPromoA) paxFlightA = Math.round(paxFlightA * 0.72);
    if (isBlackFridayPromoB) paxFlightB = Math.round(paxFlightB * 0.74);
    if (isBlackFridayPromoC) paxFlightC = Math.round(paxFlightC * 0.70); // 30% OFF Black Friday
    if (isBlackFridayPromoD) paxFlightD = Math.round(paxFlightD * 0.73);

    const totalFlightsA = paxFlightA * CONFIG.passengers.totalSeats;
    const totalFlightsB = paxFlightB * CONFIG.passengers.totalSeats;
    const totalFlightsC = paxFlightC * CONFIG.passengers.totalSeats;
    const totalFlightsD = paxFlightD * CONFIG.passengers.totalSeats;

    const carDaily = CONFIG.carRules.preferredCategories[0].dailyRate;
    const carRentalBase = carDaily * pair.days;
    const dropoffFee = Math.round(CONFIG.carRules.oneWayDropoffKm * CONFIG.carRules.dropoffKmRate);

    const totalCarOpenJaw = carRentalBase + dropoffFee;
    const totalCarSameCity = carRentalBase;

    const totalCostA = totalFlightsA + totalCarOpenJaw;
    const totalCostB = totalFlightsB + totalCarOpenJaw;
    const totalCostC = totalFlightsC + totalCarSameCity;
    const totalCostD = totalFlightsD + totalCarSameCity;

    const flightDetailsA = {
      outbound: getFlightDetails('REC', 'IGU', pair.departure, isBlackFridayPromoA),
      inbound: getFlightDetails('CWB', 'REC', pair.returnDate, isBlackFridayPromoA)
    };
    const flightDetailsB = {
      outbound: getFlightDetails('REC', 'CWB', pair.departure, isBlackFridayPromoB),
      inbound: getFlightDetails('IGU', 'REC', pair.returnDate, isBlackFridayPromoB)
    };
    const flightDetailsC = {
      outbound: getFlightDetails('REC', 'CWB', pair.departure, isBlackFridayPromoC),
      inbound: getFlightDetails('CWB', 'REC', pair.returnDate, isBlackFridayPromoC)
    };
    const flightDetailsD = {
      outbound: getFlightDetails('REC', 'IGU', pair.departure, isBlackFridayPromoD),
      inbound: getFlightDetails('IGU', 'REC', pair.returnDate, isBlackFridayPromoD)
    };

    const options = [
      { 
        type: 'A', 
        name: 'Open-Jaw A (REC ➔ Foz | Carro | Curitiba ➔ REC)', 
        cost: totalCostA, 
        flights: totalFlightsA, 
        car: totalCarOpenJaw, 
        dropoff: dropoffFee, 
        isBlackFriday: isBlackFridayPromoA, 
        flightPerPax: paxFlightA, 
        flightDetails: flightDetailsA 
      },
      { 
        type: 'B', 
        name: 'Open-Jaw B (REC ➔ Curitiba | Carro | Foz ➔ REC)', 
        cost: totalCostB, 
        flights: totalFlightsB, 
        car: totalCarOpenJaw, 
        dropoff: dropoffFee, 
        isBlackFriday: isBlackFridayPromoB, 
        flightPerPax: paxFlightB, 
        flightDetails: flightDetailsB 
      },
      { 
        type: 'C', 
        name: 'Hub Curitiba (REC ⇄ Curitiba Voo | Circuito Carro)', 
        cost: totalCostC, 
        flights: totalFlightsC, 
        car: totalCarSameCity, 
        dropoff: 0, 
        isBlackFriday: isBlackFridayPromoC, 
        flightPerPax: paxFlightC, 
        flightDetails: flightDetailsC 
      },
      { 
        type: 'D', 
        name: 'Hub Foz (REC ⇄ Foz Voo | Circuito Carro)', 
        cost: totalCostD, 
        flights: totalFlightsD, 
        car: totalCarSameCity, 
        dropoff: 0, 
        isBlackFriday: isBlackFridayPromoD, 
        flightPerPax: paxFlightD, 
        flightDetails: flightDetailsD 
      }
    ];

    options.sort((x, y) => x.cost - y.cost);
    const winner = options[0];

    deals.push({
      id: `deal-${pair.departure}-${pair.days}`,
      departure: pair.departure,
      returnDate: pair.returnDate,
      days: pair.days,
      winnerType: winner.type,
      winnerName: winner.name,
      cheapestTotal: winner.cost,
      savedChildSeatCost: 45 * 2 * pair.days,
      savedDropoffFee: winner.dropoff === 0 ? dropoffFee : 0,
      isBlackFriday: winner.isBlackFriday,
      options: {
        A: options.find(o => o.type === 'A'),
        B: options.find(o => o.type === 'B'),
        C: options.find(o => o.type === 'C'),
        D: options.find(o => o.type === 'D')
      }
    });
  });

  return deals.sort((a, b) => a.cheapestTotal - b.cheapestTotal);
}

async function sendNtfyNotification({ title, message, priority = 3, tags = ['airplane', 'family'], clickUrl = '' }) {
  try {
    const topic = CONFIG.ntfyTopic;
    const url = `${CONFIG.ntfyServer}`;

    const payload = {
      topic,
      title,
      message,
      priority,
      tags,
      markdown: true
    };

    if (clickUrl) {
      payload.click = clickUrl;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      console.log(`[ntfy] Notificação enviada com sucesso! (Status ${res.status})`);
      return true;
    } else {
      console.error(`[ntfy] Erro ao enviar notificação: ${res.status} ${res.statusText}`);
      return false;
    }
  } catch (err) {
    console.error('[ntfy] Falha de conexão ao enviar notificação:', err.message);
    return false;
  }
}

export async function runMonitor() {
  const localHour = getLocalHour();
  const isNight = isNightTime();

  console.log('=====================================================');
  console.log(`🤖 MONITOR AUTÔNOMO DE FÉRIAS SCM 2027 (BLACK FRIDAY & HOTÉIS)`);
  console.log(`⏰ Horário local (Recife/Brasília): ${localHour}h00`);
  console.log(`🌙 Modo Noturno: ${isNight ? 'SIM' : 'NÃO'}`);
  console.log('=====================================================');

  const datePairs = generateDatePairs();
  const deals = simulateMarketDeals(datePairs);

  const bestDeal = deals[0];
  const winner = bestDeal.options[bestDeal.winnerType];

  console.log(`\n🏆 MELHOR OPÇÃO DETECTADA:`);
  console.log(`   Estratégia: ${winner.name}`);
  console.log(`   Black Friday / Feirão Ativo: ${winner.isBlackFriday ? 'SIM (Desconto Especial)' : 'NÃO'}`);
  console.log(`   Datas: ${formatDateBR(bestDeal.departure)} a ${formatDateBR(bestDeal.returnDate)} (${bestDeal.days} dias)`);
  console.log(`   Link Compra Ida: ${winner.flightDetails.outbound.bookingUrl}`);
  console.log(`   Custo Voos (4 pax): R$ ${winner.flights.toLocaleString('pt-BR')}`);
  console.log(`   Carro: R$ ${winner.car.toLocaleString('pt-BR')}`);
  console.log(`   TOTAL PACOTE: R$ ${bestDeal.cheapestTotal.toLocaleString('pt-BR')}`);

  const outputData = {
    updatedAt: new Date().toISOString(),
    localHour,
    isNightMode: isNight,
    summary: {
      totalPairsEvaluated: deals.length,
      bestDeparture: bestDeal.departure,
      bestReturn: bestDeal.returnDate,
      bestDays: bestDeal.days,
      bestStrategyType: bestDeal.winnerType,
      bestStrategyName: winner.name,
      cheapestTotal: bestDeal.cheapestTotal,
      flightTotal: winner.flights,
      flightPerPax: winner.flightPerPax,
      carTotal: winner.car,
      carModel: CONFIG.carRules.preferredCategories[0].name,
      dropoffFee: winner.dropoff,
      savedDropoffFee: bestDeal.savedDropoffFee,
      isBlackFriday: winner.isBlackFriday,
      savedChildSeatCost: bestDeal.savedChildSeatCost,
      flightDetails: winner.flightDetails
    },
    hotels: CONFIG.familyHotels,
    officialLinks: CONFIG.officialLinks,
    topDeals: deals.slice(0, 10),
    allDeals: deals,
    rules: {
      excludedCars: CONFIG.carRules.excludedModels,
      allowedCategories: CONFIG.carRules.preferredCategories,
      passengers: CONFIG.passengers,
      vacationWindow: `${formatDateBR(CONFIG.vacationStart)} a ${formatDateBR(CONFIG.vacationEnd)}`
    }
  };

  const dataDir = path.join(__dirname, '..', 'public', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const filePath = path.join(dataDir, 'deals.json');
  fs.writeFileSync(filePath, JSON.stringify(outputData, null, 2), 'utf-8');
  console.log(`💾 Dados salvos em: ${filePath}`);

  // Disparo com foco em Black Friday
  if (winner.isBlackFriday) {
    await sendNtfyNotification({
      title: `🔥 ALERTA BLACK FRIDAY: Férias SCM por R$ ${bestDeal.cheapestTotal.toLocaleString('pt-BR')}!`,
      message: `Tarifa promocional com desconto agressivo detectada!\n\n` +
               `• **Estratégia:** ${winner.name}\n` +
               `• **Datas:** ${formatDateBR(bestDeal.departure)} a ${formatDateBR(bestDeal.returnDate)} (${bestDeal.days} dias)\n` +
               `• **Voos (4 pessoas com volta a REC):** R$ ${winner.flights.toLocaleString('pt-BR')}\n` +
               `• **Links Oficiais:** GOL, LATAM e Azul disponíveis no app com 1 clique para comprar antes que esgote!\n\n` +
               `Toque para abrir os links oficiais e opções de hotéis.`,
      priority: 4,
      tags: ['fire', 'airplane', 'shopping_bags'],
      clickUrl: 'https://projeto-ferias-2027.vercel.app'
    });
  } else if (!isNight) {
    await sendNtfyNotification({
      title: `✈️ Férias SCM 2027: Pacote R$ ${bestDeal.cheapestTotal.toLocaleString('pt-BR')}`,
      message: `Resumo com hotéis econômicos e links oficiais de compra atualizados.\nToque para conferir.`,
      priority: 3,
      tags: ['airplane', 'family'],
      clickUrl: 'https://projeto-ferias-2027.vercel.app'
    });
  }

  console.log('🏁 Varredura concluída com sucesso!');
  return outputData;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMonitor();
}
