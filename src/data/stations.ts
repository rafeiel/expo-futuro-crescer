import { Turma } from '../types';

export interface Station {
  turma: Turma;
  qr: string;        // conteúdo do QR Code impresso na sala
  tema: string;
  grupos: string[];  // subtemas (informativo — não gera leituras extras)
  imagem: string;    // troque o arquivo em /public/stations/<turma>.png
}

// Ordem apenas sugerida (601 → 3001). O visitante pode ler em qualquer ordem.
export const STATIONS: Station[] = [
  {
    turma: '601',
    qr: 'EXPO-601',
    tema: 'Água e Consumo Consciente',
    grupos: ['Consumo de água', 'Presença da água', 'Tratamento da água', 'Desperdício de água'],
    imagem: '/stations/601.png',
  },
  {
    turma: '602',
    qr: 'EXPO-602',
    tema: 'Clima e Meio Ambiente',
    grupos: ['Previsão do tempo', 'Áreas verdes', 'Reciclagem'],
    imagem: '/stations/602.png',
  },
  {
    turma: '701',
    qr: 'EXPO-701',
    tema: 'Energia e Sustentabilidade',
    grupos: ['Energia solar e energia eólica', 'Consumo e conta de luz', 'Conscientização'],
    imagem: '/stations/701.png',
  },
  {
    turma: '702',
    qr: 'EXPO-702',
    tema: 'Cidade Inteligente',
    grupos: ['Transporte público', 'Poluição urbana', 'Bairro planejado'],
    imagem: '/stations/702.png',
  },
  {
    turma: '801',
    qr: 'EXPO-801',
    tema: 'Cidade do Futuro – Experiência Imersiva',
    grupos: ['Proposta integradora: tecnologia, sustentabilidade, mobilidade, energia, água, meio ambiente e qualidade de vida'],
    imagem: '/stations/801.png',
  },
  {
    turma: '901',
    qr: 'EXPO-901',
    tema: 'Inteligência Artificial e a Cidade do Futuro',
    grupos: ['IA na educação', 'IA na saúde', 'IA no trânsito', 'IA e ética'],
    imagem: '/stations/901.png',
  },
  {
    turma: '902',
    qr: 'EXPO-902',
    tema: 'Robótica e Automação da Cidade do Futuro',
    grupos: ['Robôs no cotidiano', 'Algoritmos e programação', 'Sensores inteligentes', 'Cidade automatizada'],
    imagem: '/stations/902.png',
  },
  {
    turma: '1001',
    qr: 'EXPO-1001',
    tema: 'Energias Renováveis para a Cidade do Futuro',
    grupos: ['Biocombustíveis', 'Hidrogênio verde'],
    imagem: '/stations/1001.png',
  },
  {
    turma: '2001',
    qr: 'EXPO-2001',
    tema: 'Sustentabilidade e Economia Circular',
    grupos: ['Reciclagem', 'Compostagem', 'Bioplásticos', 'Economia circular'],
    imagem: '/stations/2001.png',
  },
  {
    turma: '3001',
    qr: 'EXPO-3001',
    tema: 'Saúde, Biotecnologia e Qualidade de Vida no Futuro',
    grupos: ['Alimentação e nutrição', 'Atividade física e saúde', 'Biotecnologia e medicina', 'Tecnologia e qualidade de vida'],
    imagem: '/stations/3001.png',
  },
];

export const TOTAL_STATIONS = STATIONS.length;

export const TURMAS: Turma[] = STATIONS.map(s => s.turma);
