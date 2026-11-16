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
  Repeat
} from 'lucide-react';

interface StrategyOption {
  type: 'A' | 'B' | 'C' | 'D';
  name: string;
  cost: number;
  flights: number;
  car: number;
  dropoff: number;
  promo: boolean;
  flightPerPax: number;
  airline: string;
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
          title: '✈️ Teste: Férias 2027 (Volta para Recife Inclusa)',
          message: 'Parabéns! Notificações ativas no celular.\nTodas as 4 rotas estão sendo comparadas: Ida e volta na mesma cidade vs Cidades diferentes!',
          priority: 4,
          tags: ['tada', 'airplane', 'family'],
          markdown: true
        })
      });
      if (res.ok) {
        setNtfyStatus('✅ Notificação enviada! Verifique o app ntfy no celular.');
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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <RefreshCw className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
        <h2 className="text-xl font-semibold">Carregando painel com todas as opções de rota...</h2>
        <p className="text-slate-400 text-sm mt-1">Comparando voos ida/volta e circuitos rodoviários</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <AlertTriangle className="w-12 h-12 text-amber-400 mb-4" />
        <h2 className="text-xl font-semibold">Nenhum dado encontrado</h2>
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

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans pb-20 selection:bg-cyan-500 selection:text-black">
      {/* Top Banner / Status */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-900/40 px-4 py-2.5">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-emerald-400">Robô Ativo (4 Horários Diários)</span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-300 hidden sm:inline">Origem e Retorno Garantidos para Recife (REC)</span>
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
              Férias 2027 • Análise Completa de Todas as Estratégias
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Recife ⇄ Foz do Iguaçu, Pomerode & Curitiba
            </h1>
            <p className="text-slate-400 text-sm md:text-base mt-1 max-w-2xl">
              Comparando <strong className="text-white">4 rotas completas (todas com volta para Recife)</strong>: voos ida e volta na mesma cidade (taxa de retorno R$ 0) vs voos múltiplos destinos com carro.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-xs">
            <div className="p-2 bg-indigo-950/80 text-indigo-400 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-slate-200">2 Adultos + 2 Crianças (5 e 2,5 anos)</div>
              <div className="text-slate-400">4 assentos nos voos e porta-malas espaçoso</div>
            </div>
          </div>
        </div>

        {/* Abas */}
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
            Melhor Opção Global
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
              activeTab === 'comparison'
                ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Repeat className="w-4 h-4" />
            Comparativo das 4 Estratégias
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

      {/* Conteúdo */}
      <main className="max-w-6xl mx-auto px-4 mt-6">
        {/* ABA: VISÃO GERAL */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Card Destaque */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border-2 border-cyan-500/40 rounded-2xl p-6 md:p-8 shadow-2xl">
              <div className="absolute top-0 right-0 bg-cyan-500 text-slate-950 text-xs font-extrabold uppercase px-4 py-1.5 rounded-bl-xl tracking-wider flex items-center gap-1.5 shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
                Estratégia Mais Barata Encontrada
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-semibold">
                    🏆 {summary.bestStrategyName}
                  </div>

                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                      {formatDate(summary.bestDeparture)} até {formatDate(summary.bestReturn)} ({summary.bestDays} dias)
                    </h2>
                    <p className="text-cyan-400 font-medium text-sm mt-0.5">
                      Saída de Recife e Retorno Garantido para Recife
                    </p>
                  </div>

                  {/* Decomposição */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
                      <div className="text-slate-400 text-xs flex items-center gap-1">
                        <Plane className="w-3.5 h-3.5 text-cyan-400" />
                        Voos Ida & Volta (4 pax)
                      </div>
                      <div className="text-lg font-bold text-white mt-1">
                        R$ {summary.flightTotal.toLocaleString('pt-BR')}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        R$ {summary.flightPerPax.toLocaleString('pt-BR')} / pessoa ida e volta
                      </div>
                    </div>

                    <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
                      <div className="text-slate-400 text-xs flex items-center gap-1">
                        <Car className="w-3.5 h-3.5 text-indigo-400" />
                        Carro ({summary.bestDays} diárias)
                      </div>
                      <div className="text-lg font-bold text-white mt-1">
                        R$ {summary.carTotal.toLocaleString('pt-BR')}
                      </div>
                      <div className="text-[11px] text-emerald-400">
                        {summary.dropoffFee === 0 ? 'Taxa retorno: R$ 0 (Mesma cidade)' : `Taxa retorno: R$ ${summary.dropoffFee}`}
                      </div>
                    </div>

                    <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl col-span-2 sm:col-span-1">
                      <div className="text-slate-400 text-xs flex items-center gap-1">
                        <Baby className="w-3.5 h-3.5 text-pink-400" />
                        Cadeirinhas no Voo
                      </div>
                      <div className="text-lg font-bold text-emerald-400 mt-1">
                        + R$ {summary.savedChildSeatCost.toLocaleString('pt-BR')}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Economia comprovada
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preço Total */}
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-6 flex flex-col justify-between items-center text-center">
                  <div>
                    <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">
                      Custo Total Pacote Família
                    </span>
                    <div className="text-4xl font-extrabold text-white mt-2">
                      R$ {getAdjustedPrice(summary.cheapestTotal, summary.bestDays).toLocaleString('pt-BR')}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Voos para 4 (Ida e Volta a Recife) + {summary.bestDays} diárias carro
                    </div>

                    {summary.savedDropoffFee > 0 && (
                      <div className="mt-3 inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-medium">
                        🎉 Devolver na mesma cidade economizou R$ {summary.savedDropoffFee}!
                      </div>
                    )}
                  </div>

                  <div className="w-full mt-6 space-y-2">
                    <button
                      onClick={() => setActiveTab('comparison')}
                      className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
                    >
                      <span>Comparar as 4 Opções</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Aviso Volta Garantida para Recife */}
            <div className="bg-indigo-950/30 border border-indigo-700/40 rounded-xl p-4 flex items-start gap-3">
              <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                <Repeat className="w-5 h-5" />
              </div>
              <div className="text-xs md:text-sm text-slate-300">
                <strong className="text-white">Origem e Destino Final 100% em Recife (REC):</strong> Todas as pesquisas e simulações obrigatoriamente incluem a ida saindo do Recife e a volta desembarcando no Recife. Você pode escolher se quer pousar e decolar da mesma cidade do Sul (economizando na taxa do carro) ou fazer cidades diferentes.
              </div>
            </div>

            {/* Lista dos Melhores Pacotes */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                    Melhores Datas e Pacotes Encontrados
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Classificados do menor custo logístico para o maior.
                  </p>
                </div>

                {/* Filtro Duração */}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDeals.slice(0, 8).map((deal, index) => {
                  const winner = deal.options[deal.winnerType];
                  const price = getAdjustedPrice(deal.cheapestTotal, deal.days);

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
                          Mais Barato Geral
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
                              {winner.name.split('(')[0]}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-black text-white">
                            R$ {price.toLocaleString('pt-BR')}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Total Família
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-900 grid grid-cols-2 gap-2 text-xs">
                        <div className="text-slate-400">
                          <span className="text-slate-500">Cia Aérea:</span>{' '}
                          <span className="text-slate-300 font-medium">{winner.airline.split(' ')[0]}</span>
                        </div>
                        <div className="text-slate-400 text-right">
                          <span className="text-slate-500">Voos (4 pax):</span>{' '}
                          <span className="text-slate-200 font-semibold">R$ {winner.flights.toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ABA: COMPARATIVO DAS 4 ESTRATÉGIAS */}
        {activeTab === 'comparison' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-2">
                Comparativo Detalhado das 4 Estratégias Possíveis
              </h3>
              <p className="text-slate-400 text-sm max-w-3xl leading-relaxed">
                Todas as 4 rotas partem de Recife e retornam para Recife, permitindo visitar Foz do Iguaçu, Curitiba e Pomerode com carro.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Opção 1: Hub Curitiba */}
                <div className={`rounded-2xl p-6 border relative ${
                  topDeals[0]?.winnerType === 'C'
                    ? 'bg-slate-900/90 border-cyan-500/60 shadow-xl'
                    : 'bg-slate-950/60 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                      ⭐ Taxa Retorno Carro R$ 0
                    </span>
                    <span className="text-xl font-bold text-white">
                      R$ {topDeals[0]?.options.C.cost.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-white">1. Hub Curitiba (REC ⇄ Curitiba Voo)</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Voo ida e volta por Curitiba. Carro retirado e devolvido no mesmo aeroporto (CWB).
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-3">
                    <li>• Voo REC ➔ CWB e CWB ➔ REC (4 pessoas): <strong>R$ {topDeals[0]?.options.C.flights.toLocaleString('pt-BR')}</strong></li>
                    <li>• Carro ({topDeals[0]?.days} diárias): <strong>R$ {topDeals[0]?.options.C.car.toLocaleString('pt-BR')}</strong></li>
                    <li>• Taxa de devolução em outra cidade: <strong className="text-emerald-400">R$ 0,00 (Isento!)</strong></li>
                    <li>• Rota de carro: Curitiba ➔ Pomerode ➔ Foz do Iguaçu ➔ Curitiba</li>
                  </ul>
                </div>

                {/* Opção 2: Hub Foz */}
                <div className={`rounded-2xl p-6 border relative ${
                  topDeals[0]?.winnerType === 'D'
                    ? 'bg-slate-900/90 border-cyan-500/60 shadow-xl'
                    : 'bg-slate-950/60 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                      Taxa Retorno Carro R$ 0
                    </span>
                    <span className="text-xl font-bold text-white">
                      R$ {topDeals[0]?.options.D.cost.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-white">2. Hub Foz (REC ⇄ Foz Voo)</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Voo ida e volta por Foz. Carro retirado e devolvido no aeroporto de Foz (IGU).
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-3">
                    <li>• Voo REC ➔ IGU e IGU ➔ REC (4 pessoas): <strong>R$ {topDeals[0]?.options.D.flights.toLocaleString('pt-BR')}</strong></li>
                    <li>• Carro ({topDeals[0]?.days} diárias): <strong>R$ {topDeals[0]?.options.D.car.toLocaleString('pt-BR')}</strong></li>
                    <li>• Taxa de devolução em outra cidade: <strong className="text-emerald-400">R$ 0,00 (Isento!)</strong></li>
                    <li>• Rota de carro: Foz ➔ Pomerode ➔ Curitiba ➔ Foz</li>
                  </ul>
                </div>

                {/* Opção 3: Open-Jaw A */}
                <div className={`rounded-2xl p-6 border relative ${
                  topDeals[0]?.winnerType === 'A'
                    ? 'bg-slate-900/90 border-cyan-500/60 shadow-xl'
                    : 'bg-slate-950/60 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                      Múltiplos Destinos
                    </span>
                    <span className="text-xl font-bold text-white">
                      R$ {topDeals[0]?.options.A.cost.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-white">3. Open-Jaw A (Entra Foz / Sai Curitiba)</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Voo REC ➔ IGU | Carro de Foz até Curitiba (via Pomerode) | Voo CWB ➔ REC.
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-3">
                    <li>• Voos REC ➔ IGU + CWB ➔ REC (4 pessoas): <strong>R$ {topDeals[0]?.options.A.flights.toLocaleString('pt-BR')}</strong></li>
                    <li>• Carro com Taxa de Retorno (Drop-off): <strong>R$ {topDeals[0]?.options.A.car.toLocaleString('pt-BR')}</strong></li>
                    <li>• Menos km rodados no carro (apenas 1 sentido de estrada).</li>
                  </ul>
                </div>

                {/* Opção 4: Open-Jaw B */}
                <div className={`rounded-2xl p-6 border relative ${
                  topDeals[0]?.winnerType === 'B'
                    ? 'bg-slate-900/90 border-cyan-500/60 shadow-xl'
                    : 'bg-slate-950/60 border-slate-800'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                      Múltiplos Destinos
                    </span>
                    <span className="text-xl font-bold text-white">
                      R$ {topDeals[0]?.options.B.cost.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-white">4. Open-Jaw B (Entra Curitiba / Sai Foz)</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Voo REC ➔ CWB | Carro de Curitiba até Foz (via Pomerode) | Voo IGU ➔ REC.
                  </p>
                  <ul className="mt-4 space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-3">
                    <li>• Voos REC ➔ CWB + IGU ➔ REC (4 pessoas): <strong>R$ {topDeals[0]?.options.B.flights.toLocaleString('pt-BR')}</strong></li>
                    <li>• Carro com Taxa de Retorno (Drop-off): <strong>R$ {topDeals[0]?.options.B.car.toLocaleString('pt-BR')}</strong></li>
                    <li>• Menos km rodados no carro (apenas 1 sentido de estrada).</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA: CARROS */}
        {activeTab === 'cars' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Car className="w-5 h-5 text-indigo-400" />
                    Parâmetros do Carro para a Família
                  </h3>
                  <p className="text-slate-400 text-sm mt-0.5">
                    Configuração restrita: 4 pessoas, 2 cadeirinhas e bagagens.
                  </p>
                </div>

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

              <div className="bg-rose-950/20 border border-rose-800/40 rounded-xl p-4 flex items-start gap-3 mb-6">
                <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg">
                  <XCircle className="w-5 h-5" />
                </div>
                <div className="text-xs md:text-sm">
                  <h4 className="font-bold text-rose-300">
                    Mobi e Kwid Estão Fora de Cogitação
                  </h4>
                  <p className="text-slate-300 mt-0.5">
                    Espaço traseiro não acomoda com conforto e segurança as duas cadeirinhas de 2 e 5 anos junto com as malas da família.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
                  <h4 className="font-bold text-white text-base">Sedan Médio/Compacto</h4>
                  <p className="text-xs text-slate-400">Exemplos: Onix Plus, Cronos, Virtus</p>
                  <p className="text-xs text-slate-300 mt-3">Porta-malas de 480L a 520L: ideal para acomodar 2 malas grandes, malas de bordo e o carrinho de bebê.</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl">
                  <h4 className="font-bold text-white text-base">SUV Compacto</h4>
                  <p className="text-xs text-slate-400">Exemplos: Tracker, T-Cross, Creta, Kicks</p>
                  <p className="text-xs text-slate-300 mt-3">Excelente vão livre do solo e conforto elevado para os trechos de serra e rodovia.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA: ROTEIRO DIA A DIA */}
        {activeTab === 'itinerary' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Compass className="w-5 h-5 text-cyan-400" />
                    Roteiro Completo Dia a Dia (Kids Friendly)
                  </h3>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Com paradas a cada 2h na estrada e atrações adaptadas para 2 e 5 anos.
                  </p>
                </div>
              </div>

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
                            <span className="font-semibold text-slate-300">Atividades:</span>
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
                              <strong className="text-indigo-300">Dica para os Filhos (2 e 5 anos):</strong>{' '}
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

      {/* MODAL NTFY */}
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
                <p>Baixe o app <strong>ntfy</strong> na Google Play Store ou Apple App Store.</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <span className="text-slate-500 font-semibold uppercase text-[10px]">Passo 2: Inscreva-se no seu Tópico</span>
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
