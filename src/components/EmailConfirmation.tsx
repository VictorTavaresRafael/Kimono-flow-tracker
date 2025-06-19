import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mail, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface EmailConfirmationProps {
  email: string;
}

const EmailConfirmation: React.FC<EmailConfirmationProps> = ({ email }) => {
  const [isResending, setIsResending] = useState(false);
  const { resendConfirmation } = useAuth();

  const handleResend = async () => {
    setIsResending(true);
    try {
      await resendConfirmation(email);
    } catch (error) {
      // Erro já tratado no contexto
    }
    setIsResending(false);
  };

  return (
    <Card className="w-full max-w-md p-8 shadow-xl border-t-4 border-t-orange-500">
      <div className="text-center">
        <div className="w-20 h-20 bg-orange-100 rounded-full mx-auto mb-4 flex items-center justify-center">
          <Mail className="h-10 w-10 text-orange-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Confirme seu Email
        </h2>
          <p className="text-gray-600 mb-6">
          Enviamos um link de confirmação para seu email:
        </p>
        
        <p className="font-semibold text-blue-600 mb-6 break-all">
          {email}
        </p>
        
        <p className="text-sm text-gray-500 mb-6">
          Clique no link no email para ativar sua conta. 
          Verifique também sua pasta de spam ou lixo eletrônico.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-700">
            <strong>Não recebeu o email?</strong><br />
            • Aguarde alguns minutos<br />
            • Verifique a pasta de spam<br />
            • Clique em "Reenviar Email" abaixo
          </p>
        </div>
        
        <Button 
          onClick={handleResend}
          disabled={isResending}
          variant="outline"
          className="w-full"
        >
          {isResending ? (
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Reenviando...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>Reenviar Email</span>
            </div>
          )}
        </Button>
        
        <p className="text-xs text-gray-400 mt-6">
          Após confirmar, volte para fazer login
        </p>
      </div>
    </Card>
  );
};

export default EmailConfirmation;
