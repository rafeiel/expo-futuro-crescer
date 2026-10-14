import { STATIONS, Station, TOTAL_STATIONS } from '../data/stations';

export interface ValidationResult {
  isValid: boolean;
  isBrinde?: boolean;
  error?: string;
  station?: Station;
}

const normalize = (text: string) => text.trim().toUpperCase();

/**
 * Valida o texto lido do QR Code.
 * - "BRINDE": só vale com as 10 turmas escaneadas
 * - "EXPO-<turma>": vale em qualquer ordem, uma vez cada
 */
export const validateQRCode = (decodedText: string, scanned: string[]): ValidationResult => {
  const code = normalize(decodedText);

  if (code === 'BRINDE') {
    if (scanned.length >= TOTAL_STATIONS) {
      return { isValid: true, isBrinde: true };
    }
    const faltam = TOTAL_STATIONS - scanned.length;
    return {
      isValid: false,
      error: `Você ainda não visitou todas as turmas!\n\nFalta${faltam > 1 ? 'm' : ''} ${faltam} turma${faltam > 1 ? 's' : ''} para liberar o brinde.`,
    };
  }

  const station = STATIONS.find(s => s.qr === code);
  if (!station) {
    return {
      isValid: false,
      error: 'QR Code inválido! Escaneie apenas os códigos das turmas da Expo Futuro.',
    };
  }

  if (scanned.includes(station.turma)) {
    return {
      isValid: false,
      error: `Você já escaneou a turma ${station.turma}!\n\nSiga para outra turma.`,
    };
  }

  return { isValid: true, station };
};
