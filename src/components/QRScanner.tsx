import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerProps {
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

const QRScanner = ({ onClose, onScanSuccess }: QRScannerProps) => {
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasScannedRef = useRef(false);

  useEffect(() => {
    const startScanner = async () => {
      try {
        hasScannedRef.current = false;
        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 5,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            if (hasScannedRef.current) return;
            hasScannedRef.current = true;
            
            if (scannerRef.current?.isScanning) {
              scannerRef.current.stop()
                .then(() => {
                  scannerRef.current?.clear();
                  onScanSuccess(decodedText);
                })
                .catch(() => onScanSuccess(decodedText));
            } else {
              onScanSuccess(decodedText);
            }
          },
          () => {}
        );
      } catch (err) {
        setError("Não foi possível acessar a câmera. Verifique as permissões.");
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().then(() => scannerRef.current?.clear()).catch(() => {});
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full border border-white/20 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Escanear QR Code</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white text-3xl">×</button>
        </div>
        <div className="glass-effect p-6">
          {error ? (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 text-center">
              <p className="text-red-200 mb-4">{error}</p>
              <button onClick={onClose} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">Fechar</button>
            </div>
          ) : (
            <>
              <div id="qr-reader" className="w-full rounded-lg overflow-hidden mb-4"></div>
              <div className="text-center space-y-3">
                <p className="text-white/70 text-sm">Aponte a câmera para o QR Code do grupo</p>
                <button onClick={onClose} className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium border border-white/20">Cancelar</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;