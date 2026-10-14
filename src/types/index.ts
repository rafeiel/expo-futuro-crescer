export type Turma = '601' | '602' | '701' | '702' | '801' | '901' | '902' | '1001' | '2001' | '3001';

// Estrutura simplificada do aluno
export interface Aluno {
  id: string;
  nome: string;
  turma: Turma;
  activeSessions: number; // contador de sessões ativas (max 2)
  createdAt?: Date; // criado quando aluno é selecionado pela primeira vez
}

// Estrutura unificada de sessão (visitante ou responsável)
export interface Session {
  id: string;

  // Dados temporais
  startTime: Date;
  endTime?: Date;
  totalTime?: string; // formato: "5min" ou "1h 23min"

  // Progresso: turmas já escaneadas, ex.: ["601", "702"]
  stationsScanned: string[];
  completedAll: boolean;

  // Dados do aluno (null = visitante)
  studentId?: string | null;
  studentName?: string | null;
  studentTurma?: Turma | null;

  // Status
  active: boolean;
}

// Sessão salva no localStorage
export interface UserSession {
  id: string;
  studentId?: string | null;
  studentName?: string | null;
  studentTurma?: Turma | null;
  timestamp: Date;
}
