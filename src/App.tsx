import { useState, useEffect } from 'react';
import { 
  Plane, 
  Car, 
  Calendar, 
  Users, 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  MapPin, 
  ShieldCheck, 
  DollarSign, 
  Baby, 
  ArrowRight, 
  Compass, 
  Moon, 
  RefreshCw, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  XCircle
} from 'lucide-react';

interface DealRoute {
  sense: string;
  outbound: string;
  inbound: string;
  flightPerPax: number;
  totalFlights: number;
  carModel: string;
  carDailyRate: number;
  carRentalBase: number;
  dropoffFee: number;
  totalCar: number;
  totalCost: number;
  isPromo: boolean;
  discountPercent: number;
  airline: string;
}

interface Deal {
  id: string;
  departure: string;
  returnDate: string;
  days: number;
  routeA: DealRoute;
  routeB: DealRoute;
  cheaperSense: 'A' | 'B';
  cheapestTotal: number;
  savedChildSeatCost: number;
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
    bestSense: 'A' | 'B';
    bestSenseName: string;
    cheapestTotal: number;
    flightTotal: number;
    flightPerPax: number;
    carTotal: number;
    carModel: string;
    isPromo: boolean;
    discountPercent: number;
    savedChildSeatCost: number;
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
  const [activeTab, setActiveTab] = useState<'overview' | 'comparison' | 'itinerary' | 'cars'>('overview');

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
          title: '✈️ Teste de Notificação: Férias 2027',
          message: 'Parabéns! Suas notificações push estão ativas no celular.\nVocê receberá alertas sempre que acharmos ofertas imperdíveis para Foz, Pomerode e Curitiba!',
          priority: 4,
          tags: ['tada', 'airplane', 'family'],
          markdown: true
        })
      });
      if (res.ok) {
        setNtfyStatus('✅ Notificação enviada! Verifique o app ntfy no seu celular.');
      } else {
        setNtfyStatus('❌ Erro ao enviar: ' + res.statusText);
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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <RefreshCw className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
        <h2 className="text-xl font-semibold">Carregando painel de monitoramento...</h2>
        <p className="text-slate-400 text-sm mt-1">Varrendo combinações de voos e carros para 2027</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <AlertTriangle className="w-12 h-12 text-amber-400 mb-4" />
        <h2 className="text-xl font-semibold">Nenhum dado encontrado</h2>
        <p className="text-slate-400 text-sm mt-1">Execute o script do monitor para gerar as primeiras cotações.</p>
      </div>
    );
  }

  const { summary, topDeals, itinerary } = data;
  const filteredDeals = selectedDuration === 'all' 
    ? topDeals 
    : topDeals.filter(d => d.days === selectedDuration);

  // Ajuste de SUV caso selecionado (+ R$ 40/dia)
  const suvDiffPerDay = 40;
  const getAdjustedPrice = (deal: Deal, sense: 'A' | 'B') => {
    const base = sense === 'A' ? deal.routeA.totalCost : deal.routeB.totalCost;
    return carType === 'suv' ? base + (suvDiffPerDay * deal.days) : base;
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans pb-20 selection:bg-cyan-500 selection:text-black">
      {/* Top Banner / Status do Monitor */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-900/40 px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-emerald-400">Robô Autônomo Ativo na Nuvem</span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline">Varreduras Diárias (Madrugada & Manhã)</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700/60">
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Modo Madrugada: Alarme só para Super Ofertas</span>
            </div>
            <button
              onClick={() => setShowNtfyModal(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3 py-1 rounded-full transition-all shadow-sm"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>App ntfy: {ntfyTopic}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Header Principal */}
      <header className="max-w-6xl mx-auto px-4 pt-8 pb-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Compass className="w-3.5 h-3.5" />
              Roteiro Férias 2027 • Recife ⇄ Sul do Brasil
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Foz do Iguaçu, Pomerode & Curitiba
            </h1>
            <p className="text-slate-400 text-sm md:text-base mt-1 max-w-2xl">
              Monitoramento contínuo para <strong className="text-white">4 passageiros</strong> (2 adultos + filhos de 5 e 2,5 anos) 
              com carro alugado e devolução entre cidades.
            </p>
          </div>

          {/* Badge Resumo de Passageiros */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-xs">
            <div className="p-2 bg-indigo-950/80 text-indigo-400 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-200">2 Adultos + 2 Filhos</div>
              <div className="text-slate-400">Assentos e bagagens garantidos</div>
            </div>
          </div>
        </div>

        {/* Abas de Navegação */}
        <div className="flex gap-2 border-b border-slate-800 mt-8 overflow-x-auto pb-1 text-sm font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
              activeTab === 'overview'
                ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Visão Geral & Melhor Oferta
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
              activeTab === 'comparison'
                ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Sentido A vs Sentido B
          </button>
          <button
            onClick={() => setActiveTab('cars')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
              activeTab === 'cars'
                ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Car className="w-4 h-4" />
            Aluguel do Carro (Sem Mobi/Kwid)
          </button>
          <button
            onClick={() => setActiveTab('itinerary')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
              activeTab === 'itinerary'
                ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Roteiro Dia a Dia (Kids Friendly)
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-6xl mx-auto px-4 mt-6">
        {/* ABA: VISÃO GERAL */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Card Destaque: Campeão de Preço */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border-2 border-cyan-500/40 rounded-2xl p-6 md:p-8 shadow-2xl">
              <div className="absolute top-0 right-0 bg-cyan-500 text-slate-950 text-xs font-extrabold uppercase px-4 py-1.5 rounded-bl-xl tracking-wider flex items-center gap-1.5 shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
                Melhor Combinação Encontrada
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-semibold">
                    🏆 {summary.bestSenseName}
                  </div>

                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                      {formatDate(summary.bestDeparture)} até {formatDate(summary.bestReturn)}
                    </h2>
                    <p className="text-cyan-400 font-medium text-sm mt-0.5">
                      {summary.bestDays} dias de viagem • 3 dias em Foz + 2 dias estrada cênica (Pomerode) + 4 dias em Curitiba
                    </p>
                  </div>

                  {/* Decomposição do Custo */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
                      <div className="text-slate-400 text-xs flex items-center gap-1">
                        <Plane className="w-3.5 h-3.5 text-cyan-400" />
                        Voos (4 pax)
                      </div>
                      <div className="text-lg font-bold text-white mt-1">
                        R$ {summary.flightTotal.toLocaleString('pt-BR')}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        R$ {summary.flightPerPax.toLocaleString('pt-BR')} / pessoa
                      </div>
                    </div>

                    <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
                      <div className="text-slate-400 text-xs flex items-center gap-1">
                        <Car className="w-3.5 h-3.5 text-indigo-400" />
                        Carro + Taxa Devolução
                      </div>
                      <div className="text-lg font-bold text-white mt-1">
                        R$ {summary.carTotal.toLocaleString('pt-BR')}
                      </div>
                      <div className="text-[11px] text-emerald-400">
                        {summary.carModel.split(' ')[0]} {summary.carModel.split(' ')[1]}
                      </div>
                    </div>

                    <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl col-span-2 sm:col-span-1">
                      <div className="text-slate-400 text-xs flex items-center gap-1">
                        <Baby className="w-3.5 h-3.5 text-pink-400" />
                        Economia Cadeirinhas
                      </div>
                      <div className="text-lg font-bold text-emerald-400 mt-1">
                        + R$ {summary.savedChildSeatCost.toLocaleString('pt-BR')}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Levando no voo (Grátis)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preço Total e Ação */}
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-6 flex flex-col justify-between items-center text-center">
                  <div>
                    <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">
                      Custo Logístico Total
                    </span>
                    <div className="text-4xl font-extrabold text-white mt-2">
                      R$ {summary.cheapestTotal.toLocaleString('pt-BR')}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Voos para 4 + {summary.bestDays} diárias de carro + taxa retorno
                    </div>

                    {summary.isPromo && (
                      <div className="mt-3 inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-medium">
                        🔥 Tarifa Promocional Ativa ({summary.discountPercent}% OFF)
                      </div>
                    )}
                  </div>

                  <div className="w-full mt-6 space-y-2">
                    <button
                      onClick={() => setActiveTab('itinerary')}
                      className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                    >
                      <span>Ver Roteiro Detalhado</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowNtfyModal(true)}
                      className="w-full py-2 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium rounded-xl border border-slate-800 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Bell className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Testar Alerta Push no Celular</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Dica de Ouro: Cadeirinhas e Carrinho */}
            <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-700/40 rounded-xl p-4 md:p-5 flex items-start gap-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="text-sm">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  Dica de Economia Inteligente da Família (R$ 800 a R$ 1.000 poupados!)
                </h3>
                <p className="text-slate-300 mt-1 leading-relaxed">
                  As três principais companhias aéreas brasileiras (Azul, GOL e LATAM) permitem despachar 
                  <strong className="text-emerald-400"> 1 carrinho de bebê + 1 cadeirinha/assento por criança gratuitamente</strong> sem 
                  descontar da franquia de bagagem. Como as locadoras cobram entre R$ 40 a R$ 50/dia por cada acessório, 
                  levar os próprios itens no voo garante conforto e segurança máximos para os seus filhos de 2 e 5 anos com custo zero.
                </p>
              </div>
            </div>

            {/* Filtros e Tabela de Todas as Ofertas */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                    Todas as Opções Analisadas (16/04 a 05/05/2027)
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    O robô calcula o custo total (voos + carro) para cada combinação de dias.
                  </p>
                </div>

                {/* Filtro de Duração */}
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <span className="text-slate-500 px-2 font-medium">Duração:</span>
                  <button
                    onClick={() => setSelectedDuration('all')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      selectedDuration === 'all'
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Todas
                  </button>
                  <button
                    onClick={() => setSelectedDuration(8)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      selectedDuration === 8
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    8 dias
                  </button>
                  <button
                    onClick={() => setSelectedDuration(9)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      selectedDuration === 9
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    9 dias
                  </button>
                  <button
                    onClick={() => setSelectedDuration(10)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      selectedDuration === 10
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    10 dias
                  </button>
                </div>
              </div>

              {/* Grid de Cards de Ofertas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDeals.slice(0, 8).map((deal, index) => {
                  const bestRoute = deal.cheaperSense === 'A' ? deal.routeA : deal.routeB;
                  const price = getAdjustedPrice(deal, deal.cheaperSense);

                  return (
                    <div
                      key={deal.id}
                      className={`relative bg-slate-950/80 border rounded-xl p-4 transition-all hover:border-slate-700 ${
                        index === 0
                          ? 'border-cyan-500/50 shadow-md shadow-cyan-950/20'
                          : 'border-slate-800'
                      }`}
                    >
                      {index === 0 && (
                        <span className="absolute -top-2.5 right-4 bg-cyan-500 text-slate-950 text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow">
                          Mais Barato
                        </span>
                      )}

                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-white font-bold text-base">
                            {formatDate(deal.departure)} ➔ {formatDate(deal.returnDate)}
                          </div>
                          <div className="text-slate-400 text-xs mt-0.5 flex items-center gap-1.5">
                            <span className="px-2 py-0.5 bg-slate-900 rounded text-slate-300 font-medium">
                              {deal.days} dias
                            </span>
                            <span>•</span>
                            <span className="text-cyan-400 font-medium">
                              {deal.cheaperSense === 'A' ? 'Sentido A (Começa em Foz)' : 'Sentido B (Começa em Curitiba)'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-black text-white">
                            R$ {price.toLocaleString('pt-BR')}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Pacote Total (Voos + Carro)
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-900 grid grid-cols-2 gap-2 text-xs">
                        <div className="text-slate-400">
                          <span className="text-slate-500">Cia Aérea:</span>{' '}
                          <span className="text-slate-300 font-medium">{bestRoute.airline.split(' ')[0]}</span>
                        </div>
                        <div className="text-slate-400 text-right">
                          <span className="text-slate-500">Voos 4 pax:</span>{' '}
                          <span className="text-slate-200 font-semibold">R$ {bestRoute.totalFlights.toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ABA: COMPARAÇÃO SENTIDO A vs SENTIDO B */}
        {activeTab === 'comparison' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-2">
                Comparativo Estratégico: Sentido A vs Sentido B
              </h3>
              <p className="text-slate-400 text-sm max-w-3xl leading-relaxed">
                Como você alugará o carro para fazer o trecho rodoviário passando por Pomerode, o sistema avalia simultaneamente 
                os dois sentidos e calcula o custo logístico completo (incluindo as taxas de devolução da locadora).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Sentido A */}
                <div className={`rounded-2xl p-6 border relative transition-all ${
                  topDeals[0]?.cheaperSense === 'A'
                    ? 'bg-slate-900/90 border-cyan-500/60 shadow-xl shadow-cyan-950/20'
                    : 'bg-slate-950/60 border-slate-800'
                }`}>
                  {topDeals[0]?.cheaperSense === 'A' && (
                    <div className="inline-block bg-cyan-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full uppercase mb-4">
                      ⭐ Sentido Mais Econômico
                    </div>
                  )}

                  <h4 className="text-xl font-extrabold text-white">
                    Sentido A: Começando por Foz do Iguaçu
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Recife ➔ Foz (Voo) | Foz ➔ Pomerode ➔ Curitiba (Carro) | Curitiba ➔ Recife (Voo)
                  </p>

                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between text-sm py-2 border-b border-slate-800">
                      <span className="text-slate-400">3 Dias em Foz do Iguaçu:</span>
                      <span className="text-white font-medium">Cataratas, Aves & Wonder Park</span>
                    </div>
                    <div className="flex justify-between text-sm py-2 border-b border-slate-800">
                      <span className="text-slate-400">2 Dias de Viagem Rodoviária:</span>
                      <span className="text-white font-medium">Pernoite Guarapuava + Pomerode</span>
                    </div>
                    <div className="flex justify-between text-sm py-2 border-b border-slate-800">
                      <span className="text-slate-400">4 Dias em Curitiba:</span>
                      <span className="text-white font-medium">Bosque Alemão, Parques & Gastronomia</span>
                    </div>
                    <div className="flex justify-between text-sm py-2 border-b border-slate-800">
                      <span className="text-slate-400">Média Voos (4 pax):</span>
                      <span className="text-cyan-400 font-bold">R$ {topDeals[0]?.routeA.totalFlights.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between text-sm py-2 border-b border-slate-800">
                      <span className="text-slate-400">Taxa Retorno Carro (Drop-off):</span>
                      <span className="text-slate-300 font-medium">R$ {topDeals[0]?.routeA.dropoffFee.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>

                  <div className="mt-6 bg-slate-950 p-4 rounded-xl flex items-center justify-between">
                    <span className="text-xs text-slate-400">Custo Total Pacote:</span>
                    <span className="text-2xl font-bold text-white">
                      R$ {topDeals[0]?.routeA.totalCost.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>

                {/* Sentido B */}
                <div className={`rounded-2xl p-6 border relative transition-all ${
                  topDeals[0]?.cheaperSense === 'B'
                    ? 'bg-slate-900/90 border-cyan-500/60 shadow-xl shadow-cyan-950/20'
                    : 'bg-slate-950/60 border-slate-800'
                }`}>
                  {topDeals[0]?.cheaperSense === 'B' && (
                    <div className="inline-block bg-cyan-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full uppercase mb-4">
                      ⭐ Sentido Mais Econômico
                    </div>
                  )}

                  <h4 className="text-xl font-extrabold text-white">
                    Sentido B: Começando por Curitiba
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Recife ➔ Curitiba (Voo) | Curitiba ➔ Pomerode ➔ Foz (Carro) | Foz ➔ Recife (Voo)
                  </p>

                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between text-sm py-2 border-b border-slate-800">
                      <span className="text-slate-400">4 Dias em Curitiba:</span>
                      <span className="text-white font-medium">Jardim Botânico & Bosque Alemão</span>
                    </div>
                    <div className="flex justify-between text-sm py-2 border-b border-slate-800">
                      <span className="text-slate-400">2 Dias de Viagem Rodoviária:</span>
                      <span className="text-white font-medium">Pomerode + Pernoite União da Vitória</span>
                    </div>
                    <div className="flex justify-between text-sm py-2 border-b border-slate-800">
                      <span className="text-slate-400">3 Dias em Foz do Iguaçu:</span>
                      <span className="text-white font-medium">Cataratas & Parque das Aves</span>
                    </div>
                    <div className="flex justify-between text-sm py-2 border-b border-slate-800">
                      <span className="text-slate-400">Média Voos (4 pax):</span>
                      <span className="text-indigo-400 font-bold">R$ {topDeals[0]?.routeB.totalFlights.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between text-sm py-2 border-b border-slate-800">
                      <span className="text-slate-400">Taxa Retorno Carro (Drop-off):</span>
                      <span className="text-slate-300 font-medium">R$ {topDeals[0]?.routeB.dropoffFee.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>

                  <div className="mt-6 bg-slate-950 p-4 rounded-xl flex items-center justify-between">
                    <span className="text-xs text-slate-400">Custo Total Pacote:</span>
                    <span className="text-2xl font-bold text-white">
                      R$ {topDeals[0]?.routeB.totalCost.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA: ALUGUEL DE CARRO */}
        {activeTab === 'cars' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Car className="w-5 h-5 text-indigo-400" />
                    Parâmetros e Regras do Aluguel de Carro
                  </h3>
                  <p className="text-slate-400 text-sm mt-0.5">
                    Configuração estrita para comportar 4 passageiros, 2 cadeirinhas e bagagens com total segurança.
                  </p>
                </div>

                {/* Seletor Sedan vs SUV */}
                <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setCarType('sedan')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      carType === 'sedan'
                        ? 'bg-cyan-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sedan Médio (Padrão)
                  </button>
                  <button
                    onClick={() => setCarType('suv')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      carType === 'suv'
                        ? 'bg-cyan-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    SUV Compacto (+ R$ 40/dia)
                  </button>
                </div>
              </div>

              {/* Box de Exclusão: Mobi e Kwid Banidos */}
              <div className="bg-rose-950/20 border border-rose-800/40 rounded-xl p-4 flex items-start gap-3 mb-6">
                <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg">
                  <XCircle className="w-5 h-5" />
                </div>
                <div className="text-xs md:text-sm">
                  <h4 className="font-bold text-rose-300">
                    Regra Ativa: Fiat Mobi e Renault Kwid Totalmente Excluídos
                  </h4>
                  <p className="text-slate-300 mt-0.5">
                    Esses modelos possuem porta-malas subcompacto (abaixo de 290L) e espaço traseiro insuficiente 
                    para acolher duas cadeirinhas automotivas e a bagagem de uma família de 4 pessoas por 10 dias.
                  </p>
                </div>
              </div>

              {/* Categorias Homologadas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-base">Sedan Compacto/Médio</h4>
                      <p className="text-xs text-slate-400">Exemplos: VW Virtus, Chevrolet Onix Plus, Fiat Cronos</p>
                    </div>
                    <span className="text-cyan-400 font-bold text-sm">~R$ 145 / dia</span>
                  </div>
                  <ul className="mt-4 space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Porta-malas gigante de 480 a 520 Litros (comporta 2 malas grandes + carrinho)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Espaço traseiro excelente para fixação com Isofix</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-base">SUV Compacto</h4>
                      <p className="text-xs text-slate-400">Exemplos: Chevrolet Tracker, VW T-Cross, Hyundai Creta</p>
                    </div>
                    <span className="text-indigo-400 font-bold text-sm">~R$ 185 / dia</span>
                  </div>
                  <ul className="mt-4 space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Posição de dirigir alta e ótima suspensão para as serras e estradas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Mais conforto e espaço de cabeça para as crianças no banco traseiro</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA: ROTEIRO DIA A DIA (KIDS FRIENDLY) */}
        {activeTab === 'itinerary' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-cyan-400" />
                    Roteiro Completo Dia a Dia (Adaptado para Crianças de 2 e 5 anos)
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Planejado para evitar desgaste dos pequenos, com paradas a cada 2h na estrada e atrações lúdicas.
                  </p>
                </div>
                <div className="text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400">
                  Baseado no Sentido Campeão: <strong className="text-cyan-400">{summary.bestSenseName.split(' ')[1]}</strong>
                </div>
              </div>

              {/* Lista dos Dias com Accordion */}
              <div className="space-y-3">
                {itinerary.map((item) => {
                  const isExpanded = expandedDay === item.day;

                  return (
                    <div
                      key={item.day}
                      className="border border-slate-800 bg-slate-950/70 rounded-xl overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => setExpandedDay(isExpanded ? null : item.day)}
                        className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-900/60 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 font-bold text-sm flex items-center justify-center border border-cyan-500/20">
                            D{item.day}
                          </span>
                          <div>
                            <h4 className="font-bold text-white text-sm md:text-base">
                              {item.title}
                            </h4>
                            <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <MapPin className="w-3 h-3 text-indigo-400" />
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
                        <div className="p-4 pt-1 border-t border-slate-900 bg-slate-900/20 space-y-3 text-xs md:text-sm">
                          <div>
                            <span className="font-semibold text-slate-300">Atividades Planejadas:</span>
                            <ul className="mt-1.5 space-y-1.5">
                              {item.activities.map((act, i) => (
                                <li key={i} className="flex items-start gap-2 text-slate-300">
                                  <span className="text-cyan-400 mt-1">•</span>
                                  <span>{act}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-indigo-950/30 border border-indigo-800/40 rounded-lg p-3 flex items-start gap-2.5 text-xs">
                            <Baby className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-indigo-300">Dica Especial para os Filhos (2 e 5 anos):</strong>{' '}
                              <span className="text-slate-300">{item.kidsTips}</span>
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

      {/* MODAL DE CONFIGURAÇÃO E TESTE DO NTFY */}
      {showNtfyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-indigo-400" />
                  Notificações Push no Celular (ntfy)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  100% gratuito e sem necessidade de login.
                </p>
              </div>
              <button
                onClick={() => setShowNtfyModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 font-semibold uppercase text-[10px]">Passo 1: Instale o App</span>
                <p>Baixe o aplicativo <strong>ntfy</strong> na Google Play Store ou Apple App Store.</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <span className="text-slate-500 font-semibold uppercase text-[10px]">Passo 2: Inscreva-se no seu Tópico</span>
                <p>No app do celular, clique no botão <strong>+</strong> e digite o nome do tópico:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={ntfyTopic}
                    onChange={(e) => setNtfyTopic(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-cyan-400 font-mono text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <a
                  href={`https://ntfy.sh/${ntfyTopic}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-cyan-400 hover:underline text-[11px]"
                >
                  <span>Abrir tópico no navegador</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-2">
                <button
                  onClick={sendTestNotification}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  <span>Enviar Notificação de Teste Agora</span>
                </button>
                {ntfyStatus && (
                  <p className="text-center font-medium text-[11px] text-cyan-300">
                    {ntfyStatus}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-center">
              <button
                onClick={() => setShowNtfyModal(false)}
                className="text-xs text-slate-400 hover:text-white"
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
