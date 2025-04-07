
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Check, QrCode } from "lucide-react";
import { Link } from "react-router-dom";
import { recordAttendance, getStudentByRA } from "@/utils/helpers";
import { toast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";

const Attendance = () => {
  const [ra, setRa] = useState("");
  const [success, setSuccess] = useState(false);
  const [studentName, setStudentName] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ra.trim()) {
      toast({
        title: "Erro",
        description: "Digite o RA do aluno para registrar presença",
        variant: "destructive"
      });
      return;
    }
    
    // Verificar se o aluno existe e registrar presença
    const student = getStudentByRA(ra.trim());
    
    if (!student) {
      toast({
        title: "Aluno não encontrado",
        description: "Verifique o RA e tente novamente",
        variant: "destructive"
      });
      return;
    }
    
    // Registrar presença
    const result = recordAttendance(student.ra);
    
    if (result) {
      setSuccess(true);
      setStudentName(student.name);
      setRa("");
      
      // Resetar após 3 segundos
      setTimeout(() => {
        setSuccess(false);
        setStudentName("");
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
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="p-4 bg-white shadow-sm">
        <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="mr-2 h-5 w-5" />
          <span>Voltar para o dashboard</span>
        </Link>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md p-6">
          <div className="text-center mb-6">
            <QrCode className="h-12 w-12 mx-auto mb-2 text-jj-blue" />
            <h1 className="text-2xl font-bold">Registro de Presença</h1>
            <p className="text-gray-500 mt-2">
              Digite o RA do aluno para registrar a presença na aula de hoje
            </p>
          </div>
          
          {success ? (
            <div className="bg-green-50 border border-green-100 rounded-lg p-6 text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-green-800">
                Presença Registrada!
              </h2>
              <p className="mt-1 text-green-700">
                {studentName} está presente na aula de hoje.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  id="ra"
                  placeholder="Digite o RA do aluno"
                  value={ra}
                  onChange={(e) => setRa(e.target.value)}
                  className="text-center text-lg"
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full">
                Registrar Presença
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Attendance;
