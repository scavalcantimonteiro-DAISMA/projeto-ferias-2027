import { useState, useEffect } from 'react';
import { 
  Plane, 
  Car, 
  Calendar, 
  Users, 
  Bell, 
  AlertTriangle, 
  Sparkles, 
  MapPin, 
  Baby, 
  ArrowRight, 
  Compass, 
  Moon, 
  RefreshCw, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  XCircle, 
  Repeat,
  Clock,
  ArrowRightCircle,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface FlightLeg {
  flightNumber: string;
  airline: string;
  departureTime: string;
  arrivalTime: string;
  totalDuration: string;
  isDirect: boolean;
  stopsCount: number;
  connectionCity: string;
  layoverDuration: string;
  aircraft: string;
  kidsComfortRating: string;
}

interface StrategyOption {
  type: 'A' | 'B' | 'C' | 'D';
  name: string;
  cost: number;
  flights: number;
  car: number;
  dropoff: number;
  promo: boolean;
  flightPerPax: number;
  flightDetails: {
    outbound: FlightLeg;
    inbound: FlightLeg;
  };
}

interface Deal {
  id: string;
  departure: string;
  returnDate: string;
  days: number;
  winnerType: 'A' | 'B' | 'C' | 'D';
  winnerName: string;
  cheapestTotal: number;
  savedChildSeatCost: number;
  savedDropoffFee: number;
  options: {
    A: StrategyOption;
    B: StrategyOption;
    C: StrategyOption;
    D: StrategyOption;
  };
}

interface ItineraryDay {
  day: number;
  date: string;
  title: string;
  location: string;
  activities: string[];
  kidsTips: string;
}

interface DealsData {
  updatedAt: string;
  localHour: number;
  isNightMode: boolean;
  summary: {
    totalPairsEvaluated: number;
    bestDeparture: string;
    bestReturn: string;
    bestDays: number;
    bestStrategyType: 'A' | 'B' | 'C' | 'D';
    bestStrategyName: string;
    cheapestTotal: number;
    flightTotal: number;
    flightPerPax: number;
    carTotal: number;
    carModel: string;
    dropoffFee: number;
    savedDropoffFee: number;
    isPromo: boolean;
    savedChildSeatCost: number;
    flightDetails: {
      outbound: FlightLeg;
      inbound: FlightLeg;
    };
  };
  topDeals: Deal[];
  allDeals: Deal[];
  itinerary: ItineraryDay[];
  rules: {
    excludedCars: string[];
    allowedCategories: Array<{
      id: string;
      name: string;
      trunkLiters: number;
      dailyRate: number;
      rating: string;
    }>;
    passengers: {
      adults: number;
      children: Array<{ age: number; category: string }>;
      totalSeats: number;
    };
    vacationWindow: string;
  };
}

export default function App() {
  const [data, setData] = useState<DealsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDuration, setSelectedDuration] = useState<number | 'all'>('all');
  const [carType, setCarType] = useState<'sedan' | 'suv'>('sedan');
  const [ntfyTopic, setNtfyTopic] = useState<string>('ferias-recife-sul-2027');
  const [ntfyStatus, setNtfyStatus] = useState<string>('');
  const [showNtfyModal, setShowNtfyModal] = useState<boolean>(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'flights' | 'comparison' | 'itinerary' | 'cars'>('overview');

  useEffect(() => {
    fetch('/data/deals.json')
      .then((res) => res.json())
      .then((json: DealsData) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erro ao carregar dados:', err);
        setLoading(false);
      });
  }, []);

  const sendTestNotification = async () => {
    setNtfyStatus('Enviando notificação...');
    try {
      const res = await fetch('https://ntfy.sh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: ntfyTopic,
          title: '✈️ Teste SCM: Férias 2027',
          message: 'Notificações com horários e conexões ativas no seu celular!\nOrigem e retorno 100% garantidos para Recife.',
          priority: 4,
          tags: ['tada', 'airplane', 'family'],
          markdown: true
        })
      });
      if (res.ok) {
        setNtfyStatus('✅ Notificação enviada com sucesso! Verifique o app ntfy no celular.');
      } else {
        setNtfyStatus('❌ Erro: ' + res.statusText);
      }
    } catch {
      setNtfyStatus('❌ Falha na conexão com ntfy.sh');
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-800 p-4 font-sans">
        <RefreshCw className="w-10 h-10 text-sky-600 animate-spin mb-3" />
        <h2 className="text-lg font-semibold text-slate-900">Carregando painel de monitoramento SCM...</h2>
        <p className="text-slate-500 text-sm mt-1">Varrendo voos com horários, escalas e custos de carro</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-800 p-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-3" />
        <h2 className="text-xl font-semibold text-slate-900">Nenhum dado encontrado</h2>
      </div>
    );
  }

  const { summary, topDeals, itinerary } = data;
  const filteredDeals = selectedDuration === 'all' 
    ? topDeals 
    : topDeals.filter(d => d.days === selectedDuration);

  const suvDiffPerDay = 40;
  const getAdjustedPrice = (cost: number, days: number) => {
    return carType === 'suv' ? cost + (suvDiffPerDay * days) : cost;
  };

  const bestFlight = summary.flightDetails;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans pb-24 selection:bg-sky-500 selection:text-white">
      {/* Barra de Status Superior Suave */}
      <div className="bg-white border-b border-slate-200/80 px-4 py-2.5 shadow-xs">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-700">Robô Autônomo Ativo (4 Horários Diários)</span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="text-slate-500 hidden sm:inline">Ida e Volta 100% para Recife (REC)</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 text-xs">
              <Moon className="w-3.5 h-3.5 text-indigo-500" />
              <span>Modo Madrugada: Alerta sonoro apenas para Super Ofertas</span>
            </div>
            <button
              onClick={() => setShowNtfyModal(true)}
              className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white font-medium px-3.5 py-1 rounded-full transition-all shadow-xs"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>App ntfy: {ntfyTopic}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cabeçalho Principal com Logotipo Oficial SCM */}
      <header className="max-w-6xl mx-auto px-4 pt-8 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* Logotipo do Avião ao Redor do Mundo */}
            <div className="relative group shrink-0">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white p-1 shadow-md border border-slate-200/80 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                <img src="/logo.svg" alt="SCM Férias 2027" className="w-full h-full object-contain" />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold uppercase tracking-wider mb-1">
                <Compass className="w-3 h-3" />
                Família SCM • Férias 2027
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Foz do Iguaçu, Pomerode & Curitiba
              </h1>
              <p className="text-slate-500 text-xs md:text-sm mt-0.5">
                Monitoramento inteligente para <strong className="text-slate-800">4 pessoas</strong> (2 adultos + 2 crianças de 5 e 2,5 anos) com carro espaçoso.
              </p>
            </div>
          </div>

          {/* Badge Resumo Família */}
          <div className="flex items-center gap-3 bg-white border border-slate-200 p-3 rounded-2xl shadow-xs">
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-slate-800">4 Passageiros (Assentos Próprios)</div>
              <div className="text-slate-500">2 Adultos + Filhos (5 anos e 2,5 anos)</div>
            </div>
          </div>
        </div>

        {/* Abas com Paleta Suave */}
        <div className="flex gap-2 border-b border-slate-200 mt-8 overflow-x-auto pb-1 text-sm font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
              activeTab === 'overview'
                ? 'bg-sky-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Visão Geral & Campeão
          </button>
          <button
            onClick={() => setActiveTab('flights')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
              activeTab === 'flights'
                ? 'bg-sky-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Plane className="w-4 h-4" />
            Horários & Escalas dos Voos
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
              activeTab === 'comparison'
                ? 'bg-sky-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Repeat className="w-4 h-4" />
            Comparativo das 4 Rotas
          </button>
          <button
            onClick={() => setActiveTab('cars')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
              activeTab === 'cars'
                ? 'bg-sky-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Car className="w-4 h-4" />
            Aluguel de Carro (Sem Mobi/Kwid)
          </button>
          <button
            onClick={() => setActiveTab('itinerary')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
              activeTab === 'itinerary'
                ? 'bg-sky-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Roteiro Dia a Dia (Kids Friendly)
          </button>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-6xl mx-auto px-4 mt-6">
        {/* ABA: VISÃO GERAL */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Card Destaque Campeão */}
            <div className="relative overflow-hidden bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="absolute top-0 right-0 bg-sky-600 text-white text-[11px] font-bold uppercase px-4 py-1.5 rounded-bl-2xl tracking-wider flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                Opção Mais Econômica Geral
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                <div className="lg:col-span-2 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                    🏆 {summary.bestStrategyName}
                  </div>

                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                      {formatDate(summary.bestDeparture)} até {formatDate(summary.bestReturn)} ({summary.bestDays} dias)
                    </h2>
                    <p className="text-sky-700 font-medium text-sm mt-0.5">
                      Saída de Recife e Retorno Garantido para Recife
                    </p>
                  </div>

                  {/* Resumo de Custos */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                    <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl">
                      <div className="text-slate-500 text-xs flex items-center gap-1.5 font-medium">
                        <Plane className="w-4 h-4 text-sky-600" />
                        Voos Ida & Volta (4 pax)
                      </div>
                      <div className="text-xl font-extrabold text-slate-900 mt-1">
                        R$ {summary.flightTotal.toLocaleString('pt-BR')}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        R$ {summary.flightPerPax.toLocaleString('pt-BR')} / pessoa
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl">
                      <div className="text-slate-500 text-xs flex items-center gap-1.5 font-medium">
                        <Car className="w-4 h-4 text-indigo-600" />
                        Carro ({summary.bestDays} diárias)
                      </div>
                      <div className="text-xl font-extrabold text-slate-900 mt-1">
                        R$ {summary.carTotal.toLocaleString('pt-BR')}
                      </div>
                      <div className="text-[11px] text-emerald-700 font-medium">
                        {summary.dropoffFee === 0 ? 'Taxa retorno: R$ 0 (Mesma cidade)' : `Taxa retorno: R$ ${summary.dropoffFee}`}
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl col-span-2 sm:col-span-1">
                      <div className="text-slate-500 text-xs flex items-center gap-1.5 font-medium">
                        <Baby className="w-4 h-4 text-pink-500" />
                        Cadeirinhas no Voo
                      </div>
                      <div className="text-xl font-extrabold text-emerald-700 mt-1">
                        + R$ {summary.savedChildSeatCost.toLocaleString('pt-BR')}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Poupados levando no voo
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preço Total e Ação */}
                <div className="bg-gradient-to-b from-sky-50/80 to-white border border-sky-100 rounded-2xl p-6 flex flex-col justify-between items-center text-center shadow-xs">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
                      Custo Total Logístico
                    </span>
                    <div className="text-4xl font-black text-slate-900 mt-2">
                      R$ {getAdjustedPrice(summary.cheapestTotal, summary.bestDays).toLocaleString('pt-BR')}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Voos dos 4 (Ida e Volta a Recife) + {summary.bestDays} diárias de carro
                    </div>

                    {summary.savedDropoffFee > 0 && (
                      <div className="mt-3 inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-semibold">
                        🎉 Devolução no mesmo aeroporto economizou R$ {summary.savedDropoffFee}!
                      </div>
                    )}
                  </div>

                  <div className="w-full mt-6 space-y-2">
                    <button
                      onClick={() => setActiveTab('flights')}
                      className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Clock className="w-4 h-4" />
                      <span>Ver Horários & Escalas dos Voos</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('itinerary')}
                      className="w-full py-2 px-4 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Ver Roteiro Dia a Dia das Crianças</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Dica da Economia Suave */}
            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 md:p-5 flex items-start gap-4">
              <div className="p-3 bg-white text-emerald-700 rounded-xl shadow-xs border border-emerald-200 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="text-sm">
                <h3 className="font-bold text-slate-900 text-base">
                  Economia Inteligente da Família SCM (R$ 800 a R$ 1.000 poupados!)
                </h3>
                <p className="text-slate-600 mt-1 leading-relaxed text-xs md:text-sm">
                  As companhias aéreas (Azul, GOL e LATAM) permitem despachar <strong className="text-emerald-800">1 carrinho de bebê + 1 cadeirinha/assento por criança gratuitamente</strong> sem cobrar excesso de bagagem. 
                  Como as locadoras cobram entre R$ 40 a R$ 50/dia por cada cadeirinha, levar as suas no voo garante economia imediata e o conforto com que seus filhos já estão acostumados.
                </p>
              </div>
            </div>

            {/* Grid com as Melhores Datas */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-sky-600" />
                    Datas Analisadas (16/04 a 05/05/2027)
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Todas as combinações com saídas e retornos 100% para Recife.
                  </p>
                </div>

                {/* Filtro Duração */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                  <span className="text-slate-500 px-2 font-medium">Duração:</span>
                  <button
                    onClick={() => setSelectedDuration('all')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      selectedDuration === 'all'
                        ? 'bg-white text-slate-900 font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Todas
                  </button>
                  <button
                    onClick={() => setSelectedDuration(8)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      selectedDuration === 8
                        ? 'bg-white text-slate-900 font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    8 dias
                  </button>
                  <button
                    onClick={() => setSelectedDuration(9)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      selectedDuration === 9
                        ? 'bg-white text-slate-900 font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    9 dias
                  </button>
                  <button
                    onClick={() => setSelectedDuration(10)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      selectedDuration === 10
                        ? 'bg-white text-slate-900 font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    10 dias
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDeals.slice(0, 8).map((deal, index) => {
                  const winner = deal.options[deal.winnerType];
                  const price = getAdjustedPrice(deal.cheapestTotal, deal.days);

                  return (
                    <div
                      key={deal.id}
                      className={`relative bg-slate-50/70 border rounded-2xl p-4.5 transition-all hover:border-sky-300 hover:bg-white ${
                        index === 0
                          ? 'border-sky-400 bg-sky-50/30 shadow-xs'
                          : 'border-slate-200'
                      }`}
                    >
                      {index === 0 && (
                        <span className="absolute -top-2.5 right-4 bg-sky-600 text-white text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                          Mais Barato
                        </span>
                      )}

                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-slate-900 font-bold text-base">
                            {formatDate(deal.departure)} ➔ {formatDate(deal.returnDate)}
                          </div>
                          <div className="text-slate-500 text-xs mt-1 flex items-center gap-1.5">
                            <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-slate-700 font-semibold">
                              {deal.days} dias
                            </span>
                            <span>•</span>
                            <span className="text-sky-700 font-medium">
                              {winner.name.split('(')[0]}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-black text-slate-900">
                            R$ {price.toLocaleString('pt-BR')}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Total Família
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
                        <div>
                          <span className="text-slate-400">Ida:</span> {winner.flightDetails.outbound.departureTime} ({winner.flightDetails.outbound.totalDuration})
                        </div>
                        <div>
                          <span className="text-slate-400">Escala:</span> {winner.flightDetails.outbound.layoverDuration} em {winner.flightDetails.outbound.connectionCity.split('(')[1]?.replace(')', '') || 'Conexão'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ABA: HORÁRIOS & ESCALAS DETALHADAS DOS VOOS */}
        {activeTab === 'flights' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs">
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                  Ficha Operacional de Voos
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
                  Horários, Conexões e Tempo de Escala
                </h3>
                <p className="text-slate-500 text-sm mt-0.5">
                  Detalhes minuciosos dos trechos aéreos para a sua família com crianças pequenas.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* VOO DE IDA */}
                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/60 relative">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-sky-100 text-sky-700 rounded-lg">
                        <Plane className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Voo de Ida</h4>
                        <span className="text-xs text-slate-500">{bestFlight.outbound.airline}</span>
                      </div>
                    </div>
                    <span className="text-xs bg-white font-mono px-2.5 py-1 rounded-md border border-slate-200 text-slate-700 font-semibold">
                      {bestFlight.outbound.flightNumber}
                    </span>
                  </div>

                  {/* Horários e Trajeto */}
                  <div className="py-4 flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-extrabold text-slate-900">
                        {bestFlight.outbound.departureTime}
                      </div>
                      <div className="text-xs font-semibold text-slate-700">Recife (REC)</div>
                      <div className="text-[11px] text-slate-400">Aeroporto Guararapes</div>
                    </div>

                    <div className="flex flex-col items-center px-4">
                      <span className="text-[11px] font-semibold text-slate-500">{bestFlight.outbound.totalDuration}</span>
                      <div className="w-24 md:w-32 h-0.5 bg-sky-300 relative my-1">
                        <div className="w-2 h-2 rounded-full bg-sky-600 absolute left-1/2 -top-0.75 -translate-x-1/2"></div>
                      </div>
                      <span className="text-[10px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {bestFlight.outbound.stopsCount} Conexão
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-extrabold text-slate-900">
                        {bestFlight.outbound.arrivalTime}
                      </div>
                      <div className="text-xs font-semibold text-slate-700">Curitiba (CWB)</div>
                      <div className="text-[11px] text-slate-400">Afonso Pena</div>
                    </div>
                  </div>

                  {/* Detalhe da Conexão / Escala */}
                  <div className="mt-2 bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between items-center text-slate-700 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Cidade da Escala:
                      </span>
                      <strong className="text-slate-900">{bestFlight.outbound.connectionCity}</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 font-medium">
                      <span>Tempo de Espera no Aeroporto:</span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold rounded">
                        {bestFlight.outbound.layoverDuration}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-emerald-700 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{bestFlight.outbound.kidsComfortRating}</span>
                    </div>
                  </div>
                </div>

                {/* VOO DE VOLTA */}
                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/60 relative">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                        <Plane className="w-4 h-4 rotate-180" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Voo de Volta para Recife</h4>
                        <span className="text-xs text-slate-500">{bestFlight.inbound.airline}</span>
                      </div>
                    </div>
                    <span className="text-xs bg-white font-mono px-2.5 py-1 rounded-md border border-slate-200 text-slate-700 font-semibold">
                      {bestFlight.inbound.flightNumber}
                    </span>
                  </div>

                  {/* Horários e Trajeto */}
                  <div className="py-4 flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-extrabold text-slate-900">
                        {bestFlight.inbound.departureTime}
                      </div>
                      <div className="text-xs font-semibold text-slate-700">Curitiba (CWB)</div>
                      <div className="text-[11px] text-slate-400">Afonso Pena</div>
                    </div>

                    <div className="flex flex-col items-center px-4">
                      <span className="text-[11px] font-semibold text-slate-500">{bestFlight.inbound.totalDuration}</span>
                      <div className="w-24 md:w-32 h-0.5 bg-emerald-300 relative my-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-600 absolute left-1/2 -top-0.75 -translate-x-1/2"></div>
                      </div>
                      <span className="text-[10px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {bestFlight.inbound.stopsCount} Conexão
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-extrabold text-slate-900">
                        {bestFlight.inbound.arrivalTime}
                      </div>
                      <div className="text-xs font-semibold text-slate-700">Recife (REC)</div>
                      <div className="text-[11px] text-slate-400">Desembarque em Casa</div>
                    </div>
                  </div>

                  {/* Detalhe da Conexão / Escala */}
                  <div className="mt-2 bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between items-center text-slate-700 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Cidade da Escala:
                      </span>
                      <strong className="text-slate-900">{bestFlight.inbound.connectionCity}</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 font-medium">
                      <span>Tempo de Espera no Aeroporto:</span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold rounded">
                        {bestFlight.inbound.layoverDuration}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-emerald-700 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{bestFlight.inbound.kidsComfortRating}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA: COMPARATIVO DAS 4 ROTAS */}
        {activeTab === 'comparison' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs">
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                Comparativo Detalhado das 4 Estratégias de Viagem
              </h3>
              <p className="text-slate-500 text-sm max-w-3xl leading-relaxed">
                Todas partem e voltam 100% para Recife, permitindo visitar Foz do Iguaçu, Curitiba e Pomerode com carro alugado.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* 1. Hub Curitiba */}
                <div className="rounded-2xl p-6 border border-emerald-300 bg-emerald-50/30 shadow-xs relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                      ⭐ Taxa Retorno Carro R$ 0
                    </span>
                    <span className="text-2xl font-black text-slate-900">
                      R$ {topDeals[0]?.options.C.cost.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">1. Hub Curitiba (REC ⇄ Curitiba Voo)</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Voo ida e volta por Curitiba. Carro retirado e devolvido no mesmo aeroporto (CWB).
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-slate-700 border-t border-emerald-200/60 pt-3">
                    <li>• Voo REC ➔ CWB e CWB ➔ REC (4 pessoas): <strong>R$ {topDeals[0]?.options.C.flights.toLocaleString('pt-BR')}</strong></li>
                    <li>• Escala: <strong>{topDeals[0]?.options.C.flightDetails.outbound.layoverDuration} em {topDeals[0]?.options.C.flightDetails.outbound.connectionCity}</strong></li>
                    <li>• Carro ({topDeals[0]?.days} diárias): <strong>R$ {topDeals[0]?.options.C.car.toLocaleString('pt-BR')}</strong></li>
                    <li>• Taxa de devolução em outra cidade: <strong className="text-emerald-700">R$ 0,00 (Isento!)</strong></li>
                    <li>• Rota de carro: Curitiba ➔ Pomerode ➔ Foz do Iguaçu ➔ Curitiba</li>
                  </ul>
                </div>

                {/* 2. Hub Foz */}
                <div className="rounded-2xl p-6 border border-slate-200 bg-white shadow-xs relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full uppercase border border-slate-200">
                      Taxa Retorno Carro R$ 0
                    </span>
                    <span className="text-2xl font-black text-slate-900">
                      R$ {topDeals[0]?.options.D.cost.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">2. Hub Foz (REC ⇄ Foz Voo)</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Voo ida e volta por Foz. Carro retirado e devolvido no aeroporto IGU.
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-slate-700 border-t border-slate-100 pt-3">
                    <li>• Voo REC ➔ IGU e IGU ➔ REC (4 pessoas): <strong>R$ {topDeals[0]?.options.D.flights.toLocaleString('pt-BR')}</strong></li>
                    <li>• Escala: <strong>{topDeals[0]?.options.D.flightDetails.outbound.layoverDuration} em {topDeals[0]?.options.D.flightDetails.outbound.connectionCity}</strong></li>
                    <li>• Carro ({topDeals[0]?.days} diárias): <strong>R$ {topDeals[0]?.options.D.car.toLocaleString('pt-BR')}</strong></li>
                    <li>• Taxa de devolução em outra cidade: <strong className="text-emerald-700">R$ 0,00 (Isento!)</strong></li>
                  </ul>
                </div>

                {/* 3. Open-Jaw A */}
                <div className="rounded-2xl p-6 border border-slate-200 bg-white shadow-xs relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase border border-indigo-200">
                      Múltiplos Destinos
                    </span>
                    <span className="text-2xl font-black text-slate-900">
                      R$ {topDeals[0]?.options.A.cost.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">3. Open-Jaw A (Entra Foz / Sai Curitiba)</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Voo REC ➔ IGU | Carro de Foz até Curitiba (via Pomerode) | Voo CWB ➔ REC.
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-slate-700 border-t border-slate-100 pt-3">
                    <li>• Voos REC ➔ IGU + CWB ➔ REC (4 pessoas): <strong>R$ {topDeals[0]?.options.A.flights.toLocaleString('pt-BR')}</strong></li>
                    <li>• Carro com Taxa de Devolução (Drop-off): <strong>R$ {topDeals[0]?.options.A.car.toLocaleString('pt-BR')}</strong></li>
                    <li>• Vantagem: Menos km de volante (faz o trecho de estrada apenas 1 vez).</li>
                  </ul>
                </div>

                {/* 4. Open-Jaw B */}
                <div className="rounded-2xl p-6 border border-slate-200 bg-white shadow-xs relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase border border-indigo-200">
                      Múltiplos Destinos
                    </span>
                    <span className="text-2xl font-black text-slate-900">
                      R$ {topDeals[0]?.options.B.cost.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">4. Open-Jaw B (Entra Curitiba / Sai Foz)</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Voo REC ➔ CWB | Carro de Curitiba até Foz (via Pomerode) | Voo IGU ➔ REC.
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-slate-700 border-t border-slate-100 pt-3">
                    <li>• Voos REC ➔ CWB + IGU ➔ REC (4 pessoas): <strong>R$ {topDeals[0]?.options.B.flights.toLocaleString('pt-BR')}</strong></li>
                    <li>• Carro com Taxa de Devolução (Drop-off): <strong>R$ {topDeals[0]?.options.B.car.toLocaleString('pt-BR')}</strong></li>
                    <li>• Vantagem: Menos km de volante (faz o trecho de estrada apenas 1 vez).</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA: CARROS */}
        {activeTab === 'cars' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Car className="w-5 h-5 text-indigo-600" />
                    Parâmetros do Aluguel de Carro
                  </h3>
                  <p className="text-slate-500 text-sm mt-0.5">
                    Critério rígido: 4 pessoas, 2 cadeirinhas e bagagens volumosas.
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setCarType('sedan')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      carType === 'sedan'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Sedan Médio (Padrão)
                  </button>
                  <button
                    onClick={() => setCarType('suv')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      carType === 'suv'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    SUV Compacto (+ R$ 40/dia)
                  </button>
                </div>
              </div>

              {/* Exclusão Mobi e Kwid */}
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 mb-6">
                <div className="p-2 bg-rose-100 text-rose-700 rounded-xl shrink-0">
                  <XCircle className="w-5 h-5" />
                </div>
                <div className="text-xs md:text-sm">
                  <h4 className="font-bold text-rose-900">
                    Fiat Mobi e Renault Kwid Estão Terminantemente Bloqueados
                  </h4>
                  <p className="text-rose-700 mt-0.5">
                    Esses veículos têm porta-malas inferior a 290L e banco traseiro apertado, tornando impossível instalar com conforto duas cadeirinhas automotivas e acomodar as malas para 10 dias.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                  <h4 className="font-bold text-slate-900 text-base">Sedan Compacto/Médio</h4>
                  <p className="text-xs text-slate-500">Modelos: Virtus, Onix Plus, Cronos</p>
                  <p className="text-xs text-slate-700 mt-2.5 leading-relaxed">
                    Porta-malas gigante (480L a 520L) que comporta com folga 2 malas grandes, malas de bordo e o carrinho de bebê.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                  <h4 className="font-bold text-slate-900 text-base">SUV Compacto</h4>
                  <p className="text-xs text-slate-500">Modelos: Tracker, T-Cross, Creta, Kicks</p>
                  <p className="text-xs text-slate-700 mt-2.5 leading-relaxed">
                    Altura do solo elevada, ótima visibilidade e suspensão mais robusta para serras e rodovias interestaduais.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA: ROTEIRO DIA A DIA */}
        {activeTab === 'itinerary' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs">
              <div className="mb-6">
                <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-sky-600" />
                  Roteiro Dia a Dia das Crianças (2 e 5 anos)
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Paradas a cada 2h na estrada, atrações planas para carrinho e dias intercalados de descanso.
                </p>
              </div>

              <div className="space-y-3">
                {itinerary.map((item) => {
                  const isExpanded = expandedDay === item.day;

                  return (
                    <div
                      key={item.day}
                      className="border border-slate-200 bg-slate-50/60 rounded-2xl overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => setExpandedDay(isExpanded ? null : item.day)}
                        className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-100/70 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 font-bold text-sm flex items-center justify-center border border-sky-200">
                            D{item.day}
                          </span>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm md:text-base">
                              {item.title}
                            </h4>
                            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                              <span>{item.location}</span>
                              <span>•</span>
                              <span>{formatDate(item.date)}</span>
                            </div>
                          </div>
                        </div>

                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="p-4 pt-1 border-t border-slate-200/80 bg-white space-y-3 text-xs md:text-sm">
                          <div>
                            <span className="font-bold text-slate-800">Atividades Planejadas:</span>
                            <ul className="mt-2 space-y-1.5">
                              {item.activities.map((act, i) => (
                                <li key={i} className="flex items-start gap-2 text-slate-700">
                                  <ArrowRightCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                                  <span>{act}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 flex items-start gap-2.5 text-xs">
                            <Baby className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-sky-900">Dica Especial para os Filhos:</strong>{' '}
                              <span className="text-slate-700">{item.kidsTips}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL NTFY */}
      {showNtfyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-sky-600" />
                  Notificações Push no Celular (ntfy)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  100% gratuito e sem necessidade de login.
                </p>
              </div>
              <button
                onClick={() => setShowNtfyModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Passo 1: Instale o App</span>
                <p>Baixe o aplicativo <strong>ntfy</strong> na Google Play Store ou App Store.</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-slate-500 font-bold uppercase text-[10px]">Passo 2: Inscreva-se no seu Tópico</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={ntfyTopic}
                    onChange={(e) => setNtfyTopic(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
                <a
                  href={`https://ntfy.sh/${ntfyTopic}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sky-600 hover:underline text-[11px] font-medium"
                >
                  <span>Abrir tópico no navegador</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  onClick={sendTestNotification}
                  className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  <span>Enviar Notificação de Teste no Celular</span>
                </button>
                {ntfyStatus && (
                  <p className="text-center font-medium text-[11px] text-sky-700">
                    {ntfyStatus}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-center">
              <button
                onClick={() => setShowNtfyModal(false)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
