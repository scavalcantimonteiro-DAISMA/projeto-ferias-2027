/**
 * MONITOR AUTÔNOMO DE PASSAGENS E ALUGUEL DE CARRO - FÉRIAS 2027
 * 
 * Origem e Destino Final: Recife (REC)
 * Cidades no Roteiro: Foz do Iguaçu (IGU), Curitiba (CWB) e Pomerode (SC)
 * Período de férias: 16/04/2027 a 05/05/2027 (8 a 10 dias)
 * Passageiros: 2 adultos + 2 crianças (5 e 2,5 anos) -> 4 assentos
 * 
 * 4 ESTRATÉGIAS ANALISADAS SIMULTANEAMENTE (TODAS COM VOLTA PARA RECIFE):
 * 1. Open-Jaw A: Voo REC ➔ Foz | Estrada até Curitiba | Voo Curitiba ➔ REC (Drop-off carro pago)
 * 2. Open-Jaw B: Voo REC ➔ Curitiba | Estrada até Foz | Voo Foz ➔ REC (Drop-off carro pago)
 * 3. Hub Curitiba (CWB Id/Volta): Voo REC ➔ CWB ➔ REC | Carro pega e devolve em Curitiba (TAXA RETORNO R$ 0!)
 * 4. Hub Foz (IGU Id/Volta): Voo REC ➔ IGU ➔ REC | Carro pega e devolve em Foz (TAXA RETORNO R$ 0!)
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
    dropoffKmRate: 1.25 // ~R$ 813 taxa se devolver em cidade diferente
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

    // 1. OPEN-JAW A (REC ➔ IGU | Carro até CWB | CWB ➔ REC)
    let paxFlightA = 1150 + Math.round(pseudoRandA * 420);
    if (isHolidayNearby) paxFlightA += 180;
    if (isWeekendDep) paxFlightA += 80;

    // 2. OPEN-JAW B (REC ➔ CWB | Carro até IGU | IGU ➔ REC)
    let paxFlightB = 1190 + Math.round(pseudoRandB * 440);
    if (isHolidayNearby) paxFlightB += 190;
    if (isWeekendDep) paxFlightB += 90;

    // 3. HUB CURITIBA: REC ➔ CWB ➔ REC (Ida e volta mesma cidade costuma ter desconto RT)
    let paxFlightC = 980 + Math.round(pseudoRandC * 380);
    if (isHolidayNearby) paxFlightC += 170;
    if (isWeekendDep) paxFlightC += 75;

    // 4. HUB FOZ: REC ➔ IGU ➔ REC
    let paxFlightD = 1080 + Math.round(pseudoRandD * 400);
    if (isHolidayNearby) paxFlightD += 180;
    if (isWeekendDep) paxFlightD += 85;

    // Promoções simuladas
    const isPromoA = (idx === 4 || idx === 11);
    const isPromoB = (idx === 7 || idx === 15);
    const isPromoC = (idx === 2 || idx === 9);
    const isPromoD = (idx === 6 || idx === 13);

    if (isPromoA) paxFlightA = Math.round(paxFlightA * 0.72);
    if (isPromoB) paxFlightB = Math.round(paxFlightB * 0.74);
    if (isPromoC) paxFlightC = Math.round(paxFlightC * 0.70); // Curitiba com frequência alta
    if (isPromoD) paxFlightD = Math.round(paxFlightD * 0.73);

    const totalFlightsA = paxFlightA * CONFIG.passengers.totalSeats;
    const totalFlightsB = paxFlightB * CONFIG.passengers.totalSeats;
    const totalFlightsC = paxFlightC * CONFIG.passengers.totalSeats;
    const totalFlightsD = paxFlightD * CONFIG.passengers.totalSeats;

    // Carro
    const carDaily = CONFIG.carRules.preferredCategories[0].dailyRate;
    const carRentalBase = carDaily * pair.days;
    const dropoffFee = Math.round(CONFIG.carRules.oneWayDropoffKm * CONFIG.carRules.dropoffKmRate);

    // No Open-Jaw (cidades diferentes), PAGA taxa de devolução
    const totalCarOpenJaw = carRentalBase + dropoffFee;
    // No Hub Único (mesma cidade), TAXA DE DEVOLUÇÃO É ZERO!
    const totalCarSameCity = carRentalBase; // R$ 0 de dropoff!

    const totalCostA = totalFlightsA + totalCarOpenJaw;
    const totalCostB = totalFlightsB + totalCarOpenJaw;
    const totalCostC = totalFlightsC + totalCarSameCity; // Mega economia de carro
    const totalCostD = totalFlightsD + totalCarSameCity;

    // Identifica o vencedor entre as 4 opções
    const options = [
      { type: 'A', name: 'Open-Jaw A (REC ➔ Foz | Carro | Curitiba ➔ REC)', cost: totalCostA, flights: totalFlightsA, car: totalCarOpenJaw, dropoff: dropoffFee, promo: isPromoA, flightPerPax: paxFlightA, airline: 'Azul / GOL' },
      { type: 'B', name: 'Open-Jaw B (REC ➔ Curitiba | Carro | Foz ➔ REC)', cost: totalCostB, flights: totalFlightsB, car: totalCarOpenJaw, dropoff: dropoffFee, promo: isPromoB, flightPerPax: paxFlightB, airline: 'LATAM / Azul' },
      { type: 'C', name: 'Hub Curitiba (REC ⇄ Curitiba Voo | Circuito Carro)', cost: totalCostC, flights: totalFlightsC, car: totalCarSameCity, dropoff: 0, promo: isPromoC, flightPerPax: paxFlightC, airline: 'GOL / LATAM (Voo RT Direto/Conexão curta)' },
      { type: 'D', name: 'Hub Foz (REC ⇄ Foz Voo | Circuito Carro)', cost: totalCostD, flights: totalFlightsD, car: totalCarSameCity, dropoff: 0, promo: isPromoD, flightPerPax: paxFlightD, airline: 'Azul / GOL' }
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

// Disparo de Notificação Push via ntfy usando JSON UTF-8
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

// Roteiro Inteligente Adaptado para o Formato Vencedor
function generateFamilyItinerary(strategyType, departureDate, days) {
  if (strategyType === 'C') {
    // HUB CURITIBA: Voo REC ⇄ CWB (Zero taxa de retorno no carro)
    return [
      {
        day: 1,
        date: departureDate,
        title: 'Voo Recife ✈️ Curitiba & Retirada do Carro (Taxa Retorno R$ 0)',
        location: 'Curitiba',
        activities: [
          'Chegada no aeroporto Afonso Pena (CWB).',
          'Retirada do carro Sedan/SUV (devolverá no mesmo aeroporto, taxa R$ 0).',
          'Instalação rápida das 2 cadeirinhas (trazidas gratuitamente no voo).',
          'Check-in no hotel e jantar tranquilo em Santa Felicidade.'
        ],
        kidsTips: 'Chegada tranquila sem correria.'
      },
      {
        day: 2,
        date: addDays(departureDate, 1),
        title: 'Curitiba: Bosque Alemão (Casa da Bruxa) & Parque Barigui',
        location: 'Curitiba',
        activities: [
          'Manhã na Trilha de João e Maria com historinha contada pela Bruxa.',
          'Tarde no Parque Barigui vendo as capivaras livres no lago.'
        ],
        kidsTips: 'O Barigui tem pistas planas perfeitas para carrinho de bebê.'
      },
      {
        day: 3,
        date: addDays(departureDate, 2),
        title: 'Descida para Pomerode (SC) pelo Vale Europeu (~2h30)',
        location: 'Pomerode (SC)',
        activities: [
          'Estrada rápida até Pomerode.',
          'Passeio no centrinho germânico enxaimel e Confeitaria Torten Paradies.'
        ],
        kidsTips: 'Trajeto curto e confortável para as crianças.'
      },
      {
        day: 4,
        date: addDays(departureDate, 3),
        title: 'Pomerode: Vila Encantada dos Dinossauros & Zoo',
        location: 'Pomerode (SC)',
        activities: [
          'Vila Encantada: dinossauros gigantes e caixas de areia arqueológicas (ideal para 2 e 5 anos).',
          'Zoo Pomerode com elefantes e girafas.'
        ],
        kidsTips: 'A atração favorita das crianças nessa idade!'
      },
      {
        day: 5,
        date: addDays(departureDate, 4),
        title: '1º Trecho em Direção a Foz: Parada com Pernoite (~380 km)',
        location: 'Estrada do Planalto',
        activities: [
          'Saída matinal descansada.',
          'Paradas a cada 2h para as crianças esticarem as pernas e lanche.',
          'Pernoite em hotel acolhedor no meio do caminho.'
        ],
        kidsTips: 'Pernoitar no meio do caminho evita cansaço dos pequenos.'
      },
      {
        day: 6,
        date: addDays(departureDate, 5),
        title: 'Chegada em Foz do Iguaçu & Marco das Três Fronteiras',
        location: 'Foz do Iguaçu',
        activities: [
          'Chegada em Foz ao meio-dia e check-in.',
          'Pôr do sol no Marco das Três Fronteiras com parquinho e apresentações.'
        ],
        kidsTips: 'O Marco tem ótima estrutura familiar e restaurantes.'
      },
      {
        day: 7,
        date: addDays(departureDate, 6),
        title: 'Foz: Cataratas do Iguaçu & Parque das Aves',
        location: 'Foz do Iguaçu',
        activities: [
          'Parque das Aves: viveiros imersivos de araras e tucanos.',
          'Cataratas do Iguaçu com elevador panorâmico e passarela acessível.'
        ],
        kidsTips: 'Parque das Aves é 100% plano e perfeito para carrinho.'
      },
      {
        day: 8,
        date: addDays(departureDate, 7),
        title: 'Foz: Wonder Park Foz (Movie Cars) & Retorno Suave',
        location: 'Foz do Iguaçu / Retorno',
        activities: [
          'Manhã no Wonder Park vendo os carros de cinema.',
          'Início do retorno para Curitiba com parada tranquila.'
        ],
        kidsTips: 'Mantenha lanches e água no carro.'
      },
      {
        day: 9,
        date: addDays(departureDate, 8),
        title: 'Jardim Botânico, Devolução do Carro & Voo de Volta ✈️ Recife',
        location: 'Curitiba ➔ Recife',
        activities: [
          'Passeio rápido no Jardim Botânico de Curitiba.',
          'Devolução do carro no aeroporto CWB sem cobrança de taxa de retorno (R$ 0).',
          'Despacho gratuito de carrinho e cadeirinhas.',
          'Voo de volta para Recife com a família!'
        ],
        kidsTips: 'Devolução no mesmo local economizou mais de R$ 800!'
      }
    ];
  } else {
    // Open-Jaw A ou B
    return [
      {
        day: 1,
        date: departureDate,
        title: 'Voo Recife ✈️ Sul do Brasil & Retirada do Carro',
        location: 'Foz ou Curitiba',
        activities: [
          'Chegada e retirada do Sedan/SUV.',
          'Instalação rápida das cadeirinhas.',
          'Check-in e descanso.'
        ],
        kidsTips: 'Chegada tranquila para repor energia.'
      },
      {
        day: 2,
        date: addDays(departureDate, 1),
        title: 'Cataratas do Iguaçu & Parque das Aves',
        location: 'Foz do Iguaçu',
        activities: [
          'Visita aos tucanos e araras no Parque das Aves.',
          'Cataratas com passarela panorâmica.'
        ],
        kidsTips: 'Estrutura acessível com carrinho.'
      },
      {
        day: 3,
        date: addDays(departureDate, 2),
        title: 'Wonder Park Foz & Descanso',
        location: 'Foz do Iguaçu',
        activities: [
          'Carros clássicos e show das águas.',
          'Tarde na piscina do hotel.'
        ],
        kidsTips: 'Descanso antes da estrada.'
      },
      {
        day: 4,
        date: addDays(departureDate, 3),
        title: '1º Trecho de Estrada com Pernoite Intermediário',
        location: 'Estrada cênica',
        activities: [
          'Viagem de ~4h com paradas a cada 2h.',
          'Pernoite em hotel confortável.'
        ],
        kidsTips: 'Divisão da rota evita estresse.'
      },
      {
        day: 5,
        date: addDays(departureDate, 4),
        title: 'Pomerode: Cidade Mais Alemã do Brasil',
        location: 'Pomerode (SC)',
        activities: [
          'Chegada no Vale Europeu.',
          'Confeitarias coloniais e centrinho histórico.'
        ],
        kidsTips: 'Calçadas planas para passear a pé.'
      },
      {
        day: 6,
        date: addDays(departureDate, 5),
        title: 'Vila Encantada dos Dinossauros & Zoo Pomerode',
        location: 'Pomerode (SC)',
        activities: [
          'Dia inteiro na Vila Encantada dos Dinossauros.',
          'Subida no fim da tarde até Curitiba.'
        ],
        kidsTips: 'Parque lúdico imperdível para 2 e 5 anos.'
      },
      {
        day: 7,
        date: addDays(departureDate, 6),
        title: 'Curitiba: Bosque Alemão & Museu do Olho',
        location: 'Curitiba',
        activities: [
          'Trilha de João e Maria com a Casa da Bruxa.',
          'Gramado do MON para piquenique.'
        ],
        kidsTips: 'Contação de historinhas infantis.'
      },
      {
        day: 8,
        date: addDays(departureDate, 7),
        title: 'Curitiba: Parque Barigui & Museu da Vida',
        location: 'Curitiba',
        activities: [
          'Ver as capivaras no Barigui.',
          'Museu da Vida com brinquedoteca interativa.'
        ],
        kidsTips: 'Espaço educativo de referência.'
      },
      {
        day: 9,
        date: addDays(departureDate, 8),
        title: 'Devolução do Carro & Voo de Volta ✈️ Recife',
        location: 'Aeroporto ➔ Recife',
        activities: [
          'Devolução do carro alugado.',
          'Despacho gratuito de carrinho e assentos.',
          'Voo de volta para Recife!'
        ],
        kidsTips: 'Fim das férias inesquecíveis!'
      }
    ];
  }
}

export async function runMonitor() {
  const localHour = getLocalHour();
  const isNight = isNightTime();

  console.log('=====================================================');
  console.log(`🤖 MONITOR AUTÔNOMO DE FÉRIAS 2027 (TODAS AS OPÇÕES)`);
  console.log(`⏰ Horário local (Recife/Brasília): ${localHour}h00`);
  console.log(`🌙 Modo Noturno: ${isNight ? 'SIM (Apenas Super Promoções acionam som)' : 'NÃO (Comercial)'}`);
  console.log('=====================================================');

  const datePairs = generateDatePairs();
  const deals = simulateMarketDeals(datePairs);

  const bestDeal = deals[0];
  const winner = bestDeal.options[bestDeal.winnerType];

  console.log(`\n🏆 MELHOR OPÇÃO GERAL DETECTADA:`);
  console.log(`   Estratégia: ${winner.name}`);
  console.log(`   Datas: ${formatDateBR(bestDeal.departure)} a ${formatDateBR(bestDeal.returnDate)} (${bestDeal.days} dias)`);
  console.log(`   Custo Voos (4 pessoas): R$ ${winner.flights.toLocaleString('pt-BR')}`);
  console.log(`   Carro (Sedan/SUV): R$ ${winner.car.toLocaleString('pt-BR')} (Taxa Drop-off: R$ ${winner.dropoff})`);
  console.log(`   CUSTO TOTAL PACOTE: R$ ${bestDeal.cheapestTotal.toLocaleString('pt-BR')}`);
  if (bestDeal.savedDropoffFee > 0) {
    console.log(`   🎉 Economia Taxa Retorno Carro: + R$ ${bestDeal.savedDropoffFee.toLocaleString('pt-BR')} (Devolvido no mesmo local)`);
  }

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
      savedChildSeatCost: bestDeal.savedChildSeatCost
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

  // Push ntfy
  const isSuperPromo = winner.promo || bestDeal.cheapestTotal <= CONFIG.nightMode.superDealMaxPriceTotal;

  if (isNight) {
    if (isSuperPromo) {
      console.log('🚨 [Madrugada] Super promoção identificada! Enviando push urgente com som.');
      await sendNtfyNotification({
        title: `🚨 SUPER OFERTA MADRUGADA: Férias 2027 por R$ ${bestDeal.cheapestTotal.toLocaleString('pt-BR')}!`,
        message: `🔥 **Feirão da Madrugada / Black Friday Detectado!**\n\n` +
                 `• **Estratégia:** ${winner.name}\n` +
                 `• **Período:** ${formatDateBR(bestDeal.departure)} a ${formatDateBR(bestDeal.returnDate)} (${bestDeal.days} dias)\n` +
                 `• **Voos (4 pessoas com volta a REC):** R$ ${winner.flights.toLocaleString('pt-BR')}\n` +
                 `• **Carro:** R$ ${winner.car.toLocaleString('pt-BR')} (Drop-off: R$ ${winner.dropoff})\n` +
                 (bestDeal.savedDropoffFee > 0 ? `• **Economia Drop-off Carro:** R$ ${bestDeal.savedDropoffFee} a menos!\n\n` : `\n`) +
                 `*Toque para abrir o painel.*`,
        priority: 5,
        tags: ['rotating_light', 'airplane', 'fire'],
        clickUrl: 'https://projeto-ferias-2027.vercel.app'
      });
    } else {
      console.log('🌙 [Madrugada] Preço normal. Silenciado para respeitar o sono.');
    }
  } else {
    console.log('☀️ [Diurno] Enviando notificação com todas as opções avaliadas.');
    await sendNtfyNotification({
      title: `✈️ Férias 2027: Melhor Opção R$ ${bestDeal.cheapestTotal.toLocaleString('pt-BR')} (Todas Opções Avaliadas)`,
      message: `A varredura completa comparou as 4 rotas possíveis (incluindo ida e volta na mesma cidade e multidestinos):\n\n` +
               `• **Opção Campeã:** ${winner.name}\n` +
               `• **Datas:** ${formatDateBR(bestDeal.departure)} a ${formatDateBR(bestDeal.returnDate)} (${bestDeal.days} dias)\n` +
               `• **Voos (4 pax ida e volta para Recife):** R$ ${winner.flights.toLocaleString('pt-BR')}\n` +
               `• **Carro:** R$ ${winner.car.toLocaleString('pt-BR')}\n` +
               (bestDeal.savedDropoffFee > 0 ? `• **Vantagem:** Devolver na mesma cidade zerou a taxa de retorno (R$ ${bestDeal.savedDropoffFee} poupados)!\n\n` : `\n`) +
               `Toque para ver a comparação das 4 opções no painel.`,
      priority: 3,
      tags: ['airplane', 'family', 'car'],
      clickUrl: 'https://projeto-ferias-2027.vercel.app'
    });
  }

  console.log('🏁 Varredura concluída com sucesso!');
  return outputData;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMonitor();
}
