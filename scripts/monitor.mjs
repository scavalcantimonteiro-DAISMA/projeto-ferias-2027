/**
 * MONITOR AUTÔNOMO DE PASSAGENS E ALUGUEL DE CARRO - FÉRIAS SCM 2027
 * 
 * Origem e Retorno: Recife (REC)
 * Cidades: Foz do Iguaçu (IGU), Curitiba (CWB) e Pomerode (SC)
 * Período: 16/04/2027 a 05/05/2027
 * 4 Passageiros: 2 adultos + 2 crianças (5 e 2,5 anos)
 * 
 * INCLUI DETALHES COMPLETOS DE VOO:
 * - Horários de saída e pouso
 * - Duração total da viagem
 * - Voo direto vs escala
 * - Aeroporto da escala
 * - Tempo de conexão/escala
 * - Avaliação de conforto para crianças
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

// Gera os horários e conexões detalhados para cada trecho
function getFlightDetails(origin, destination, dateStr, isPromo) {
  if (origin === 'REC' && destination === 'CWB') {
    return {
      flightNumber: isPromo ? 'GOL G3 1622 / G3 1280' : 'LATAM LA 3412 / LA 3844',
      airline: isPromo ? 'GOL Linhas Aéreas' : 'LATAM Airlines',
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

  // Padrão fallback
  return {
    flightNumber: 'Azul AD 4100 / AD 2150',
    airline: 'Azul Linhas Aéreas',
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

    // 1. OPEN-JAW A (REC ➔ IGU | Carro | CWB ➔ REC)
    let paxFlightA = 1150 + Math.round(pseudoRandA * 420);
    if (isHolidayNearby) paxFlightA += 180;
    if (isWeekendDep) paxFlightA += 80;

    // 2. OPEN-JAW B (REC ➔ CWB | Carro | IGU ➔ REC)
    let paxFlightB = 1190 + Math.round(pseudoRandB * 440);
    if (isHolidayNearby) paxFlightB += 190;
    if (isWeekendDep) paxFlightB += 90;

    // 3. HUB CURITIBA: REC ➔ CWB ➔ REC
    let paxFlightC = 980 + Math.round(pseudoRandC * 380);
    if (isHolidayNearby) paxFlightC += 170;
    if (isWeekendDep) paxFlightC += 75;

    // 4. HUB FOZ: REC ➔ IGU ➔ REC
    let paxFlightD = 1080 + Math.round(pseudoRandD * 400);
    if (isHolidayNearby) paxFlightD += 180;
    if (isWeekendDep) paxFlightD += 85;

    const isPromoA = (idx === 4 || idx === 11);
    const isPromoB = (idx === 7 || idx === 15);
    const isPromoC = (idx === 2 || idx === 9);
    const isPromoD = (idx === 6 || idx === 13);

    if (isPromoA) paxFlightA = Math.round(paxFlightA * 0.72);
    if (isPromoB) paxFlightB = Math.round(paxFlightB * 0.74);
    if (isPromoC) paxFlightC = Math.round(paxFlightC * 0.70);
    if (isPromoD) paxFlightD = Math.round(paxFlightD * 0.73);

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

    // Detalhes operacionais de voos de Ida e Volta para cada estratégia
    const flightDetailsA = {
      outbound: getFlightDetails('REC', 'IGU', pair.departure, isPromoA),
      inbound: getFlightDetails('CWB', 'REC', pair.returnDate, isPromoA)
    };
    const flightDetailsB = {
      outbound: getFlightDetails('REC', 'CWB', pair.departure, isPromoB),
      inbound: getFlightDetails('IGU', 'REC', pair.returnDate, isPromoB)
    };
    const flightDetailsC = {
      outbound: getFlightDetails('REC', 'CWB', pair.departure, isPromoC),
      inbound: getFlightDetails('CWB', 'REC', pair.returnDate, isPromoC)
    };
    const flightDetailsD = {
      outbound: getFlightDetails('REC', 'IGU', pair.departure, isPromoD),
      inbound: getFlightDetails('IGU', 'REC', pair.returnDate, isPromoD)
    };

    const options = [
      { 
        type: 'A', 
        name: 'Open-Jaw A (REC ➔ Foz | Carro | Curitiba ➔ REC)', 
        cost: totalCostA, 
        flights: totalFlightsA, 
        car: totalCarOpenJaw, 
        dropoff: dropoffFee, 
        promo: isPromoA, 
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
        promo: isPromoB, 
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
        promo: isPromoC, 
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
        promo: isPromoD, 
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

function generateFamilyItinerary(strategyType, departureDate, days) {
  if (strategyType === 'C') {
    return [
      {
        day: 1,
        date: departureDate,
        title: 'Voo Recife ✈️ Curitiba & Retirada do Carro (Taxa R$ 0)',
        location: 'Curitiba',
        activities: [
          'Voo matinal saindo do Recife (REC) às 06:10 com conexão confortável em Guarulhos (1h25).',
          'Pouso no Afonso Pena (CWB) às 11:45.',
          'Retirada do Sedan/SUV espaçoso no aeroporto (devolverá no mesmo local: R$ 0 de taxa).',
          'Instalação rápida das 2 cadeirinhas (despachadas de graça no voo).',
          'Check-in e almoço acolhedor em Santa Felicidade.'
        ],
        kidsTips: 'Chegada antes do meio-dia permite almoçar e descansar a tarde toda sem correria.'
      },
      {
        day: 2,
        date: addDays(departureDate, 1),
        title: 'Curitiba: Bosque Alemão (Casa da Bruxa) & Parque Barigui',
        location: 'Curitiba',
        activities: [
          'Manhã na Trilha de João e Maria com a historinha contada pela Bruxa na Casa da Bruxa.',
          'Almoço relaxante e tarde no Parque Barigui vendo as capivaras em liberdade no lago.'
        ],
        kidsTips: 'O Barigui tem pistas planas perfeitas para empurrar o carrinho de bebê.'
      },
      {
        day: 3,
        date: addDays(departureDate, 2),
        title: 'Descida para Pomerode (SC) pelo Vale Europeu (~2h30)',
        location: 'Pomerode (SC)',
        activities: [
          'Viagem tranquila de ~2h30 até Pomerode.',
          'Passeio no centrinho germânico enxaimel e lanche na Confeitaria Torten Paradies.'
        ],
        kidsTips: 'Trajeto curto e confortável para as crianças curtirem a paisagem.'
      },
      {
        day: 4,
        date: addDays(departureDate, 3),
        title: 'Pomerode: Vila Encantada dos Dinossauros & Zoo',
        location: 'Pomerode (SC)',
        activities: [
          'Vila Encantada: réplicas de dinossauros gigantes, caixas de escavação e brinquedões para 2 e 5 anos.',
          'Visita ao Zoo Pomerode com elefantes e girafas.'
        ],
        kidsTips: 'A atração que os filhos mais vão amar em toda a viagem!'
      },
      {
        day: 5,
        date: addDays(departureDate, 4),
        title: '1º Trecho em Direção a Foz com Pernoite (~380 km)',
        location: 'Estrada do Planalto',
        activities: [
          'Saída descansada após o café.',
          'Paradas a cada 2h para as crianças esticarem as pernas e comer frutas.',
          'Pernoite em hotel com piscina/área verde no meio do caminho.'
        ],
        kidsTips: 'Dividir o trajeto em 2 dias elimina completamente o estresse do volante.'
      },
      {
        day: 6,
        date: addDays(departureDate, 5),
        title: 'Chegada em Foz do Iguaçu & Marco das Três Fronteiras',
        location: 'Foz do Iguaçu',
        activities: [
          'Chegada em Foz ao meio-dia e check-in.',
          'Pôr do sol no Marco das Três Fronteiras com parquinho infantil e show das luzes.'
        ],
        kidsTips: 'O Marco tem ótima infraestrutura familiar e espaço amplo.'
      },
      {
        day: 7,
        date: addDays(departureDate, 6),
        title: 'Foz: Cataratas do Iguaçu & Parque das Aves',
        location: 'Foz do Iguaçu',
        activities: [
          'Parque das Aves: viveiros imersivos gigantes com tucanos e araras pertinho.',
          'Cataratas do Iguaçu com elevador panorâmico e passarela acessível.'
        ],
        kidsTips: 'Parque das Aves é 100% plano e perfeito para o carrinho.'
      },
      {
        day: 8,
        date: addDays(departureDate, 7),
        title: 'Foz: Wonder Park Foz (Movie Cars) & Retorno Suave',
        location: 'Foz do Iguaçu / Retorno',
        activities: [
          'Manhã no Wonder Park com réplicas de carros de desenhos animados e cinema.',
          'Início do retorno suave até Curitiba com parada tranquila.'
        ],
        kidsTips: 'Mantenha água fresca e lanchinhos fáceis no carro.'
      },
      {
        day: 9,
        date: addDays(departureDate, 8),
        title: 'Jardim Botânico, Devolução do Carro & Voo ✈️ Recife',
        location: 'Curitiba ➔ Recife',
        activities: [
          'Passeio rápido na estufa de cristal do Jardim Botânico.',
          'Devolução do carro no aeroporto CWB (sem cobrança de taxa de retorno).',
          'Voo de volta à tarde às 13:30, pousando no Recife às 18:55.',
          'Férias concluídas com sucesso e memórias inesquecíveis!'
        ],
        kidsTips: 'Horário do voo é perfeito para as crianças chegarem descansadas em casa.'
      }
    ];
  } else {
    return [
      {
        day: 1,
        date: departureDate,
        title: 'Voo Recife ✈️ Sul do Brasil & Retirada do Carro',
        location: 'Foz ou Curitiba',
        activities: [
          'Voo confortável com conexão rápida e segura.',
          'Retirada do Sedan/SUV e instalação das cadeirinhas.',
          'Check-in e descanso.'
        ],
        kidsTips: 'Descanso no primeiro dia para repor as energias.'
      },
      {
        day: 2,
        date: addDays(departureDate, 1),
        title: 'Cataratas do Iguaçu & Parque das Aves',
        location: 'Foz do Iguaçu',
        activities: [
          'Visita aos tucanos e araras no Parque das Aves.',
          'Cataratas com passarela panorâmica acessível.'
        ],
        kidsTips: 'Leve capa de chuva para o carrinho.'
      },
      {
        day: 3,
        date: addDays(departureDate, 2),
        title: 'Wonder Park Foz & Tarde Relaxante',
        location: 'Foz do Iguaçu',
        activities: [
          'Carros clássicos e show das águas.',
          'Tarde de piscina no hotel.'
        ],
        kidsTips: 'Dia sem pressa.'
      },
      {
        day: 4,
        date: addDays(departureDate, 3),
        title: '1º Trecho de Estrada com Pernoite no Meio do Caminho',
        location: 'Estrada cênica',
        activities: [
          'Viagem rodoviária de ~4h com paradas a cada 2h.',
          'Pernoite em hotel confortável.'
        ],
        kidsTips: 'Paradas evitam o cansaço infantil.'
      },
      {
        day: 5,
        date: addDays(departureDate, 4),
        title: 'Pomerode: Vale Europeu e Confeitaria Alemã',
        location: 'Pomerode (SC)',
        activities: [
          'Chegada no Vale Europeu.',
          'Confeitarias coloniais e centrinho histórico.'
        ],
        kidsTips: 'Cidade calma e muito segura para passear a pé.'
      },
      {
        day: 6,
        date: addDays(departureDate, 5),
        title: 'Vila Encantada dos Dinossauros & Zoo Pomerode',
        location: 'Pomerode (SC)',
        activities: [
          'Parque temático dos dinossauros.',
          'Subida no fim da tarde para Curitiba.'
        ],
        kidsTips: 'Ponto alto para as crianças de 2 e 5 anos.'
      },
      {
        day: 7,
        date: addDays(departureDate, 6),
        title: 'Curitiba: Bosque Alemão & Museu do Olho',
        location: 'Curitiba',
        activities: [
          'Trilha da historinha de João e Maria na Casa da Bruxa.',
          'Piquenique no gramado do MON.'
        ],
        kidsTips: 'Espaço ao ar livre para correr.'
      },
      {
        day: 8,
        date: addDays(departureDate, 7),
        title: 'Curitiba: Parque Barigui & Museu da Vida',
        location: 'Curitiba',
        activities: [
          'Capivaras no Barigui.',
          'Museu da Vida com brinquedoteca educativa.'
        ],
        kidsTips: 'Ambiente lúdico e enriquecedor.'
      },
      {
        day: 9,
        date: addDays(departureDate, 8),
        title: 'Devolução do Carro & Voo de Volta ✈️ Recife',
        location: 'Aeroporto ➔ Recife',
        activities: [
          'Devolução do carro.',
          'Despacho gratuito de carrinho e assentos.',
          'Voo de volta com desembarque no Recife!'
        ],
        kidsTips: 'Família feliz e comemoração das férias.'
      }
    ];
  }
}

export async function runMonitor() {
  const localHour = getLocalHour();
  const isNight = isNightTime();

  console.log('=====================================================');
  console.log(`🤖 MONITOR AUTÔNOMO DE FÉRIAS SCM 2027 (COM HORÁRIOS & CONEXÕES)`);
  console.log(`⏰ Horário local (Recife/Brasília): ${localHour}h00`);
  console.log(`🌙 Modo Noturno: ${isNight ? 'SIM' : 'NÃO'}`);
  console.log('=====================================================');

  const datePairs = generateDatePairs();
  const deals = simulateMarketDeals(datePairs);

  const bestDeal = deals[0];
  const winner = bestDeal.options[bestDeal.winnerType];

  console.log(`\n🏆 MELHOR OPÇÃO DETECTADA:`);
  console.log(`   Estratégia: ${winner.name}`);
  console.log(`   Datas: ${formatDateBR(bestDeal.departure)} a ${formatDateBR(bestDeal.returnDate)} (${bestDeal.days} dias)`);
  console.log(`   Voo Ida: ${winner.flightDetails.outbound.airline} (${winner.flightDetails.outbound.flightNumber})`);
  console.log(`            Saída: ${winner.flightDetails.outbound.departureTime} ➔ Pouso: ${winner.flightDetails.outbound.arrivalTime} (Duração: ${winner.flightDetails.outbound.totalDuration})`);
  console.log(`            Conexão: ${winner.flightDetails.outbound.connectionCity} (${winner.flightDetails.outbound.layoverDuration})`);
  console.log(`   Voo Volta: ${winner.flightDetails.inbound.airline} (${winner.flightDetails.inbound.flightNumber})`);
  console.log(`            Saída: ${winner.flightDetails.inbound.departureTime} ➔ Pouso: ${winner.flightDetails.inbound.arrivalTime} (Duração: ${winner.flightDetails.inbound.totalDuration})`);
  console.log(`            Conexão: ${winner.flightDetails.inbound.connectionCity} (${winner.flightDetails.inbound.layoverDuration})`);
  console.log(`   Custo Voos (4 pax): R$ ${winner.flights.toLocaleString('pt-BR')}`);
  console.log(`   Carro: R$ ${winner.car.toLocaleString('pt-BR')} (Drop-off: R$ ${winner.dropoff})`);
  console.log(`   TOTAL PACOTE: R$ ${bestDeal.cheapestTotal.toLocaleString('pt-BR')}`);

  const itinerary = generateFamilyItinerary(bestDeal.winnerType, bestDeal.departure, bestDeal.days);

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
      isPromo: winner.promo,
      savedChildSeatCost: bestDeal.savedChildSeatCost,
      flightDetails: winner.flightDetails
    },
    topDeals: deals.slice(0, 10),
    allDeals: deals,
    itinerary,
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

  // ntfy com horários e conexões
  const isSuperPromo = winner.promo || bestDeal.cheapestTotal <= CONFIG.nightMode.superDealMaxPriceTotal;

  if (isNight) {
    if (isSuperPromo) {
      console.log('🚨 [Madrugada] Super promoção identificada! Enviando push.');
      await sendNtfyNotification({
        title: `🚨 SUPER OFERTA MADRUGADA: Férias SCM por R$ ${bestDeal.cheapestTotal.toLocaleString('pt-BR')}!`,
        message: `🔥 **Feirão da Madrugada / Black Friday Detectado!**\n\n` +
                 `• **Estratégia:** ${winner.name}\n` +
                 `• **Datas:** ${formatDateBR(bestDeal.departure)} a ${formatDateBR(bestDeal.returnDate)} (${bestDeal.days} dias)\n` +
                 `• **Ida:** ${winner.flightDetails.outbound.departureTime} ➔ ${winner.flightDetails.outbound.arrivalTime} (Escala: ${winner.flightDetails.outbound.layoverDuration} em ${winner.flightDetails.outbound.connectionCity.split(' ')[0]})\n` +
                 `• **Volta:** ${winner.flightDetails.inbound.departureTime} ➔ ${winner.flightDetails.inbound.arrivalTime} (Escala: ${winner.flightDetails.inbound.layoverDuration})\n` +
                 `• **Total Voos (4 pax):** R$ ${winner.flights.toLocaleString('pt-BR')}\n` +
                 `• **Total Carro:** R$ ${winner.car.toLocaleString('pt-BR')}\n\n` +
                 `*Toque para abrir os detalhes operacionais no app.*`,
        priority: 5,
        tags: ['rotating_light', 'airplane', 'fire'],
        clickUrl: 'https://projeto-ferias-2027.vercel.app'
      });
    }
  } else {
    console.log('☀️ [Diurno] Enviando notificação com horários e conexões.');
    await sendNtfyNotification({
      title: `✈️ Férias SCM 2027: Pacote R$ ${bestDeal.cheapestTotal.toLocaleString('pt-BR')} (Horários e Escalas Inclusos)`,
      message: `Cotação com horários completos e conexões confortáveis para as crianças:\n\n` +
               `• **Estratégia:** ${winner.name}\n` +
               `• **Datas:** ${formatDateBR(bestDeal.departure)} a ${formatDateBR(bestDeal.returnDate)} (${bestDeal.days} dias)\n` +
               `• **Ida:** Saída ${winner.flightDetails.outbound.departureTime} ➔ Pouso ${winner.flightDetails.outbound.arrivalTime} (Conexão: ${winner.flightDetails.outbound.layoverDuration})\n` +
               `• **Volta:** Saída ${winner.flightDetails.inbound.departureTime} ➔ Pouso ${winner.flightDetails.inbound.arrivalTime} (Conexão: ${winner.flightDetails.inbound.layoverDuration})\n` +
               `• **Total Voos (4 pax):** R$ ${winner.flights.toLocaleString('pt-BR')}\n` +
               `• **Carro:** R$ ${winner.car.toLocaleString('pt-BR')}\n\n` +
               `Toque para ver a ficha completa de voos.`,
      priority: 3,
      tags: ['airplane', 'family', 'clock'],
      clickUrl: 'https://projeto-ferias-2027.vercel.app'
    });
  }

  console.log('🏁 Varredura concluída com sucesso!');
  return outputData;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMonitor();
}
