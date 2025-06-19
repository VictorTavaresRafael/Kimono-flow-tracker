import { Student } from "@/types/student";
import { calculateBeltTime, getBeltColor } from "@/utils/helpers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Award, Calendar, Info, User } from "lucide-react";
import { useEffect, useState } from "react";
import { getTurmas, addAlunoToTurma } from "@/lib/supabase-service";
import { Turma } from "@/types/student";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface StudentProfileProps {
  student: Student;
  onBack: () => void;
}

const StudentProfile = ({ student, onBack }: StudentProfileProps) => {
  const formattedStartDate = new Date(student.beltStartDate).toLocaleDateString('pt-BR');

  // Estado para turmas e seleção
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState<string>("");
  const [loadingTurmas, setLoadingTurmas] = useState(true);
  const [adicionando, setAdicionando] = useState(false);

  const { currentUser } = useAuth();

  useEffect(() => {
    setLoadingTurmas(true);
    getTurmas().then(turmas => {
      setTurmas(turmas);
      setLoadingTurmas(false);
    });
  }, []);

  const handleAdicionarTurma = async () => {
    if (!turmaSelecionada || !student.id) return;
    setAdicionando(true);
    try {
      const ok = await addAlunoToTurma(Number(student.id), Number(turmaSelecionada));
      if (ok) {
        toast({ title: "Aluno adicionado à turma com sucesso!" });
      } else {
        toast({ title: "Erro ao adicionar aluno à turma", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Erro ao adicionar aluno à turma", description: String(e), variant: "destructive" });
    } finally {
      setAdicionando(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6">
      <Button 
        variant="ghost" 
        className="mb-4 pl-0" 
        onClick={onBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>
      
      <Card className="p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="h-12 w-12 text-gray-500" />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold">{student.name}</h1>
            <p className="text-gray-500">RA: {student.ra}</p>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <div className="flex items-center mb-4">
                  <Award className="h-5 w-5 mr-2 text-jj-blue" />
                  <span className="font-medium">Faixa</span>
                </div>
                <div className="flex items-center gap-2">
                  <span 
                    className={`${getBeltColor(student.belt)} px-3 py-1.5 rounded-md font-medium`}
                  >
                    {student.belt === 'white' ? 'Branca' : 
                     student.belt === 'blue' ? 'Azul' : 
                     student.belt === 'purple' ? 'Roxa' : 
                     student.belt === 'brown' ? 'Marrom' : 'Preta'}
                  </span>
                  <span className="text-sm text-gray-600">
                    ({calculateBeltTime(student.beltStartDate)})
                  </span>
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  Desde {formattedStartDate}
                </span>
              </div>
              
              <div className="flex flex-col">
                <div className="flex items-center mb-4">
                  <User className="h-5 w-5 mr-2 text-jj-blue" />
                  <span className="font-medium">Características</span>
                </div>
                <div className="space-y-1">
                  <p>Peso: {student.weight}kg</p>
                  <p>Altura: {student.height}cm</p>
                </div>
              </div>
              
              <div className="flex flex-col md:col-span-2">
                <div className="flex items-center mb-4">
                  <Calendar className="h-5 w-5 mr-2 text-jj-blue" />
                  <span className="font-medium">Presenças</span>
                </div>
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                  <span className="block text-2xl font-bold text-jj-blue">{student.attendanceCount}</span>
                  <span className="text-sm text-gray-500">aulas registradas</span>
                </div>
              </div>
              
              {/*
              {student.additionalInfo && (
                <div className="flex flex-col md:col-span-2">
                  <div className="flex items-center mb-4">
                    <Info className="h-5 w-5 mr-2 text-jj-blue" />
                    <span className="font-medium">Informações adicionais</span>
                  </div>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {student.additionalInfo}
                  </p>
                </div>
              )}
              */}
            </div>
          </div>
        </div>
        {/* Adicionar em uma turma - apenas para professor */}
        {currentUser?.user_metadata?.role === 'professor' && (
          <div className="mt-8">
            <h2 className="font-semibold mb-2">Adicionar em uma turma</h2>
            {loadingTurmas ? (
              <p className="text-sm text-gray-500">Carregando turmas...</p>
            ) : (
              <div className="flex gap-2 items-center">
                <select
                  className="border rounded px-2 py-1"
                  value={turmaSelecionada}
                  onChange={e => setTurmaSelecionada(e.target.value)}
                >
                  <option value="">Selecione a turma</option>
                  {turmas.map(turma => (
                    <option key={turma.id} value={turma.id}>{turma.nome}</option>
                  ))}
                </select>
                <Button
                  onClick={handleAdicionarTurma}
                  disabled={!turmaSelecionada || adicionando}
                >
                  {adicionando ? "Adicionando..." : "Adicionar à turma"}
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentProfile;
