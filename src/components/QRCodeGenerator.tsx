
import { QRCodeSVG } from 'qrcode.react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from 'react';

interface QRCodeGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

const QRCodeGenerator = ({ isOpen, onClose }: QRCodeGeneratorProps) => {
  const [isDownloaded, setIsDownloaded] = useState(false);
  
  // URL para a página de presença
  const presencePageUrl = `${window.location.origin}/attendance`;
  
  const handleDownload = () => {
    // Cria um elemento canvas para o QR Code
    const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    
    const url = canvas.toDataURL("image/png");
    const link = document.createElement('a');
    link.href = url;
    link.download = 'qrcode-presenca-jiujitsu.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setIsDownloaded(true);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code para Registro de Presença</DialogTitle>
          <DialogDescription>
            Escaneie este QR Code para registrar sua presença na aula.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center p-4">
          <div className="p-3 bg-white rounded-lg shadow-md">
            <QRCodeSVG 
              id="qr-canvas"
              value={presencePageUrl} 
              size={200} 
              level="H" 
              includeMargin={true}
              imageSettings={{
                src: "/placeholder.svg",
                excavate: true,
                height: 24,
                width: 24,
              }}
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Fechar
          </Button>
          <Button 
            type="button"
            onClick={handleDownload}
          >
            {isDownloaded ? "QR Code Baixado" : "Baixar QR Code"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeGenerator;
