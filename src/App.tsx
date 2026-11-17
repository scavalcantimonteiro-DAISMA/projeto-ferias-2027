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
  XCircle, 
  Repeat, 
  Building2, 
  Utensils,
  Flame, 
  X,
  CreditCard
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

interface RestaurantOption {
  name: string;
  category: string;
  highlight: string;
  priceRange: string;
  address: string;
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
  restaurants: {
    foz: RestaurantOption[];
    pomerode: RestaurantOption[];
    curitiba: RestaurantOption[];
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
  const [selectedDealModal, setSelectedDealModal] = useState<Deal | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'flights' | 'hotels' | 'restaurants' | 'comparison' | 'cars' | 'itinerary'>('overview');

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
          message: 'Notificações ativas no celular com modal interativo e links oficiais de compra!',
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
        <h2 className="text-lg font-semibold text-slate-900">Carregando painel de monitoramento SCM...</h2>
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

  const { summary, topDeals, hotels, restaurants, officialLinks } = data;
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
            <span className="font-semibold text-slate-700">Robô Ativo (4 Horários Diários)</span>
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
                Clique em qualquer data para abrir a ficha completa do pacote (voos, carro, hotéis e links).
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

        {/* Abas */}
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
            Visão Geral & Pacotes
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
            Hotéis Simples
          </button>
          <button
            onClick={() => setActiveTab('restaurants')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
              activeTab === 'restaurants'
                ? 'bg-sky-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Utensils className="w-4 h-4" />
            Restaurantes Temáticos & Kids
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
                    <button
                      onClick={() => setSelectedDealModal(topDeals[0])}
                      className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm text-sm"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Abrir Detalhes Deste Pacote</span>
                    </button>
                    <a
                      href={bestFlight.outbound.bookingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 px-4 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Site Oficial da {bestFlight.outbound.airline.split(' ')[0]}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* SEÇÃO INTERATIVA: CLIQUE EM QUALQUER DATA PARA ABRIR EM OUTRA TELA */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-sky-600" />
                    Datas Analisadas (Toque no Card para Abrir os Detalhes)
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Selecione qualquer data para ver tudo separado: voos, horários, opções de carro, hotéis e links de compra.
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

              {/* Grid Interativo de Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {filteredDeals.map((deal, index) => {
                  const winner = deal.options[deal.winnerType];
                  const price = getAdjustedPrice(deal.cheapestTotal, deal.days);

                  return (
                    <div
                      key={deal.id}
                      onClick={() => setSelectedDealModal(deal)}
                      className={`group cursor-pointer relative bg-slate-50/70 border rounded-2xl p-4.5 transition-all hover:border-sky-500 hover:bg-sky-50/40 hover:shadow-md ${
                        index === 0
                          ? 'border-sky-400 bg-sky-50/30'
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
                          <div className="text-slate-900 font-extrabold text-base group-hover:text-sky-700 transition-colors flex items-center gap-1.5">
                            <span>{formatDate(deal.departure)} ➔ {formatDate(deal.returnDate)}</span>
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
                          <div className="text-xl font-black text-slate-900 group-hover:text-sky-700 transition-colors">
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
                        <div className="flex items-center gap-1 text-sky-600 font-semibold group-hover:translate-x-1 transition-transform">
                          <span>Ver Detalhes</span>
                          <span>→</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* DEMAIS ABAS PERMANECEM COM AS MESMAS FUNÇÕES RICAS */}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* VOO DE IDA */}
                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/60">
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
                  </div>
                </div>

                {/* VOO DE VOLTA */}
                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/60">
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
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA: RESTAURANTES TEMÁTICOS & EM CONTA */}
        {activeTab === 'restaurants' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs">
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  Gastronomia Lúdica & Econômica
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
                  Restaurantes Temáticos & Em Conta para a Família
                </h3>
                <p className="text-slate-500 text-sm mt-0.5">
                  Lugares com espaços kids gigantes, dinossauros, shows infantis e opções de refeições fartas com preço justo.
                </p>
              </div>

              <div className="space-y-8">
                {/* CURITIBA */}
                <div>
                  <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    Curitiba (PR) • Destaques Imperdíveis
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {restaurants.curitiba.map((rest, i) => (
                      <div key={i} className="border border-slate-200 rounded-2xl p-4.5 bg-slate-50/70 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                              {rest.category}
                            </span>
                          </div>
                          <h5 className="font-bold text-slate-900 text-base mt-2">{rest.name}</h5>
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{rest.highlight}</p>
                          <span className="text-[11px] text-slate-400 block mt-2">📍 {rest.address}</span>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-bold text-slate-800">
                          {rest.priceRange}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FOZ DO IGUAÇU */}
                <div>
                  <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-sky-600" />
                    Foz do Iguaçu (PR) • Temáticos & Buffets Fartos
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {restaurants.foz.map((rest, i) => (
                      <div key={i} className="border border-slate-200 rounded-2xl p-4.5 bg-slate-50/70 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[11px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md">
                              {rest.category}
                            </span>
                          </div>
                          <h5 className="font-bold text-slate-900 text-base mt-2">{rest.name}</h5>
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{rest.highlight}</p>
                          <span className="text-[11px] text-slate-400 block mt-2">📍 {rest.address}</span>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-bold text-slate-800">
                          {rest.priceRange}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* POMERODE */}
                <div>
                  <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    Pomerode (SC) • Tradição Germânica & Parquinhos
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {restaurants.pomerode.map((rest, i) => (
                      <div key={i} className="border border-slate-200 rounded-2xl p-4.5 bg-slate-50/70 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                              {rest.category}
                            </span>
                          </div>
                          <h5 className="font-bold text-slate-900 text-base mt-2">{rest.name}</h5>
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{rest.highlight}</p>
                          <span className="text-[11px] text-slate-400 block mt-2">📍 {rest.address}</span>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-bold text-slate-800">
                          {rest.priceRange}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HOTÉIS */}
        {activeTab === 'hotels' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs">
              <h3 className="text-2xl font-extrabold text-slate-900 mb-2">
                Opções de Hotéis Simples com Valores Reais
              </h3>
              <p className="text-slate-500 text-sm mb-6">
                Quartos quádruplos/familiares limpos com café da manhã incluso.
              </p>

              <div className="space-y-8">
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
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <Car className="w-4 h-4 text-indigo-600" />
                    Parada de Estrada (Pernoite no Meio do Caminho)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {hotels.estrada.map((hotel, i) => (
                      <div key={i} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-bold text-slate-900 text-base">{hotel.name}</h5>
                            <span className="text-xs text-sky-700 font-semibold">{hotel.city}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-black text-slate-900">R$ {hotel.avgDaily}</span>
                            <span className="text-[11px] text-slate-500 block">/ pernoite</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

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
                            <span className="text-xs text-slate-500">{hotel.type}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-black text-slate-900">R$ {hotel.avgDaily}</span>
                            <span className="text-[11px] text-slate-500 block">/ noite</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

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
                            <span className="text-xs text-slate-500">{hotel.type}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-black text-slate-900">R$ {hotel.avgDaily}</span>
                            <span className="text-[11px] text-slate-500 block">/ noite</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA: RESTAURANTES TEMÁTICOS & EM CONTA */}
        {activeTab === 'restaurants' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs">
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  Gastronomia Lúdica & Econômica
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
                  Restaurantes Temáticos & Em Conta para a Família
                </h3>
                <p className="text-slate-500 text-sm mt-0.5">
                  Lugares com espaços kids gigantes, dinossauros, shows infantis e opções de refeições fartas com preço justo.
                </p>
              </div>

              <div className="space-y-8">
                {/* CURITIBA */}
                <div>
                  <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    Curitiba (PR) • Destaques Imperdíveis
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {restaurants.curitiba.map((rest, i) => (
                      <div key={i} className="border border-slate-200 rounded-2xl p-4.5 bg-slate-50/70 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                              {rest.category}
                            </span>
                          </div>
                          <h5 className="font-bold text-slate-900 text-base mt-2">{rest.name}</h5>
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{rest.highlight}</p>
                          <span className="text-[11px] text-slate-400 block mt-2">📍 {rest.address}</span>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-bold text-slate-800">
                          {rest.priceRange}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FOZ DO IGUAÇU */}
                <div>
                  <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-sky-600" />
                    Foz do Iguaçu (PR) • Temáticos & Buffets Fartos
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {restaurants.foz.map((rest, i) => (
                      <div key={i} className="border border-slate-200 rounded-2xl p-4.5 bg-slate-50/70 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[11px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md">
                              {rest.category}
                            </span>
                          </div>
                          <h5 className="font-bold text-slate-900 text-base mt-2">{rest.name}</h5>
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{rest.highlight}</p>
                          <span className="text-[11px] text-slate-400 block mt-2">📍 {rest.address}</span>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-bold text-slate-800">
                          {rest.priceRange}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* POMERODE */}
                <div>
                  <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    Pomerode (SC) • Tradição Germânica & Parquinhos
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {restaurants.pomerode.map((rest, i) => (
                      <div key={i} className="border border-slate-200 rounded-2xl p-4.5 bg-slate-50/70 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                              {rest.category}
                            </span>
                          </div>
                          <h5 className="font-bold text-slate-900 text-base mt-2">{rest.name}</h5>
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{rest.highlight}</p>
                          <span className="text-[11px] text-slate-400 block mt-2">📍 {rest.address}</span>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-bold text-slate-800">
                          {rest.priceRange}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COMPARATIVO 4 ROTAS */}
        {activeTab === 'comparison' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs">
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                Comparativo das 4 Opções Logísticas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="rounded-2xl p-6 border border-emerald-300 bg-emerald-50/30">
                  <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                    Taxa Retorno Carro R$ 0
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    R$ {topDeals[0]?.options.C.cost.toLocaleString('pt-BR')}
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mt-2">1. Hub Curitiba (REC ⇄ Curitiba Voo)</h4>
                </div>

                <div className="rounded-2xl p-6 border border-slate-200 bg-white">
                  <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full uppercase border border-slate-200">
                    Taxa Retorno Carro R$ 0
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    R$ {topDeals[0]?.options.D.cost.toLocaleString('pt-BR')}
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mt-2">2. Hub Foz (REC ⇄ Foz Voo)</h4>
                </div>

                <div className="rounded-2xl p-6 border border-slate-200 bg-white">
                  <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase border border-indigo-200">
                    Múltiplos Destinos
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    R$ {topDeals[0]?.options.A.cost.toLocaleString('pt-BR')}
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mt-2">3. Open-Jaw A (Entra Foz / Sai Curitiba)</h4>
                </div>

                <div className="rounded-2xl p-6 border border-slate-200 bg-white">
                  <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase border border-indigo-200">
                    Múltiplos Destinos
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    R$ {topDeals[0]?.options.B.cost.toLocaleString('pt-BR')}
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mt-2">4. Open-Jaw B (Entra Curitiba / Sai Foz)</h4>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA: RESTAURANTES TEMÁTICOS & EM CONTA */}
        {activeTab === 'restaurants' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs">
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  Gastronomia Lúdica & Econômica
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
                  Restaurantes Temáticos & Em Conta para a Família
                </h3>
                <p className="text-slate-500 text-sm mt-0.5">
                  Lugares com espaços kids gigantes, dinossauros, shows infantis e opções de refeições fartas com preço justo.
                </p>
              </div>

              <div className="space-y-8">
                {/* CURITIBA */}
                <div>
                  <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    Curitiba (PR) • Destaques Imperdíveis
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {restaurants.curitiba.map((rest, i) => (
                      <div key={i} className="border border-slate-200 rounded-2xl p-4.5 bg-slate-50/70 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                              {rest.category}
                            </span>
                          </div>
                          <h5 className="font-bold text-slate-900 text-base mt-2">{rest.name}</h5>
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{rest.highlight}</p>
                          <span className="text-[11px] text-slate-400 block mt-2">📍 {rest.address}</span>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-bold text-slate-800">
                          {rest.priceRange}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FOZ DO IGUAÇU */}
                <div>
                  <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-sky-600" />
                    Foz do Iguaçu (PR) • Temáticos & Buffets Fartos
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {restaurants.foz.map((rest, i) => (
                      <div key={i} className="border border-slate-200 rounded-2xl p-4.5 bg-slate-50/70 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[11px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md">
                              {rest.category}
                            </span>
                          </div>
                          <h5 className="font-bold text-slate-900 text-base mt-2">{rest.name}</h5>
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{rest.highlight}</p>
                          <span className="text-[11px] text-slate-400 block mt-2">📍 {rest.address}</span>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-bold text-slate-800">
                          {rest.priceRange}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* POMERODE */}
                <div>
                  <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    Pomerode (SC) • Tradição Germânica & Parquinhos
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {restaurants.pomerode.map((rest, i) => (
                      <div key={i} className="border border-slate-200 rounded-2xl p-4.5 bg-slate-50/70 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                              {rest.category}
                            </span>
                          </div>
                          <h5 className="font-bold text-slate-900 text-base mt-2">{rest.name}</h5>
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{rest.highlight}</p>
                          <span className="text-[11px] text-slate-400 block mt-2">📍 {rest.address}</span>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-bold text-slate-800">
                          {rest.priceRange}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CARROS */}
        {activeTab === 'cars' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h3 className="text-xl font-bold text-slate-900">Aluguel do Carro (Sem Mobi/Kwid)</h3>
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                  <button
                    onClick={() => setCarType('sedan')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      carType === 'sedan' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Sedan Médio (Padrão)
                  </button>
                  <button
                    onClick={() => setCarType('suv')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      carType === 'suv' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    SUV (+ R$ 40/dia)
                  </button>
                </div>
              </div>
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 mb-6">
                <XCircle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                <div className="text-xs text-rose-700">
                  <strong className="text-rose-900">Mobi e Kwid excluídos:</strong> Porta-malas insuficiente para 4 pessoas e 2 cadeirinhas.
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                  <h4 className="font-bold text-slate-900">Sedan Médio/Compacto</h4>
                  <p className="text-xs text-slate-500 mt-1">Virtus, Onix Plus, Cronos (Porta-malas 480L a 520L)</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl">
                  <h4 className="font-bold text-slate-900">SUV Compacto</h4>
                  <p className="text-xs text-slate-500 mt-1">Tracker, T-Cross, Creta, Kicks (Maior conforto para serra)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA: RESTAURANTES TEMÁTICOS & EM CONTA */}
        {activeTab === 'restaurants' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs">
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  Gastronomia Lúdica & Econômica
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
                  Restaurantes Temáticos & Em Conta para a Família
                </h3>
                <p className="text-slate-500 text-sm mt-0.5">
                  Lugares com espaços kids gigantes, dinossauros, shows infantis e opções de refeições fartas com preço justo.
                </p>
              </div>

              <div className="space-y-8">
                {/* CURITIBA */}
                <div>
                  <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    Curitiba (PR) • Destaques Imperdíveis
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {restaurants.curitiba.map((rest, i) => (
                      <div key={i} className="border border-slate-200 rounded-2xl p-4.5 bg-slate-50/70 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                              {rest.category}
                            </span>
                          </div>
                          <h5 className="font-bold text-slate-900 text-base mt-2">{rest.name}</h5>
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{rest.highlight}</p>
                          <span className="text-[11px] text-slate-400 block mt-2">📍 {rest.address}</span>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-bold text-slate-800">
                          {rest.priceRange}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FOZ DO IGUAÇU */}
                <div>
                  <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-sky-600" />
                    Foz do Iguaçu (PR) • Temáticos & Buffets Fartos
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {restaurants.foz.map((rest, i) => (
                      <div key={i} className="border border-slate-200 rounded-2xl p-4.5 bg-slate-50/70 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[11px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md">
                              {rest.category}
                            </span>
                          </div>
                          <h5 className="font-bold text-slate-900 text-base mt-2">{rest.name}</h5>
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{rest.highlight}</p>
                          <span className="text-[11px] text-slate-400 block mt-2">📍 {rest.address}</span>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-bold text-slate-800">
                          {rest.priceRange}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* POMERODE */}
                <div>
                  <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    Pomerode (SC) • Tradição Germânica & Parquinhos
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {restaurants.pomerode.map((rest, i) => (
                      <div key={i} className="border border-slate-200 rounded-2xl p-4.5 bg-slate-50/70 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                              {rest.category}
                            </span>
                          </div>
                          <h5 className="font-bold text-slate-900 text-base mt-2">{rest.name}</h5>
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{rest.highlight}</p>
                          <span className="text-[11px] text-slate-400 block mt-2">📍 {rest.address}</span>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-bold text-slate-800">
                          {rest.priceRange}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ROTEIRO */}
        {activeTab === 'itinerary' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs">
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">Roteiro Dia a Dia das Crianças (2 e 5 anos)</h3>
              <p className="text-slate-500 text-xs mb-4">Paradas a cada 2h na estrada e atrações lúdicas.</p>
              <div className="space-y-2">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                  Roteiro de 8 a 10 dias cobrindo Foz do Iguaçu (Cataratas e Parque das Aves), estrada com pernoite em Guarapuava, Pomerode (Vila Encantada dos Dinossauros) e Curitiba (Bosque Alemão e Barigui) com volta para o Recife.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA: RESTAURANTES TEMÁTICOS & EM CONTA */}
        {activeTab === 'restaurants' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs">
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  Gastronomia Lúdica & Econômica
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
                  Restaurantes Temáticos & Em Conta para a Família
                </h3>
                <p className="text-slate-500 text-sm mt-0.5">
                  Lugares com espaços kids gigantes, dinossauros, shows infantis e opções de refeições fartas com preço justo.
                </p>
              </div>

              <div className="space-y-8">
                {/* CURITIBA */}
                <div>
                  <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    Curitiba (PR) • Destaques Imperdíveis
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {restaurants.curitiba.map((rest, i) => (
                      <div key={i} className="border border-slate-200 rounded-2xl p-4.5 bg-slate-50/70 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                              {rest.category}
                            </span>
                          </div>
                          <h5 className="font-bold text-slate-900 text-base mt-2">{rest.name}</h5>
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{rest.highlight}</p>
                          <span className="text-[11px] text-slate-400 block mt-2">📍 {rest.address}</span>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-bold text-slate-800">
                          {rest.priceRange}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FOZ DO IGUAÇU */}
                <div>
                  <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-sky-600" />
                    Foz do Iguaçu (PR) • Temáticos & Buffets Fartos
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {restaurants.foz.map((rest, i) => (
                      <div key={i} className="border border-slate-200 rounded-2xl p-4.5 bg-slate-50/70 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[11px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md">
                              {rest.category}
                            </span>
                          </div>
                          <h5 className="font-bold text-slate-900 text-base mt-2">{rest.name}</h5>
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{rest.highlight}</p>
                          <span className="text-[11px] text-slate-400 block mt-2">📍 {rest.address}</span>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-bold text-slate-800">
                          {rest.priceRange}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* POMERODE */}
                <div>
                  <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    Pomerode (SC) • Tradição Germânica & Parquinhos
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {restaurants.pomerode.map((rest, i) => (
                      <div key={i} className="border border-slate-200 rounded-2xl p-4.5 bg-slate-50/70 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                              {rest.category}
                            </span>
                          </div>
                          <h5 className="font-bold text-slate-900 text-base mt-2">{rest.name}</h5>
                          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{rest.highlight}</p>
                          <span className="text-[11px] text-slate-400 block mt-2">📍 {rest.address}</span>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-200 text-xs font-bold text-slate-800">
                          {rest.priceRange}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* TELA / MODAL COMPLETO AO CLICAR EM QUALQUER PACOTE DA LISTA */}
      {/* ======================================================== */}
      {selectedDealModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6">
            {/* Topo do Modal */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  <span>Ficha Completa do Pacote • {selectedDealModal.days} Dias</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                  {formatDate(selectedDealModal.departure)} até {formatDate(selectedDealModal.returnDate)}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Estratégia: <strong className="text-slate-800">{selectedDealModal.winnerName}</strong>
                </p>
              </div>

              <button
                onClick={() => setSelectedDealModal(null)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SEÇÃO 1: VOOS, HORÁRIOS & LINKS DE COMPRA */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plane className="w-4 h-4 text-sky-600" />
                1. Voos de Ida e Volta (100% Recife) & Horários
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Voo Ida */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70">
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                    <span className="font-bold text-sky-800">Voo de Ida (Recife ➔ Sul)</span>
                    <span className="font-mono text-slate-600">{selectedDealModal.options[selectedDealModal.winnerType].flightDetails.outbound.flightNumber}</span>
                  </div>
                  <div className="py-3 flex justify-between items-center">
                    <div>
                      <div className="text-xl font-extrabold text-slate-900">
                        {selectedDealModal.options[selectedDealModal.winnerType].flightDetails.outbound.departureTime}
                      </div>
                      <div className="text-[11px] text-slate-500">Recife (REC)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[11px] font-semibold text-slate-500">{selectedDealModal.options[selectedDealModal.winnerType].flightDetails.outbound.totalDuration}</div>
                      <div className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {selectedDealModal.options[selectedDealModal.winnerType].flightDetails.outbound.stopsCount} Escala
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-extrabold text-slate-900">
                        {selectedDealModal.options[selectedDealModal.winnerType].flightDetails.outbound.arrivalTime}
                      </div>
                      <div className="text-[11px] text-slate-500">Destino Sul</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                    <div>Escala: <strong>{selectedDealModal.options[selectedDealModal.winnerType].flightDetails.outbound.connectionCity}</strong></div>
                    <div>Tempo de Conexão: <span className="font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">{selectedDealModal.options[selectedDealModal.winnerType].flightDetails.outbound.layoverDuration}</span></div>
                  </div>
                  <div className="mt-3">
                    <a
                      href={selectedDealModal.options[selectedDealModal.winnerType].flightDetails.outbound.bookingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <span>Comprar Voo Ida no Site Oficial</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Voo Volta */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70">
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                    <span className="font-bold text-emerald-800">Voo de Volta (Sul ➔ Recife)</span>
                    <span className="font-mono text-slate-600">{selectedDealModal.options[selectedDealModal.winnerType].flightDetails.inbound.flightNumber}</span>
                  </div>
                  <div className="py-3 flex justify-between items-center">
                    <div>
                      <div className="text-xl font-extrabold text-slate-900">
                        {selectedDealModal.options[selectedDealModal.winnerType].flightDetails.inbound.departureTime}
                      </div>
                      <div className="text-[11px] text-slate-500">Embarque Sul</div>
                    </div>
                    <div className="text-center">
                      <div className="text-[11px] font-semibold text-slate-500">{selectedDealModal.options[selectedDealModal.winnerType].flightDetails.inbound.totalDuration}</div>
                      <div className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {selectedDealModal.options[selectedDealModal.winnerType].flightDetails.inbound.stopsCount} Escala
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-extrabold text-slate-900">
                        {selectedDealModal.options[selectedDealModal.winnerType].flightDetails.inbound.arrivalTime}
                      </div>
                      <div className="text-[11px] text-slate-500">Recife (REC)</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                    <div>Escala: <strong>{selectedDealModal.options[selectedDealModal.winnerType].flightDetails.inbound.connectionCity}</strong></div>
                    <div>Tempo de Conexão: <span className="font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">{selectedDealModal.options[selectedDealModal.winnerType].flightDetails.inbound.layoverDuration}</span></div>
                  </div>
                  <div className="mt-3">
                    <a
                      href={selectedDealModal.options[selectedDealModal.winnerType].flightDetails.inbound.bookingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <span>Comprar Voo Volta no Site Oficial</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* SEÇÃO 2: ALUGUEL DO CARRO & TAXAS */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Car className="w-4 h-4 text-indigo-600" />
                2. Carro para o Período ({selectedDealModal.days} Diárias)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-slate-200 p-4 rounded-2xl bg-slate-50/70">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Opção 1: Sedan Médio</h4>
                      <span className="text-xs text-slate-500">Virtus, Onix Plus, Cronos (480L a 520L)</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">~R$ 145/dia</span>
                  </div>
                  <div className="mt-2 text-xs text-slate-600">
                    Total {selectedDealModal.days} dias: <strong>R$ {(145 * selectedDealModal.days).toLocaleString('pt-BR')}</strong>
                    {selectedDealModal.options[selectedDealModal.winnerType].dropoff === 0 
                      ? <span className="text-emerald-700 block mt-0.5 font-bold">✓ Taxa de devolução em outra cidade: ISENTO (R$ 0)</span>
                      : <span className="text-amber-800 block mt-0.5 font-medium">+ Taxa retorno: R$ {selectedDealModal.options[selectedDealModal.winnerType].dropoff}</span>
                    }
                  </div>
                </div>

                <div className="border border-slate-200 p-4 rounded-2xl bg-slate-50/70">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Opção 2: SUV Compacto</h4>
                      <span className="text-xs text-slate-500">Tracker, T-Cross, Creta, Kicks</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">~R$ 185/dia</span>
                  </div>
                  <div className="mt-2 text-xs text-slate-600">
                    Total {selectedDealModal.days} dias: <strong>R$ {(185 * selectedDealModal.days).toLocaleString('pt-BR')}</strong>
                    <span className="text-indigo-700 block mt-0.5 font-medium">Recomendado para serras e bagagens</span>
                  </div>
                </div>
              </div>

              {/* Botões das Locadoras */}
              <div className="flex flex-wrap gap-2 pt-1 text-xs">
                <a href={officialLinks.localiza} target="_blank" rel="noreferrer" className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 flex items-center gap-1.5">
                  <span>Reservar na Localiza</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a href={officialLinks.movida} target="_blank" rel="noreferrer" className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 hover:bg-orange-50 hover:border-orange-300 flex items-center gap-1.5">
                  <span>Reservar na Movida</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a href={officialLinks.unidas} target="_blank" rel="noreferrer" className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-700 hover:bg-blue-50 hover:border-blue-300 flex items-center gap-1.5">
                  <span>Reservar na Unidas</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* SEÇÃO 3: HOTÉIS SUGERIDOS PARA ESTE PERÍODO */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                3. Sugestão de Hotéis Simples para as Paradas (Valores Reais)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-bold text-slate-900 block">Foz do Iguaçu (3 Noites)</span>
                  <span className="text-slate-600 mt-1 block">Tarobá Express Hotel</span>
                  <strong className="text-emerald-700 mt-1 block">R$ 240 / noite com café</strong>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-bold text-slate-900 block">Pomerode (2 Noites)</span>
                  <span className="text-slate-600 mt-1 block">Pousada De Maas</span>
                  <strong className="text-emerald-700 mt-1 block">R$ 260 / noite com café</strong>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-bold text-slate-900 block">Curitiba (4 Noites)</span>
                  <span className="text-slate-600 mt-1 block">Go Inn Curitiba</span>
                  <strong className="text-emerald-700 mt-1 block">R$ 230 / noite com café</strong>
                </div>
              </div>
            </div>

            {/* SEÇÃO 4: CONSOLIDAÇÃO DO CUSTO */}
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-bold text-sky-800 block">Total do Pacote Selecionado:</span>
                <div className="text-3xl font-black text-slate-900 mt-0.5">
                  R$ {getAdjustedPrice(selectedDealModal.cheapestTotal, selectedDealModal.days).toLocaleString('pt-BR')}
                </div>
                <span className="text-xs text-slate-600">Inclui voos dos 4 (Ida e Volta a Recife) + {selectedDealModal.days} diárias de carro</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedDealModal(null)}
                  className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Fechar
                </button>
                <a
                  href={selectedDealModal.options[selectedDealModal.winnerType].flightDetails.outbound.bookingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Ir para Compra Oficial</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <input
                  type="text"
                  value={ntfyTopic}
                  onChange={(e) => setNtfyTopic(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs focus:outline-none focus:border-sky-500"
                />
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
          </div>
        </div>
      )}
    </div>
  );
}
