import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserSession } from '../types';
import QRScanner from './QRScanner';
import CityBackground from './CityBackground';
import Footer from './Footer';
import { validateQRCode } from '../utils/qrValidator';
import { STATIONS, TOTAL_STATIONS } from '../data/stations';

const PROGRESS_KEY = 'stationsProgress';

const formatDuration = (ms: number) => {
  const totalMin = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
};

const IndexPage = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<UserSession | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [scanned, setScanned] = useState<string[]>([]);
  const [justRevealed, setJustRevealed] = useState<string | null>(null);

  useEffect(() => {
    const sessionData = localStorage.getItem('currentSession');
    if (sessionData) {
      setSession(JSON.parse(sessionData));
    } else {
      navigate('/');
      return;
    }

    try {
      const saved = localStorage.getItem(PROGRESS_KEY);
      if (saved) setScanned(JSON.parse(saved));
    } catch {
      setScanned([]);
    }
  }, []);

  const showModal = (html: string, buttonId: string) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4';
    modal.innerHTML = html;
    document.body.appendChild(modal);
    const close = () => {
      if (modal.parentNode) document.body.removeChild(modal);
    };
    document.getElementById(buttonId)?.addEventListener('click', close);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });
    return { modal, close };
  };

  const handleChangeStudent = () => {
    const { close } = showModal(
      `
      <div class="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-white/20 shadow-2xl">
        <h3 class="text-xl font-bold text-white mb-4">Atenção!</h3>
        <p class="text-white/80 mb-6">
          Ao escolher outro aluno, todo o progresso das turmas visitadas será perdido. Deseja continuar?
        </p>
        <div class="flex gap-3">
          <button id="cancelBtn" class="flex-1 py-2 px-4 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors">
            Cancelar
          </button>
          <button id="confirmBtn" class="flex-1 py-2 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg text-white font-medium transition-all">
            Confirmar
          </button>
        </div>
      </div>
    `,
      'cancelBtn'
    );

    document.getElementById('confirmBtn')?.addEventListener('click', async () => {
      if (session?.studentId) {
        try {
          const alunoRef = doc(db, 'alunos', session.studentId);
          const alunoSnap = await getDoc(alunoRef);
          if (alunoSnap.exists()) {
            const currentSessions = alunoSnap.data().activeSessions || 0;
            await updateDoc(alunoRef, { activeSessions: Math.max(0, currentSessions - 1) });
          }
        } catch (err) {
          console.error('Erro ao decrementar activeSessions:', err);
        }
      }
      if (session?.id) {
        try {
          await updateDoc(doc(db, 'sessions', session.id), { active: false });
        } catch (err) {
          console.error('Erro ao encerrar sessão:', err);
        }
      }
      close();
      localStorage.removeItem('currentSession');
      localStorage.removeItem(PROGRESS_KEY);
      navigate('/');
    });
  };

  const showErrorModal = (message: string) => {
    showModal(
      `
      <div class="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-white/20 shadow-2xl">
        <h3 class="text-xl font-bold text-white mb-4">Atenção!</h3>
        <p class="text-white/80 mb-6 whitespace-pre-line">${message}</p>
        <button id="okBtn" class="w-full py-3 bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 rounded-lg text-white font-medium transition-all">
          Entendi
        </button>
      </div>
    `,
      'okBtn'
    );
  };

  const showCompletedModal = () => {
    showModal(
      `
      <div class="bg-slate-800 rounded-2xl p-6 max-w-md w-full border border-white/20 shadow-2xl">
        <h3 class="text-2xl font-bold text-white mb-4 text-center">🎊 Parabéns! 🎊</h3>
        <p class="text-white/80 mb-6 text-center">
          Você visitou as ${TOTAL_STATIONS} turmas da Expo Futuro!<br/><br/>
          Agora escaneie o QR Code <b>BRINDE</b> para liberar seu brinde.
        </p>
        <button id="congratsBtn" class="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 rounded-lg text-white font-semibold transition-all">
          Entendi
        </button>
      </div>
    `,
      'congratsBtn'
    );
  };

  const showBrindeModal = () => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-slate-950/95 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="text-center space-y-8 max-w-2xl">
        <img
          src="/logo-expo.png"
          alt="Expo Futuro"
          class="w-56 h-56 mx-auto object-contain rounded-3xl animate-pulse"
          style="filter: drop-shadow(0 0 40px rgba(127, 216, 242, 0.7)) drop-shadow(0 0 80px rgba(74, 222, 128, 0.5))"
        />
        <div class="space-y-4">
          <h2 class="text-5xl font-bold text-white">Parabéns!</h2>
          <p class="text-2xl text-white/90">Obrigado por participar da</p>
          <h1 class="font-display text-6xl font-extrabold"><span class="text-white">EXPO</span> <span class="gradient-text">FUTURO</span></h1>
          <p class="text-xl text-amber-300">Construindo a Cidade do Amanhã</p>
          <div class="pt-8">
            <div class="inline-block px-8 py-4 bg-green-500/20 border-2 border-green-400 rounded-full">
              <p class="text-3xl font-bold text-green-300">✓ BRINDE LIBERADO</p>
            </div>
          </div>
        </div>
        <button id="closeBrindeBtn" class="mt-8 px-8 py-4 bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 rounded-full text-white text-xl font-semibold transition-all transform hover:scale-105">
          Fechar
        </button>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('closeBrindeBtn')?.addEventListener('click', () => {
      if (modal.parentNode) document.body.removeChild(modal);
    });
  };

  const handleScanSuccess = async (decodedText: string) => {
    setShowScanner(false);

    const validation = validateQRCode(decodedText, scanned);
    if (!validation.isValid) {
      showErrorModal(validation.error!);
      return;
    }

    if (validation.isBrinde) {
      if (session?.id) {
        try {
          await updateDoc(doc(db, 'sessions', session.id), { brindeAt: Timestamp.now() });
        } catch (err) {
          console.error('Erro ao registrar brinde:', err);
        }
      }
      showBrindeModal();
      return;
    }

    const station = validation.station!;
    const updated = [...scanned, station.turma];
    setScanned(updated);
    setJustRevealed(station.turma);
    setTimeout(() => setJustRevealed(null), 1600);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));

    const completed = updated.length === TOTAL_STATIONS;

    if (session?.id) {
      try {
        const sessionRef = doc(db, 'sessions', session.id);
        const data: Record<string, unknown> = {
          stationsScanned: updated,
          completedAll: completed,
        };
        if (completed) {
          const snap = await getDoc(sessionRef);
          const start = snap.exists() ? snap.data().startTime?.toDate?.() : null;
          const end = new Date();
          data.endTime = Timestamp.fromDate(end);
          if (start) data.totalTime = formatDuration(end.getTime() - start.getTime());
        }
        await updateDoc(sessionRef, data);
      } catch (error) {
        console.error('Erro ao salvar progresso no Firebase:', error);
      }
    }

    if (completed) showCompletedModal();
  };

  const nextStation = STATIONS.find(s => !scanned.includes(s.turma));

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-8 pb-24 relative overflow-hidden">
      <CityBackground />

      {showScanner && (
        <QRScanner onClose={() => setShowScanner(false)} onScanSuccess={handleScanSuccess} />
      )}

      <div className="max-w-3xl mx-auto relative z-10">
        <div className="flex justify-center mb-4">
          <img src="/logo-expo.png" alt="Expo Futuro" className="w-32 h-32 object-contain rounded-2xl" />
        </div>

        <div className="text-center mb-8">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-1 leading-none">
            <span className="text-white">EXPO</span> <span className="gradient-text">FUTURO</span>
          </h1>
          <h2 className="font-display text-lg md:text-xl text-white/90">
            Construindo a <span className="text-amber-300">Cidade do Amanhã</span>
          </h2>
        </div>

        <div className="text-center mb-6 space-y-2">
          <p className="text-lg text-white/70">Centro Educacional Crescer • 2026</p>

          {session.studentId ? (
            <div>
              <div className="inline-block px-4 py-1 bg-sky-500/20 border border-sky-400/50 rounded-full mb-2">
                <span className="text-sky-200 font-medium text-sm">Responsável</span>
              </div>
              <h2 className="text-2xl font-bold text-white">{session.studentName}</h2>
              <p className="text-lg text-emerald-300">Turma {session.studentTurma}</p>
            </div>
          ) : (
            <div className="inline-block px-4 py-1 bg-emerald-500/20 border border-emerald-400/50 rounded-full">
              <span className="text-emerald-200 font-medium text-sm">Visitante</span>
            </div>
          )}
        </div>

        {/* Turmas: imagens escurecidas que ficam visíveis ao escanear */}
        <div className="glass-effect p-4 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {STATIONS.map(station => {
              const done = scanned.includes(station.turma);
              const pulse = justRevealed === station.turma;
              return (
                <div
                  key={station.turma}
                  className={`relative aspect-[4/3] rounded-lg overflow-hidden border transition-all duration-500 ${
                    done ? 'border-emerald-400/70' : 'border-white/15'
                  } ${pulse ? 'scale-105 ring-4 ring-emerald-400/60' : ''}`}
                  title={`Turma ${station.turma} – ${station.tema}`}
                >
                  <img
                    src={station.imagem}
                    alt={`Turma ${station.turma}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div
                    className={`absolute inset-0 transition-all duration-700 ${
                      done ? 'bg-transparent' : 'bg-black/95 backdrop-blur-sm'
                    }`}
                  />
                  <span
                    className={`absolute bottom-1 left-1 px-2 py-0.5 rounded text-xs font-bold ${
                      done ? 'bg-emerald-500/90 text-white' : 'bg-white/10 text-white/70'
                    }`}
                  >
                    {done ? '✓ ' : ''}
                    {station.turma}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-2xl font-bold text-white">
            <span className="text-emerald-300">{scanned.length}</span>
            <span className="text-white/50">/{TOTAL_STATIONS}</span>
          </p>
          <p className="text-white/70 text-sm">turmas visitadas</p>
        </div>

        <div className="glass-effect p-4 mb-6">
          <h3 className="text-sm font-semibold text-white/70 mb-2">Próxima etapa</h3>
          {nextStation ? (
            <div>
              <p className="text-white font-semibold text-lg">
                Turma {nextStation.turma} — {nextStation.tema}
              </p>
              <ul className="mt-2 space-y-1 text-sm text-white/70">
                {nextStation.grupos.map(g => (
                  <li key={g} className="flex gap-2">
                    <span className="text-emerald-300">•</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-white/50">
                Sugestão de percurso. Você pode visitar as turmas em qualquer ordem.
              </p>
            </div>
          ) : (
            <p className="text-white font-medium">
              Você visitou todas as turmas! Escaneie o QR Code <b>BRINDE</b> para retirar seu brinde.
            </p>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setShowScanner(true)}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 rounded-lg text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
          >
            Escanear QR Code
          </button>

          <button
            onClick={() => setShowMapModal(true)}
            className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/30 rounded-lg text-emerald-200 font-medium transition-colors"
          >
            Ver mapa do colégio
          </button>

          <button
            onClick={handleChangeStudent}
            className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white/80 font-medium transition-colors border border-white/10"
          >
            Escolher outro aluno
          </button>
        </div>
      </div>

      {showMapModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowMapModal(false)}
        >
          <div className="bg-slate-800 rounded-2xl p-4 max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Mapa do colégio</h3>
              <button onClick={() => setShowMapModal(false)} className="text-white/70 hover:text-white text-2xl">
                ×
              </button>
            </div>
            <img src="/mapa-escola.png" alt="Mapa do Colégio" className="w-full h-auto rounded" />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default IndexPage;
