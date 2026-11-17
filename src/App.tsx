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
  Compass, 
  Moon, 
  RefreshCw, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  XCircle, 
  Repeat, 
  ArrowRightCircle, 
  CheckCircle2, 
  Building2, 
  Flame, 
  Tag 
} from 'lucide-react';

interface FlightLeg {
  flightNumber: string;
  airline: string;
  bookingUrl: string;
  googleFlightsUrl: string;
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
  isBlackFriday: boolean;
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
  isBlackFriday: boolean;
  options: {
    A: StrategyOption;
    B: StrategyOption;
    C: StrategyOption;
    D: StrategyOption;
  };
}

interface HotelOption {
  name: string;
  type: string;
  avgDaily: number;
  total3Nights?: number;
  total2Nights?: number;
  total4Nights?: number;
  amenities: string[];
  rating: string;
  location: string;
  city?: string;
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
    isBlackFriday: boolean;
    savedChildSeatCost: number;
    flightDetails: {
      outbound: FlightLeg;
      inbound: FlightLeg;
    };
  };
  hotels: {
    foz: HotelOption[];
    estrada: HotelOption[];
    pomerode: HotelOption[];
    curitiba: HotelOption[];
  };
  officialLinks: {
    gol: string;
    latam: string;
    azul: string;
    googleFlights: string;
    localiza: string;
    movida: string;
    unidas: string;
  };
  topDeals: Deal[];
  allDeals: Deal[];
  itinerary: Array<{
    day: number;
    date: string;
    title: string;
    location: string;
    activities: string[];
    kidsTips: string;
  }>;
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
  const [activeTab, setActiveTab] = useState<'overview' | 'flights' | 'hotels' | 'comparison' | 'cars' | 'itinerary'>('overview');

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
          title: '🔥 Black Friday SCM: Férias 2027',
          message: 'Radar de Black Friday e links oficiais de compra prontos no seu celular!\nHotéis familiares simples inclusos com valores reais.',
          priority: 4,
          tags: ['fire', 'airplane', 'hotel'],
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
        <h2 className="text-lg font-semibold text-slate-900">Carregando cotações com Black Friday e Hotéis...</h2>
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

  const { summary, topDeals, hotels, officialLinks, itinerary } = data;
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
      {/* Barra de Status */}
      <div className="bg-white border-b border-slate-200/80 px-4 py-2.5 shadow-xs">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-700">Robô Ativo (Varredura Contínua)</span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="text-rose-600 font-bold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              Radar Black Friday & Feirões Ativo
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 text-xs">
              <Moon className="w-3.5 h-3.5 text-indigo-500" />
              <span>Modo Madrugada: Alarme só para Super Ofertas</span>
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

      {/* Header com Logo */}
      <header className="max-w-6xl mx-auto px-4 pt-8 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white p-1 shadow-md border border-slate-200/80 flex items-center justify-center shrink-0">
              <img src="/logo.svg" alt="SCM Férias 2027" className="w-full h-full object-contain" />
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
                Voos com links oficiais de compra, hotéis simples e aluguel de carro (sem Mobi/Kwid).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white border border-slate-200 p-3 rounded-2xl shadow-xs">
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-slate-800">4 Passageiros</div>
              <div className="text-slate-500">2 Adultos + Filhos (5 e 2,5 anos)</div>
            </div>
          </div>
        </div>

        {/* Abas Suaves */}
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
            Visão Geral & Pacote
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
            Horários & Links de Compra
          </button>
          <button
            onClick={() => setActiveTab('hotels')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
              activeTab === 'hotels'
                ? 'bg-sky-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Hotéis Simples & Econômicos
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
            Aluguel de Carro
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
            Roteiro Dia a Dia
          </button>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-6xl mx-auto px-4 mt-6">
        {/* ABA: VISÃO GERAL */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Card Campeão */}
            <div className="relative overflow-hidden bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="absolute top-0 right-0 bg-sky-600 text-white text-[11px] font-bold uppercase px-4 py-1.5 rounded-bl-2xl tracking-wider flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                Melhor Custo Logístico
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                      🏆 {summary.bestStrategyName}
                    </span>
                    {summary.isBlackFriday && (
                      <span className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
                        Oferta Especial Black Friday Ativa!
                      </span>
                    )}
                  </div>

                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                      {formatDate(summary.bestDeparture)} até {formatDate(summary.bestReturn)} ({summary.bestDays} dias)
                    </h2>
                    <p className="text-sky-700 font-medium text-sm mt-0.5">
                      Saída de Recife e Retorno Garantido para Recife
                    </p>
                  </div>

                  {/* Resumo */}
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
                        {summary.dropoffFee === 0 ? 'Taxa retorno: R$ 0 (Isento)' : `Taxa retorno: R$ ${summary.dropoffFee}`}
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
                        Poupados levando no avião
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preço e Botões Oficiais */}
                <div className="bg-gradient-to-b from-sky-50/80 to-white border border-sky-100 rounded-2xl p-6 flex flex-col justify-between items-center text-center shadow-xs">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
                      Custo Logístico Total
                    </span>
                    <div className="text-4xl font-black text-slate-900 mt-2">
                      R$ {getAdjustedPrice(summary.cheapestTotal, summary.bestDays).toLocaleString('pt-BR')}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Voos dos 4 (Ida e Volta a Recife) + Carro
                    </div>
                  </div>

                  <div className="w-full mt-6 space-y-2">
                    <a
                      href={bestFlight.outbound.bookingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm text-sm"
                    >
                      <span>Comprar no Site Oficial ({bestFlight.outbound.airline.split(' ')[0]})</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => setActiveTab('hotels')}
                      className="w-full py-2 px-4 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Building2 className="w-3.5 h-3.5 text-sky-600" />
                      <span>Ver Hotéis Simples Recomendados</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Links Rápidos das Cias Aéreas */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-xs">
              <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-sky-600" />
                Acesso Rápido aos Portais Oficiais para Monitorar ou Comprar
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <a
                  href={officialLinks.gol}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-300 rounded-xl flex items-center justify-between transition-all"
                >
                  <span className="font-bold text-orange-600">GOL Linhas Aéreas</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
                <a
                  href={officialLinks.azul}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-xl flex items-center justify-between transition-all"
                >
                  <span className="font-bold text-sky-600">Azul Linhas Aéreas</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
                <a
                  href={officialLinks.latam}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 rounded-xl flex items-center justify-between transition-all"
                >
                  <span className="font-bold text-rose-600">LATAM Airlines</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
                <a
                  href={bestFlight.outbound.googleFlightsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl flex items-center justify-between transition-all"
                >
                  <span className="font-bold text-blue-600">Google Flights Oficial</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              </div>
            </div>

            {/* Grid com as Melhores Datas e Filtros */}
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

        {/* ABA: HORÁRIOS & LINKS OFICIAIS */}
        {activeTab === 'flights' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                    Detalhes dos Voos
                  </span>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
                    Horários, Escalas e Links Diretos
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={bestFlight.outbound.bookingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Entrar no Site da {bestFlight.outbound.airline.split(' ')[0]}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
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

                  <div className="py-4 flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-extrabold text-slate-900">
                        {bestFlight.outbound.departureTime}
                      </div>
                      <div className="text-xs font-semibold text-slate-700">Recife (REC)</div>
                    </div>

                    <div className="flex flex-col items-center px-4">
                      <span className="text-[11px] font-semibold text-slate-500">{bestFlight.outbound.totalDuration}</span>
                      <div className="w-24 md:w-32 h-0.5 bg-sky-300 relative my-1">
                        <div className="w-2 h-2 rounded-full bg-sky-600 absolute left-1/2 -top-0.75 -translate-x-1/2"></div>
                      </div>
                      <span className="text-[10px] text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {bestFlight.outbound.stopsCount} Conexão
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-extrabold text-slate-900">
                        {bestFlight.outbound.arrivalTime}
                      </div>
                      <div className="text-xs font-semibold text-slate-700">Curitiba (CWB)</div>
                    </div>
                  </div>

                  <div className="mt-2 bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between items-center text-slate-700 font-medium">
                      <span>Aeroporto da Escala:</span>
                      <strong className="text-slate-900">{bestFlight.outbound.connectionCity}</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 font-medium">
                      <span>Tempo de Espera:</span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold rounded">
                        {bestFlight.outbound.layoverDuration}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-emerald-700 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{bestFlight.outbound.kidsComfortRating}</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <a
                      href={bestFlight.outbound.bookingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <span>Abrir no Site Oficial da {bestFlight.outbound.airline.split(' ')[0]}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
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

                  <div className="py-4 flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-extrabold text-slate-900">
                        {bestFlight.inbound.departureTime}
                      </div>
                      <div className="text-xs font-semibold text-slate-700">Curitiba (CWB)</div>
                    </div>

                    <div className="flex flex-col items-center px-4">
                      <span className="text-[11px] font-semibold text-slate-500">{bestFlight.inbound.totalDuration}</span>
                      <div className="w-24 md:w-32 h-0.5 bg-emerald-300 relative my-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-600 absolute left-1/2 -top-0.75 -translate-x-1/2"></div>
                      </div>
                      <span className="text-[10px] text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {bestFlight.inbound.stopsCount} Conexão
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-extrabold text-slate-900">
                        {bestFlight.inbound.arrivalTime}
                      </div>
                      <div className="text-xs font-semibold text-slate-700">Recife (REC)</div>
                    </div>
                  </div>

                  <div className="mt-2 bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between items-center text-slate-700 font-medium">
                      <span>Aeroporto da Escala:</span>
                      <strong className="text-slate-900">{bestFlight.inbound.connectionCity}</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-700 font-medium">
                      <span>Tempo de Espera:</span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold rounded">
                        {bestFlight.inbound.layoverDuration}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-emerald-700 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{bestFlight.inbound.kidsComfortRating}</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <a
                      href={bestFlight.inbound.bookingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <span>Abrir no Site Oficial da {bestFlight.inbound.airline.split(' ')[0]}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA: HOTÉIS SIMPLES & ECONÔMICOS */}
        {activeTab === 'hotels' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs">
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Hospedagem Familiar sem Frescura
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
                  Opções de Hotéis Simples com Valores Reais
                </h3>
                <p className="text-slate-500 text-sm mt-0.5">
                  Quartos quádruplos ou familiares (2 adultos + 2 crianças), limpos, com café da manhã incluso e sem preços exorbitantes de resorts.
                </p>
              </div>

              <div className="space-y-8">
                {/* FOZ DO IGUAÇU */}
                <div>
                  <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-sky-600" />
                    Foz do Iguaçu (PR) • ~3 Diárias
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {hotels.foz.map((hotel, i) => (
                      <div key={i} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-bold text-slate-900 text-base">{hotel.name}</h5>
                            <span className="text-xs text-slate-500">{hotel.type} • {hotel.location}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-black text-slate-900">R$ {hotel.avgDaily}</span>
                            <span className="text-[11px] text-slate-500 block">/ noite (família)</span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap gap-1.5 text-[11px]">
                          {hotel.amenities.map((a, j) => (
                            <span key={j} className="bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700">
                              ✓ {a}
                            </span>
                          ))}
                        </div>
                        <div className="mt-3 text-xs text-emerald-700 font-semibold flex justify-between items-center">
                          <span>Avaliação: {hotel.rating}</span>
                          <span>Total 3 noites: ~R$ {hotel.total3Nights}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PARADA DE ESTRADA */}
                <div>
                  <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <Car className="w-4 h-4 text-indigo-600" />
                    Parada de Estrada (Pernoite Estratégico no Meio do Caminho)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {hotels.estrada.map((hotel, i) => (
                      <div key={i} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-bold text-slate-900 text-base">{hotel.name}</h5>
                            <span className="text-xs text-sky-700 font-semibold">{hotel.city}</span>
                            <span className="text-xs text-slate-500 block">{hotel.location}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-black text-slate-900">R$ {hotel.avgDaily}</span>
                            <span className="text-[11px] text-slate-500 block">/ 1 pernoite</span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap gap-1.5 text-[11px]">
                          {hotel.amenities.map((a, j) => (
                            <span key={j} className="bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700">
                              ✓ {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* POMERODE */}
                <div>
                  <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    Pomerode (SC) • Vale Europeu (~2 Diárias)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {hotels.pomerode.map((hotel, i) => (
                      <div key={i} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-bold text-slate-900 text-base">{hotel.name}</h5>
                            <span className="text-xs text-slate-500">{hotel.type} • {hotel.location}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-black text-slate-900">R$ {hotel.avgDaily}</span>
                            <span className="text-[11px] text-slate-500 block">/ noite</span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap gap-1.5 text-[11px]">
                          {hotel.amenities.map((a, j) => (
                            <span key={j} className="bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700">
                              ✓ {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CURITIBA */}
                <div>
                  <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    Curitiba (PR) • ~4 Diárias
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {hotels.curitiba.map((hotel, i) => (
                      <div key={i} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-bold text-slate-900 text-base">{hotel.name}</h5>
                            <span className="text-xs text-slate-500">{hotel.type} • {hotel.location}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-black text-slate-900">R$ {hotel.avgDaily}</span>
                            <span className="text-[11px] text-slate-500 block">/ noite</span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap gap-1.5 text-[11px]">
                          {hotel.amenities.map((a, j) => (
                            <span key={j} className="bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700">
                              ✓ {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
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
                Comparativo das 4 Opções Logísticas
              </h3>
              <p className="text-slate-500 text-sm max-w-3xl leading-relaxed">
                Todas saem de Recife e voltam para Recife.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="rounded-2xl p-6 border border-emerald-300 bg-emerald-50/30 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                      Taxa Retorno Carro R$ 0
                    </span>
                    <span className="text-2xl font-black text-slate-900">
                      R$ {topDeals[0]?.options.C.cost.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">1. Hub Curitiba (REC ⇄ Curitiba Voo)</h4>
                  <p className="text-xs text-slate-600 mt-1">Carro devolvido no mesmo aeroporto CWB.</p>
                </div>

                <div className="rounded-2xl p-6 border border-slate-200 bg-white shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full uppercase border border-slate-200">
                      Taxa Retorno Carro R$ 0
                    </span>
                    <span className="text-2xl font-black text-slate-900">
                      R$ {topDeals[0]?.options.D.cost.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">2. Hub Foz (REC ⇄ Foz Voo)</h4>
                  <p className="text-xs text-slate-600 mt-1">Carro devolvido no aeroporto IGU.</p>
                </div>

                <div className="rounded-2xl p-6 border border-slate-200 bg-white shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase border border-indigo-200">
                      Múltiplos Destinos
                    </span>
                    <span className="text-2xl font-black text-slate-900">
                      R$ {topDeals[0]?.options.A.cost.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">3. Open-Jaw A (Entra Foz / Sai Curitiba)</h4>
                  <p className="text-xs text-slate-600 mt-1">Voo REC ➔ IGU + CWB ➔ REC.</p>
                </div>

                <div className="rounded-2xl p-6 border border-slate-200 bg-white shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase border border-indigo-200">
                      Múltiplos Destinos
                    </span>
                    <span className="text-2xl font-black text-slate-900">
                      R$ {topDeals[0]?.options.B.cost.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">4. Open-Jaw B (Entra Curitiba / Sai Foz)</h4>
                  <p className="text-xs text-slate-600 mt-1">Voo REC ➔ CWB + IGU ➔ REC.</p>
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
                    Porta-malas espaçoso para 4 pessoas e 2 cadeirinhas.
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

              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 mb-6">
                <div className="p-2 bg-rose-100 text-rose-700 rounded-xl shrink-0">
                  <XCircle className="w-5 h-5" />
                </div>
                <div className="text-xs md:text-sm">
                  <h4 className="font-bold text-rose-900">
                    Fiat Mobi e Renault Kwid Estão Totalmente Bloqueados
                  </h4>
                  <p className="text-rose-700 mt-0.5">
                    Porta-malas abaixo de 290L e banco traseiro inadequado para 2 cadeirinhas automotivas.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                  <h4 className="font-bold text-slate-900 text-base">Sedan Médio/Compacto</h4>
                  <p className="text-xs text-slate-500">Exemplos: Virtus, Onix Plus, Cronos (480L a 520L)</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                  <h4 className="font-bold text-slate-900 text-base">SUV Compacto</h4>
                  <p className="text-xs text-slate-500">Exemplos: Tracker, T-Cross, Creta, Kicks</p>
                </div>
              </div>

              {/* Links Locadoras */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 text-sm mb-3">Links Oficiais das Locadoras de Veículos:</h4>
                <div className="flex flex-wrap gap-3 text-xs">
                  <a href={officialLinks.localiza} target="_blank" rel="noreferrer" className="px-4 py-2 bg-slate-100 hover:bg-emerald-50 text-slate-700 font-bold rounded-xl border border-slate-200 flex items-center gap-1.5">
                    <span>Localiza Oficial</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a href={officialLinks.movida} target="_blank" rel="noreferrer" className="px-4 py-2 bg-slate-100 hover:bg-orange-50 text-slate-700 font-bold rounded-xl border border-slate-200 flex items-center gap-1.5">
                    <span>Movida Oficial</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a href={officialLinks.unidas} target="_blank" rel="noreferrer" className="px-4 py-2 bg-slate-100 hover:bg-blue-50 text-slate-700 font-bold rounded-xl border border-slate-200 flex items-center gap-1.5">
                    <span>Unidas Oficial</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
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
                {itinerary && itinerary.map((item) => {
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
