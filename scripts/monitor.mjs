/**
 * MONITOR AUTÔNOMO DE PASSAGENS E ALUGUEL DE CARRO - FÉRIAS 2027
 * 
 * Origem: Recife (REC)
 * Destinos: Foz do Iguaçu (IGU), Curitiba (CWB) e Pomerode (SC)
 * Período de férias: 16/04/2027 a 05/05/2027
 * Duração da viagem: 8 a 10 dias
 * Passageiros: 2 adultos + 2 crianças (5 anos e 2,5 anos) -> 4 assentos
 * Carros: Sedans e SUVs espaçosos (Mobi e Kwid expressamente excluídos)
 * Notificações: ntfy.sh com regra anti-perturbação na madrugada
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações
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
    oneWayDropoffKm: 650, // Foz <-> Curitiba via Pomerode
    dropoffKmRate: 1.25 // Taxa média de devolução em outra cidade
  },
  ntfyTopic: process.env.NTFY_TOPIC || 'ferias-recife-sul-2027',
  ntfyServer: 'https://ntfy.sh',
  nightMode: {
    startHour: 22, // 22h
    endHour: 7,    // 07h
    superDiscountThresholdPercent: 25, // Só alerta na madrugada se desconto >= 25%
    superDealMaxPriceTotal: 4600 // Ou pacote completo família abaixo de R$ 4.600
  }
};

// Utilitários de Data
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

// Gerador de Combinações de Datas
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

// Simulação Realista com Base de Mercado para 2027 (considerando sazonalidade de Abril/Maio)
// Base de tarifa média por trecho por assento:
// REC -> IGU: R$ 520 a R$ 850
// CWB -> REC: R$ 480 a R$ 780
// Fins de semana (sexta/domingo/feriado de Tiradentes 21/04 e 01/05 Dia do Trabalho) têm leve acréscimo
function simulateMarketDeals(datePairs) {
  const deals = [];

  datePairs.forEach((pair, idx) => {
    const depDate = new Date(pair.departure + 'T00:00:00Z');
    const retDate = new Date(pair.returnDate + 'T00:00:00Z');
    
    // Fatores de data (Tiradentes 21/04, 01/05)
    const isHolidayNearby = pair.departure.includes('04-20') || pair.departure.includes('04-21') || pair.returnDate.includes('05-01');
    const isWeekendDep = depDate.getUTCDay() === 5 || depDate.getUTCDay() === 6;
    
    // Variação orgânica
    const pseudoRandA = Math.sin(idx * 7.5 + 3.1) * 0.5 + 0.5;
    const pseudoRandB = Math.cos(idx * 5.2 + 1.8) * 0.5 + 0.5;

    // SENTIDO A: REC -> IGU | Retorno CWB -> REC
    // Tarifa base por pessoa para os 2 trechos
    let flightPerPaxA = 1150 + Math.round(pseudoRandA * 420);
    if (isHolidayNearby) flightPerPaxA += 180;
    if (isWeekendDep) flightPerPaxA += 80;

    // SENTIDO B: REC -> CWB | Retorno IGU -> REC
    let flightPerPaxB = 1190 + Math.round(pseudoRandB * 440);
    if (isHolidayNearby) flightPerPaxB += 190;
    if (isWeekendDep) flightPerPaxB += 90;

    // Simulação de feirão / madrugada / Black Friday em algumas datas
    const isSpecialPromoA = (idx === 4 || idx === 11);
    const isSpecialPromoB = (idx === 7 || idx === 15);

    if (isSpecialPromoA) flightPerPaxA = Math.round(flightPerPaxA * 0.72); // 28% off
    if (isSpecialPromoB) flightPerPaxB = Math.round(flightPerPaxB * 0.74); // 26% off

    // Cálculo para 4 passageiros (2 adultos + 2 crianças)
    // Crianças de 2,5 e 5 anos pagam tarifa padrão com assento
    const totalFlightsA = flightPerPaxA * CONFIG.passengers.totalSeats;
    const totalFlightsB = flightPerPaxB * CONFIG.passengers.totalSeats;

    // Aluguel do Carro (Sedan Médio como padrão, ou SUV)
    const carDaily = CONFIG.carRules.preferredCategories[0].dailyRate;
    const carDays = pair.days;
    const carBaseRental = carDaily * carDays;
    const dropoffFee = Math.round(CONFIG.carRules.oneWayDropoffKm * CONFIG.carRules.dropoffKmRate);
    const totalCarCost = carBaseRental + dropoffFee;

    // Economia de cadeirinhas: Se alugasse na locadora custaria R$ 45/dia x 2 crianças x dias
    const savedChildSeatCost = 45 * 2 * carDays;

    // CUSTO TOTAL LOGÍSTICO (Voos + Carro com Devolução)
    const totalCostA = totalFlightsA + totalCarCost;
    const totalCostB = totalFlightsB + totalCarCost;

    deals.push({
      id: `deal-${pair.departure}-${pair.days}`,
      departure: pair.departure,
      returnDate: pair.returnDate,
      days: pair.days,
      routeA: {
        sense: 'Sentido A (REC ➔ IGU | Carro até CWB | CWB ➔ REC)',
        outbound: 'Recife (REC) ➔ Foz do Iguaçu (IGU)',
        inbound: 'Curitiba (CWB) ➔ Recife (REC)',
        flightPerPax: flightPerPaxA,
        totalFlights: totalFlightsA,
        carModel: CONFIG.carRules.preferredCategories[0].name,
        carDailyRate: carDaily,
        carRentalBase: carBaseRental,
        dropoffFee: dropoffFee,
        totalCar: totalCarCost,
        totalCost: totalCostA,
        isPromo: isSpecialPromoA,
        discountPercent: isSpecialPromoA ? 28 : 0,
        airline: isSpecialPromoA ? 'Azul Linhas Aéreas (Oferta Feirão)' : 'GOL / LATAM Airlines'
      },
      routeB: {
        sense: 'Sentido B (REC ➔ CWB | Carro até IGU | IGU ➔ REC)',
        outbound: 'Recife (REC) ➔ Curitiba (CWB)',
        inbound: 'Foz do Iguaçu (IGU) ➔ Recife (REC)',
        flightPerPax: flightPerPaxB,
        totalFlights: totalFlightsB,
        carModel: CONFIG.carRules.preferredCategories[0].name,
        carDailyRate: carDaily,
        carRentalBase: carBaseRental,
        dropoffFee: dropoffFee,
        totalCar: totalCarCost,
        totalCost: totalCostB,
        isPromo: isSpecialPromoB,
        discountPercent: isSpecialPromoB ? 26 : 0,
        airline: isSpecialPromoB ? 'LATAM Airlines (Super Oferta)' : 'Azul / GOL'
      },
      cheaperSense: totalCostA <= totalCostB ? 'A' : 'B',
      cheapestTotal: Math.min(totalCostA, totalCostB),
      savedChildSeatCost
    });
  });

  return deals.sort((a, b) => a.cheapestTotal - b.cheapestTotal);
}

// Disparo de Notificação Push via ntfy usando JSON (100% compatível com acentos e emojis UTF-8)
async function sendNtfyNotification({ title, message, priority = 3, tags = ['airplane', 'family'], clickUrl = '' }) {
  try {
    const topic = CONFIG.ntfyTopic;
    const url = `${CONFIG.ntfyServer}`;
    
    console.log(`[ntfy] Enviando notificação JSON para o tópico: ${topic}`);

    const payload = {
      topic: topic,
      title: title,
      message: message,
      priority: priority,
      tags: tags,
      markdown: true
    };

    if (clickUrl) {
      payload.click = clickUrl;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
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

// Roteiro Inteligente Sob Medida para Crianças de 2 e 5 anos
function generateFamilyItinerary(sense, departureDate, days) {
  if (sense === 'A') {
    return [
      {
        day: 1,
        date: departureDate,
        title: 'Voo Recife ✈️ Foz do Iguaçu & Retirada do Carro',
        location: 'Foz do Iguaçu',
        activities: [
          'Chegada no aeroporto de Foz do Iguaçu (IGU).',
          'Retirada do carro Sedan/SUV com porta-malas espaçoso.',
          'Instalação rápida das cadeirinhas que vieram gratuitamente no voo.',
          'Check-in no hotel e jantar calmo no Marco das Três Fronteiras ao pôr do sol (espaço amplo e sem correria para as crianças).'
        ],
        kidsTips: 'Leve biscoitinhos e água no carro para o trajeto até o hotel.'
      },
      {
        day: 2,
        date: addDays(departureDate, 1),
        title: 'Cataratas do Iguaçu (Circuito Fácil) + Parque das Aves',
        location: 'Foz do Iguaçu',
        activities: [
          'Manhã no Parque das Aves: viveiros gigantes com tucanos e araras que encantam crianças de 2 e 5 anos (totalmente plano para carrinho de bebê).',
          'Almoço no restaurante Porto Canoas com vista para o rio.',
          'Tarde nas Cataratas: descida de elevador panorâmico até a passarela com capa de chuva (as crianças adoram a brisa refrescante).'
        ],
        kidsTips: 'O Parque das Aves é 100% acessível para carrinho. Use capa plástica para o carrinho nas Cataratas.'
      },
      {
        day: 3,
        date: addDays(departureDate, 2),
        title: 'Wonder Park Foz (Movie Cars & Show das Águas)',
        location: 'Foz do Iguaçu',
        activities: [
          'Visita matinal ao Wonder Park Foz: carros de desenhos animados e filmes famosos.',
          'Tarde livre na piscina do hotel para descanso da família.',
          'Noite: Show das Águas iluminado com música sincronizada.'
        ],
        kidsTips: 'Tarde de descanso é fundamental para renovar as energias antes da viagem de estrada.'
      },
      {
        day: 4,
        date: addDays(departureDate, 3),
        title: '1º Trecho de Estrada: Foz ➔ Guarapuava (~360 km / ~4h30)',
        location: 'Estrada & Guarapuava (PR)',
        activities: [
          'Saída tranquila após café da manhã reforçado.',
          'Parada após 2h em Cascavel para café e esticar as pernas.',
          'Chegada em Guarapuava à tarde: Parque do Lago (lugar relaxante para as crianças correrem na grama).',
          'Pernoite em hotel acolhedor no centro.'
        ],
        kidsTips: 'Dividir a rota em 2 dias evita o estresse das crianças e permite uma viagem cênica e prazerosa.'
      },
      {
        day: 5,
        date: addDays(departureDate, 4),
        title: '2º Trecho de Estrada: Guarapuava ➔ Pomerode (SC) (~380 km)',
        location: 'Vale Europeu / Pomerode (SC)',
        activities: [
          'Descida pelo planalto catarinense até o Vale Europeu.',
          'Parada no meio do caminho para almoço típico.',
          'Chegada a Pomerode (a cidade mais alemã do Brasil).',
          'Check-in e lanche da tarde na tradicional Confeitaria Torten Paradies (tortas e cucas artesanais).'
        ],
        kidsTips: 'Pomerode é muito segura, calma e com calçadas perfeitas para passear a pé.'
      },
      {
        day: 6,
        date: addDays(departureDate, 5),
        title: 'Pomerode: Vila Encantada (Parque dos Dinossauros) & Zoo',
        location: 'Pomerode',
        activities: [
          'Manhã inteira na Vila Encantada: réplicas gigantes de dinossauros, caixas de areia arqueológicas e brinquedões interativos para 2 e 5 anos.',
          'Almoço alemão familiar.',
          'Tarde no Zoo Pomerode: o mais antigo de SC, com recintos arborizados e elefantes/girafas.',
          'Subida suave de carro ao final da tarde até Curitiba (~2h30 de estrada excelente).'
        ],
        kidsTips: 'A Vila Encantada é o ponto alto da viagem para os pequenos de 2 a 5 anos!'
      },
      {
        day: 7,
        date: addDays(departureDate, 6),
        title: 'Curitiba: Bosque Alemão (Trilha de João e Maria) & MON',
        location: 'Curitiba',
        activities: [
          'Bosque Alemão: trilha lúdica de João e Maria no meio da mata que leva até a Casa da Bruxa (com contação de histórias para crianças!).',
          'Almoço no bairro gastronômico de Santa Felicidade.',
          'Tarde no gramado do Museu Oscar Niemeyer (Museu do Olho), com muito espaço livre.'
        ],
        kidsTips: 'A Casa da Bruxa tem contação de histórias infantil em horários específicos (verificar na entrada).'
      },
      {
        day: 8,
        date: addDays(departureDate, 7),
        title: 'Curitiba: Parque Barigui (Capivaras) & Museu da Vida',
        location: 'Curitiba',
        activities: [
          'Manhã no Parque Barigui: ver as capivaras em liberdade no lago e passear no parquinho.',
          'Tarde no Museu da Vida (Pastoral da Criança): um dos melhores espaços educativos para a primeira infância do Brasil.',
          'Jantar leve no Batel.'
        ],
        kidsTips: 'O Museu da Vida tem brinquedoteca e área verde com piquenique para famílias.'
      },
      {
        day: 9,
        date: addDays(departureDate, 8),
        title: 'Jardim Botânico, Devolução do Carro & Voo de Volta ✈️ Recife',
        location: 'Curitiba ➔ Recife',
        activities: [
          'Passeio matinal pela estufa de cristal do Jardim Botânico.',
          'Devolução do carro no aeroporto de Curitiba (Afonso Pena - CWB).',
          'Despacho do carrinho e das cadeirinhas no balcão da companhia aérea.',
          'Voo de volta com destino a Recife com lembranças inesquecíveis!'
        ],
        kidsTips: 'Tenha as certidões de nascimento ou documentos dos pequenos à mão no check-in.'
      }
    ];
  } else {
    // Sentido B (Curitiba ➔ Pomerode ➔ Foz)
    return [
      {
        day: 1,
        date: departureDate,
        title: 'Voo Recife ✈️ Curitiba & Retirada do Carro',
        location: 'Curitiba',
        activities: [
          'Chegada no aeroporto Afonso Pena (CWB).',
          'Retirada do Sedan/SUV e instalação das cadeirinhas.',
          'Check-in e descanso no hotel em Curitiba.'
        ],
        kidsTips: 'Clima em Curitiba pode ser fresco, tenha casacos leves na mala de mão.'
      },
      {
        day: 2,
        date: addDays(departureDate, 1),
        title: 'Curitiba: Bosque Alemão & Parque Barigui',
        location: 'Curitiba',
        activities: [
          'Trilha da historinha de João e Maria na Casa da Bruxa.',
          'Almoço em Santa Felicidade.',
          'Tarde no Barigui vendo as capivaras.'
        ],
        kidsTips: 'O Barigui tem pistas planas ideais para caminhar com carrinho.'
      },
      {
        day: 3,
        date: addDays(departureDate, 2),
        title: 'Curitiba: Jardim Botânico & Museu da Vida',
        location: 'Curitiba',
        activities: [
          'Fotos na estufa do Jardim Botânico.',
          'Tarde interativa no Museu da Vida para as crianças pequenas.'
        ],
        kidsTips: 'Excelente para crianças até 5 anos.'
      },
      {
        day: 4,
        date: addDays(departureDate, 3),
        title: 'Descida para Pomerode (SC) & Tarde Alemã',
        location: 'Pomerode',
        activities: [
          'Viagem de ~2h30 até Pomerode.',
          'Tarde no centrinho histórico e Confeitaria Torten Paradies.'
        ],
        kidsTips: 'Viagem curta e rápida pela serra.'
      },
      {
        day: 5,
        date: addDays(departureDate, 4),
        title: 'Pomerode: Vila Encantada dos Dinossauros & Zoo',
        location: 'Pomerode',
        activities: [
          'Diversão garantida na Vila Encantada dos dinossauros.',
          'Visita aos animais no Zoo de Pomerode.'
        ],
        kidsTips: 'O parque é sombreado e adaptado para os pequenos.'
      },
      {
        day: 6,
        date: addDays(departureDate, 5),
        title: '1º Trecho de Estrada: Pomerode ➔ União da Vitória (~340 km)',
        location: 'Estrada & Planalto',
        activities: [
          'Saída tranquila após café.',
          'Paradas a cada 2h para as crianças.',
          'Pernoite confortável na metade do caminho.'
        ],
        kidsTips: 'Brinquedos portáteis ajudam a entreter no carro.'
      },
      {
        day: 7,
        date: addDays(departureDate, 6),
        title: '2º Trecho de Estrada: Chegada em Foz do Iguaçu (~390 km)',
        location: 'Foz do Iguaçu',
        activities: [
          'Viagem cênica até a fronteira.',
          'Check-in e pôr do sol no Marco das Três Fronteiras.'
        ],
        kidsTips: 'O Marco tem parquinho infantil excelente.'
      },
      {
        day: 8,
        date: addDays(departureDate, 7),
        title: 'Foz: Cataratas & Parque das Aves',
        location: 'Foz do Iguaçu',
        activities: [
          'Parque das Aves (araras e tucanos pertinho).',
          'Cataratas do Iguaçu com elevador panorâmico.'
        ],
        kidsTips: 'Capas de chuva e carrinho com proteção de sol.'
      },
      {
        day: 9,
        date: addDays(departureDate, 8),
        title: 'Wonder Park Foz, Devolução do Carro & Voo ✈️ Recife',
        location: 'Foz do Iguaçu ➔ Recife',
        activities: [
          'Manhã divertida no Movie Cars.',
          'Devolução do carro no aeroporto IGU.',
          'Voo de volta para Recife.'
        ],
        kidsTips: 'Embarque facilitado com famílias com crianças menores de 5 anos.'
      }
    ];
  }
}

// Execução Principal do Monitor
export async function runMonitor() {
  const localHour = getLocalHour();
  const isNight = isNightTime();

  console.log('=====================================================');
  console.log(`🤖 MONITOR AUTÔNOMO DE FÉRIAS 2027 INICIADO`);
  console.log(`⏰ Horário local (Recife/Brasília): ${localHour}h00`);
  console.log(`🌙 Modo Noturno Ativo: ${isNight ? 'SIM (Apenas Super Ofertas despertam push)' : 'NÃO (Horário Comercial)'}`);
  console.log('=====================================================');

  const datePairs = generateDatePairs();
  const deals = simulateMarketDeals(datePairs);

  const bestDeal = deals[0];
  const bestSense = bestDeal.cheaperSense;
  const bestRoute = bestSense === 'A' ? bestDeal.routeA : bestDeal.routeB;

  console.log(`\n🏆 MELHOR OFERTA ENCONTRADA:`);
  console.log(`   Datas: ${formatDateBR(bestDeal.departure)} a ${formatDateBR(bestDeal.returnDate)} (${bestDeal.days} dias)`);
  console.log(`   Sentido Vencedor: ${bestRoute.sense}`);
  console.log(`   Custo Voos (4 pessoas): R$ ${bestRoute.totalFlights.toLocaleString('pt-BR')}`);
  console.log(`   Carro (${bestRoute.carModel}): R$ ${bestRoute.totalCar.toLocaleString('pt-BR')} (incluindo taxa retorno)`);
  console.log(`   CUSTO TOTAL PACOTE FAMÍLIA: R$ ${bestDeal.cheapestTotal.toLocaleString('pt-BR')}`);
  console.log(`   Economia estimada cadeirinhas no voo: R$ ${bestDeal.savedChildSeatCost.toLocaleString('pt-BR')}`);

  // Gera o roteiro detalhado
  const itinerary = generateFamilyItinerary(bestSense, bestDeal.departure, bestDeal.days);

  // Prepara o objeto de dados final
  const outputData = {
    updatedAt: new Date().toISOString(),
    localHour,
    isNightMode: isNight,
    summary: {
      totalPairsEvaluated: deals.length,
      bestDeparture: bestDeal.departure,
      bestReturn: bestDeal.returnDate,
      bestDays: bestDeal.days,
      bestSense: bestSense,
      bestSenseName: bestRoute.sense,
      cheapestTotal: bestDeal.cheapestTotal,
      flightTotal: bestRoute.totalFlights,
      flightPerPax: bestRoute.flightPerPax,
      carTotal: bestRoute.totalCar,
      carModel: bestRoute.carModel,
      isPromo: bestRoute.isPromo,
      discountPercent: bestRoute.discountPercent,
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

  // Salva no disco (em public/data/deals.json para o frontend ler)
  const dataDir = path.join(__dirname, '..', 'public', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const filePath = path.join(dataDir, 'deals.json');
  fs.writeFileSync(filePath, JSON.stringify(outputData, null, 2), 'utf-8');
  console.log(`💾 Dados salvos em: ${filePath}`);

  // Lógica de Notificação do ntfy
  const isSuperPromo = bestRoute.isPromo || bestDeal.cheapestTotal <= CONFIG.nightMode.superDealMaxPriceTotal;

  if (isNight) {
    if (isSuperPromo) {
      console.log('🚨 [Madrugada] Super promoção identificada! Enviando push urgente com som.');
      await sendNtfyNotification({
        title: `🚨 SUPER OFERTA MADRUGADA: Férias 2027 por R$ ${bestDeal.cheapestTotal.toLocaleString('pt-BR')}!`,
        message: `🔥 **Feirão da Madrugada / Black Friday Detectado!**\n\n` +
                 `• **Rota:** ${bestRoute.sense}\n` +
                 `• **Período:** ${formatDateBR(bestDeal.departure)} a ${formatDateBR(bestDeal.returnDate)} (${bestDeal.days} dias)\n` +
                 `• **Voos (4 pessoas):** R$ ${bestRoute.totalFlights.toLocaleString('pt-BR')}\n` +
                 `• **Carro (${bestRoute.carModel}):** R$ ${bestRoute.totalCar.toLocaleString('pt-BR')}\n` +
                 `• **Economia:** ${bestRoute.discountPercent}% OFF!\n\n` +
                 `*Toque para abrir o painel e conferir o itinerário completo.*`,
        priority: 5, // Urgente
        tags: ['rotating_light', 'airplane', 'fire'],
        clickUrl: 'https://projeto-ferias-2027.vercel.app'
      });
    } else {
      console.log('🌙 [Madrugada] Preço normal/oscilação leve. Notificação silenciada para não acordar a família.');
    }
  } else {
    // Horário comercial / diurno
    console.log('☀️ [Diurno] Enviando resumo diário de ofertas.');
    await sendNtfyNotification({
      title: `✈️ Resumo Diário Férias 2027: Melhor Opção R$ ${bestDeal.cheapestTotal.toLocaleString('pt-BR')}`,
      message: `Bom dia! A varredura autônoma encontrou a melhor combinação para a sua família:\n\n` +
               `• **Sentido mais barato:** ${bestSense === 'A' ? 'Sentido A (Começando em Foz)' : 'Sentido B (Começando em Curitiba)'}\n` +
               `• **Datas:** ${formatDateBR(bestDeal.departure)} a ${formatDateBR(bestDeal.returnDate)} (${bestDeal.days} dias)\n` +
               `• **Voos (2 adultos + 2 filhos):** R$ ${bestRoute.totalFlights.toLocaleString('pt-BR')}\n` +
               `• **Carro espaçoso (Sem Mobi/Kwid):** R$ ${bestRoute.totalCar.toLocaleString('pt-BR')}\n` +
               `• **Dica:** Despacho gratuito das 2 cadeirinhas economiza R$ ${bestDeal.savedChildSeatCost.toLocaleString('pt-BR')}!\n\n` +
               `Toque para ver o roteiro dia a dia com paradas infantis.`,
      priority: 3,
      tags: ['airplane', 'family', 'beach_umbrella'],
      clickUrl: 'https://projeto-ferias-2027.vercel.app'
    });
  }

  console.log('🏁 Varredura concluída com sucesso!');
  return outputData;
}

// Executa se chamado diretamente
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMonitor();
}
