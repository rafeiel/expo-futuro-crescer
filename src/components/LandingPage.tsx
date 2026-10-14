import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, Timestamp, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Turma, Aluno } from '../types';
import { TURMAS } from '../data/stations';
import CityBackground from './CityBackground';
import Footer from './Footer';
import { importarAlunos } from '../utils/importCSV';

// Expor função globalmente (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  (window as any).importarAlunos = importarAlunos;
}

const LandingPage = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'visitante' | 'responsavel' | null>(null);
  const [selectedTurma, setSelectedTurma] = useState<Turma | ''>('');
  const [searchText, setSearchText] = useState('');
  const [filteredAlunos, setFilteredAlunos] = useState<Aluno[]>([]);
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const turmas: Turma[] = TURMAS;

  // Buscar alunos quando turma é selecionada
  useEffect(() => {
    if (selectedTurma && searchText.length >= 2) {
      fetchAlunos();
    } else {
      setFilteredAlunos([]);
      setShowSuggestions(false);
    }
  }, [selectedTurma, searchText]);

  const fetchAlunos = async () => {
    if (!selectedTurma) return;
    
    try {
      const alunosRef = collection(db, 'alunos');
      const q = query(alunosRef, where('turma', '==', selectedTurma));
      const snapshot = await getDocs(q);
      
      console.log('📦 Documentos encontrados:', snapshot.size);
      
      const alunos = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data
        };
      }) as Aluno[];
      
      const filtered = alunos.filter(aluno => 
        aluno.nome.toLowerCase().includes(searchText.toLowerCase())
      );
      
      setFilteredAlunos(filtered);
    } catch (error) {
      console.error('❌ Erro ao buscar alunos:', error);
      setError('Erro ao buscar alunos. Verifique a conexão com o Firebase.');
    }
  };

  const handleAlunoSelect = (aluno: Aluno) => {
    setSelectedAluno(aluno);
    setSearchText(aluno.nome);
    setShowSuggestions(false);
    setError('');
  };

  const handleIniciarJornada = async () => {
    setIsLoading(true);
    setError('');

    try {
      if (userType === 'responsavel' && selectedAluno) {
        // Buscar dados atualizados do aluno
        const alunoRef = doc(db, 'alunos', selectedAluno.id);
        const alunoSnap = await getDoc(alunoRef);
        
        if (!alunoSnap.exists()) {
          setError('Aluno não encontrado no banco de dados.');
          setIsLoading(false);
          return;
        }

        const alunoData = alunoSnap.data() as Aluno;
        
        // Inicializar campos se não existirem
        const updates: any = {};

        if (!alunoData.activeSessions && alunoData.activeSessions !== 0) {
          updates.activeSessions = 0;
        }

        if (!alunoData.createdAt) {
          updates.createdAt = Timestamp.now();
        }

        // Verificar limite de sessões ativas
        const currentActiveSessions = alunoData.activeSessions || 0;
        if (currentActiveSessions >= 2) {
          setError(`O limite de 2 acompanhantes simultâneos para ${selectedAluno.nome} já foi atingido.`);
          setIsLoading(false);
          return;
        }

        // Incrementar contador
        updates.activeSessions = currentActiveSessions + 1;

        // Aplicar atualizações no documento do aluno
        await updateDoc(alunoRef, updates);

        // Criar sessão do responsável
        const sessionData = {
          studentId: selectedAluno.id,
          studentName: selectedAluno.nome,
          studentTurma: selectedAluno.turma,
          startTime: Timestamp.now(),
          active: true,
          stationsScanned: [],
          completedAll: false
        };

        const sessionRef = await addDoc(collection(db, 'sessions'), sessionData);
        
        console.log('✅ Sessão de responsável criada:', sessionRef.id);
        
        // Salvar no localStorage
        localStorage.setItem('currentSession', JSON.stringify({ 
          id: sessionRef.id,
          studentId: selectedAluno.id,
          studentName: selectedAluno.nome,
          studentTurma: selectedAluno.turma,
          timestamp: new Date()
        }));
        
        navigate('/jornada');
      } else {
        // Visitante
        const sessionData = {
          studentId: null,
          studentName: null,
          studentTurma: null,
          startTime: Timestamp.now(),
          active: true,
          stationsScanned: [],
          completedAll: false
        };

        const sessionRef = await addDoc(collection(db, 'sessions'), sessionData);
        
        console.log('✅ Sessão de visitante criada:', sessionRef.id);
        
        localStorage.setItem('currentSession', JSON.stringify({ 
          id: sessionRef.id,
          studentId: null,
          studentName: null,
          studentTurma: null,
          timestamp: new Date()
        }));
        
        navigate('/jornada');
      }
    } catch (err) {
      console.error('❌ Erro completo:', err);
      setError('Erro ao iniciar jornada. Verifique a configuração do Firebase no console (F12).');
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonEnabled = 
    userType === 'visitante' || 
    (userType === 'responsavel' && selectedTurma && selectedAluno);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 pb-24 relative overflow-hidden">
      <CityBackground />
      
      <div className="relative z-10 text-center space-y-8 max-w-4xl mx-auto w-full">
        <div className="flex justify-center mb-6">
          <img
            src="/logo-expo.png"
            alt="Expo Futuro"
            className="w-72 h-72 md:w-96 md:h-96 animate-float object-contain rounded-3xl"
            style={{
              filter: 'drop-shadow(0 0 24px rgba(127, 216, 242, 0.35)) drop-shadow(0 0 48px rgba(74, 222, 128, 0.25))'
            }}
          />
        </div>

        <div className="space-y-4">
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-none">
            <span className="text-white">EXPO</span>{' '}
            <span className="gradient-text">FUTURO</span>
          </h1>

          <h2 className="font-display text-xl md:text-3xl font-semibold text-white/90 leading-tight">
            Construindo a <span className="text-amber-300">Cidade do Amanhã</span>
          </h2>
        </div>

        <div className="text-center space-y-2 mx-auto max-w-lg">
          <p className="text-base md:text-lg text-white/70">
            Centro Educacional Crescer • Macaé
          </p>
          <p className="text-xl md:text-2xl text-sky-300 font-semibold mt-3">
            14 de outubro de 2026
          </p>
        </div>
        
        <div className="glass-effect px-6 py-8 mx-auto max-w-lg space-y-6">
          <div className="space-y-3">
            <p className="text-white/70 font-medium text-base mb-4">Selecione uma opção:</p>
            
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="userType"
                value="visitante"
                checked={userType === 'visitante'}
                onChange={() => {
                  setUserType('visitante');
                  setSelectedTurma('');
                  setSearchText('');
                  setSelectedAluno(null);
                  setError('');
                }}
                className="w-5 h-5 accent-emerald-500"
              />
              <span className="text-white/80 group-hover:text-white transition-colors text-lg">
                Visitante
              </span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="userType"
                value="responsavel"
                checked={userType === 'responsavel'}
                onChange={() => {
                  setUserType('responsavel');
                  setError('');
                }}
                className="w-5 h-5 accent-emerald-500"
              />
              <span className="text-white/80 group-hover:text-white transition-colors text-lg">
                Responsável
              </span>
            </label>
          </div>

          {userType === 'responsavel' && (
            <div className="space-y-4 animate-fade-in">
              <select
                id="turma-select"
                name="turma"
                value={selectedTurma}
                onChange={(e) => {
                  setSelectedTurma(e.target.value as Turma);
                  setSearchText('');
                  setSelectedAluno(null);
                }}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
              >
                <option value="" className="bg-slate-800">Selecione a turma</option>
                {turmas.map(turma => (
                  <option key={turma} value={turma} className="bg-slate-800">Turma {turma}</option>
                ))}
              </select>

              {selectedTurma && (
                <div className="relative">
                  <input
                    id="aluno-search"
                    name="aluno"
                    type="text"
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      setShowSuggestions(true);
                      setSelectedAluno(null);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Digite o nome do aluno..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                  />
                  
                  {showSuggestions && filteredAlunos.length > 0 && (
                    <div className="absolute z-20 w-full mt-2 bg-slate-800 border border-white/20 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                      {filteredAlunos.map(aluno => (
                        <button
                          key={aluno.id}
                          onClick={() => handleAlunoSelect(aluno)}
                          className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0"
                        >
                          <div className="font-medium">{aluno.nome}</div>
                          <div className="text-sm text-white/60">Turma {aluno.turma}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200 text-sm">
              {error}
            </div>
          )}

          <button 
            onClick={handleIniciarJornada}
            disabled={!isButtonEnabled || isLoading}
            className={`
              w-full py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-2xl
              ${isButtonEnabled && !isLoading
                ? 'bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white transform hover:scale-105 active:scale-95 cursor-pointer'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
              }
            `}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Iniciando...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <span>Iniciar Jornada</span>
                <svg 
                  className={`w-5 h-5 transition-transform ${isButtonEnabled ? 'group-hover:translate-x-1' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            )}
          </button>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default LandingPage;