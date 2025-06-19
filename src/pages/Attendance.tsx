import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Check, QrCode, UserCheck, LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";
import { recordAttendance, getStudentByRA } from "@/utils/helpers";
import { toast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

const Attendance = () => {
  const [ra, setRa] = useState("");
  const [success, setSuccess] = useState(false);  const [studentName, setStudentName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { currentUser, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };
  
  // Focar no input quando a página carrega
  useEffect(() => {
    const inputElement = document.getElementById("ra");
    if (inputElement) {
      inputElement.focus();
    }
  }, [success]);
    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ra.trim()) {
      toast({
        title: "Erro",
        description: "Digite o RA do aluno para registrar presença",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Verificar se o aluno existe e registrar presença
      const student = await getStudentByRA(ra.trim());
      
      if (!student) {
        toast({
          title: "Aluno não encontrado",
          description: "Verifique o RA e tente novamente",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }
      
      // Registrar presença
      const result = await recordAttendance(student.ra);
      
      if (result) {
        setSuccess(true);
        setStudentName(student.name);
        setRa("");
        
        // Resetar após 3 segundos
        setTimeout(() => {
          setSuccess(false);
          setStudentName("");
          setIsProcessing(false);
        }, 3000);
        
        toast({
          title: "Presença registrada!",
          description: `${student.name} está presente na aula de hoje.`,
          variant: "default"
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível registrar a presença",
          variant: "destructive"
        });
        setIsProcessing(false);
      }    } catch (error) {
      console.error('Erro ao registrar presença:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao registrar a presença",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };
    return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <div className="p-4 bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="mr-2 h-5 w-5" />
            <span>Voltar para o dashboard</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>{currentUser?.user_metadata?.name}</span>
              <span className="text-gray-400">•</span>
              <span>{currentUser?.user_metadata?.role === 'professor' ? 'Professor' : 'Monitor'}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 shadow-lg border-t-4 border-t-blue-500">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <UserCheck className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold">Registro de Presença</h1>
            <p className="text-gray-500 mt-2">
              Digite seu RA para confirmar sua presença na aula de hoje
            </p>
          </div>
          
          {success ? (
            <div className="bg-green-50 border border-green-100 rounded-lg p-6 text-center animate-in fade-in-50 duration-300">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-green-800">
                Presença Registrada!
              </h2>
              <p className="mt-2 text-green-700">
                {studentName} está presente na aula de hoje.
              </p>
              <p className="mt-4 text-sm text-gray-500">
                Esta tela fechará automaticamente em alguns segundos...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="ra" className="text-center block">Registro do Aluno (RA)</Label>
                <Input
                  id="ra"
                  placeholder="Digite seu RA"
                  value={ra}
                  onChange={(e) => setRa(e.target.value)}
                  className="text-center text-lg font-medium"
                  autoFocus
                  autoComplete="off"
                  disabled={isProcessing}
                />
                <p className="text-sm text-gray-500 text-center mt-1">
                  Exemplo: 2023001
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 text-lg transition-all"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processando...</span>
                  </div>
                ) : "Registrar Presença"}
              </Button>
            </form>
          )}
          
          <div className="mt-6 text-center text-xs text-gray-400">
            <p>© {new Date().getFullYear()} Sistema de Controle JJ</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Attendance;
