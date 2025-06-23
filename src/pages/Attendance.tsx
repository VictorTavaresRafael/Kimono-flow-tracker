import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Check, QrCode, UserCheck, LogOut, User } from "lucide-react";
import { Link } from "react-router-dom";
import { getStudentByRA } from "@/utils/helpers";
import { getAlunosCompletos } from "@/lib/supabase-service";
import { toast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { getTurmas } from "@/lib/supabase-service";
import { supabase } from "@/lib/supabase";
import { Turma, Aula, Student } from "@/types/student";

const Attendance = () => {
  const [ra, setRa] = useState("");
  const [success, setSuccess] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { currentUser, signOut } = useAuth();
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [turmaId, setTurmaId] = useState<string>("");
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [aulaId, setAulaId] = useState<string>("");
  const [loadingTurmas, setLoadingTurmas] = useState(true);
  const [loadingAulas, setLoadingAulas] = useState(false);
  const [alunosTurma, setAlunosTurma] = useState<Student[]>([]);
  const [alunoId, setAlunoId] = useState<string>("");
  const [professorId, setProfessorId] = useState<number | null>(null);

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

  // Buscar turmas do professor logado
  useEffect(() => {
    async function fetchTurmas() {
      setLoadingTurmas(true);
      const allTurmas = await getTurmas();
      const ra = currentUser?.user_metadata?.ra;
      const usuario = await supabase.from('usuarios').select('id').eq('ra', ra).single();
      const professorId = usuario.data?.id;
      setTurmas(allTurmas.filter(t => t.professor_id === professorId));
      setLoadingTurmas(false);
    }
    if (currentUser?.user_metadata?.role === 'professor') {
      fetchTurmas();
    }
  }, [currentUser]);

  // Buscar aulas da turma selecionada
  useEffect(() => {
    async function fetchAulas() {
      if (!turmaId) return;
      setLoadingAulas(true);
      const { data, error } = await supabase
        .from('aulas')
        .select('*')
        .eq('turma_id', turmaId)
        .order('data_hora', { ascending: false });
      setAulas(data || []);
      setLoadingAulas(false);
      setAulaId("");
    }
    fetchAulas();
  }, [turmaId]);

  // Buscar alunos da turma selecionada
  useEffect(() => {
    async function fetchAlunosTurma() {
      if (!turmaId) { setAlunosTurma([]); setAlunoId(""); return; }
      // Buscar alunos da turma
      const { data: rels } = await supabase
        .from('alunos_turmas')
        .select('aluno_id')
        .eq('turma_id', turmaId);
      if (!rels?.length) { setAlunosTurma([]); setAlunoId(""); return; }
      const alunoIds = rels.map(r => r.aluno_id);
      const alunosCompletos = await getAlunosCompletos();
      const alunos = alunosCompletos.filter(a => alunoIds.includes(a.id));
      setAlunosTurma(alunos.map(a => ({
        id: a.id.toString(),
        ra: a.ra,
        name: a.nome,
        belt: faixaToBelt(a.detalhes?.faixa),
        beltStartDate: new Date(),
        attendanceCount: a.total_presencas || 0,
        weight: a.detalhes?.peso,
        height: a.detalhes?.altura
      })));
      setAlunoId("");
    }
    fetchAlunosTurma();
  }, [turmaId]);

  // Buscar o id do professor logado
  useEffect(() => {
    async function fetchProfessorId() {
      if (currentUser?.user_metadata?.ra) {
        const usuario = await supabase.from('usuarios').select('id').eq('ra', currentUser.user_metadata.ra).single();
        setProfessorId(usuario.data?.id || null);
      }
    }
    fetchProfessorId();
  }, [currentUser]);

  // Função utilitária para converter faixa para BeltType
  const faixaToBelt = (faixa: string): 'white' | 'blue' | 'purple' | 'brown' | 'black' => {
    switch (faixa?.toLowerCase()) {
      case 'branca': return 'white';
      case 'azul': return 'blue';
      case 'roxa': return 'purple';
      case 'marrom': return 'brown';
      case 'preta': return 'black';
      default: return 'white';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alunoId) {
      toast({ title: "Erro", description: "Selecione um aluno para registrar presença", variant: "destructive" });
      return;
    }
    if (!professorId) {
      toast({ title: "Erro", description: "Professor não identificado", variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    try {
      // Verificar se já existe presença para este aluno nesta aula
      const { data: presencasExistentes } = await supabase
        .from('presencas')
        .select('id')
        .eq('aula_id', aulaId)
        .eq('aluno_id', alunoId);
      if (presencasExistentes && presencasExistentes.length > 0) {
        toast({ title: "Presença já registrada", description: "Este aluno já está presente nesta aula.", variant: "default" });
        setIsProcessing(false);
        return;
      }
      // Registrar presença
      const { error } = await supabase.from('presencas').insert({
        aula_id: Number(aulaId),
        aluno_id: Number(alunoId),
        registrada_por: professorId,
        horario: new Date().toISOString()
      });
      if (error) throw error;
      setSuccess(true);
      setStudentName(alunosTurma.find(a => a.id === alunoId)?.name || "");
      setAlunoId("");
      setTimeout(() => {
        setSuccess(false);
        setStudentName("");
        setIsProcessing(false);
      }, 3000);
      toast({ title: "Presença registrada!", description: `${alunosTurma.find(a => a.id === alunoId)?.name} está presente na aula de hoje.`, variant: "default" });
    } catch (error) {
      toast({ title: "Erro ao registrar presença", description: String(error), variant: "destructive" });
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
              Selecione o aluno para confirmar presença na aula de hoje
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
                <Label>Turma</Label>
                {loadingTurmas ? (
                  <p>Carregando turmas...</p>
                ) : (
                  <select
                    className="border rounded px-2 py-1 w-full"
                    value={turmaId}
                    onChange={e => setTurmaId(e.target.value)}
                    required
                  >
                    <option value="">Selecione a turma</option>
                    {turmas.map(turma => (
                      <option key={turma.id} value={turma.id}>{turma.nome}</option>
                    ))}
                  </select>
                )}
              </div>
              {turmaId && (
                <div className="space-y-2">
                  <Label>Aula</Label>
                  {loadingAulas ? (
                    <p>Carregando aulas...</p>
                  ) : (
                    <select
                      className="border rounded px-2 py-1 w-full"
                      value={aulaId}
                      onChange={e => setAulaId(e.target.value)}
                      required
                    >
                      <option value="">Selecione a aula</option>
                      {aulas.map(aula => (
                        <option key={aula.id} value={aula.id}>
                          {new Date(aula.data_hora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
              {aulaId && (
                <div className="space-y-2">
                  <Label htmlFor="aluno">Aluno</Label>
                  <select
                    id="aluno"
                    className="border rounded px-2 py-1 w-full"
                    value={alunoId}
                    onChange={e => setAlunoId(e.target.value)}
                    required
                  >
                    <option value="">Selecione o aluno</option>
                    {alunosTurma.map(aluno => (
                      <option key={aluno.id} value={aluno.id}>{aluno.name} (RA: {aluno.ra})</option>
                    ))}
                  </select>
                </div>
              )}
              <Button
                type="submit"
                className="w-full h-12 text-lg transition-all"
                disabled={isProcessing || !turmaId || !aulaId || !alunoId}
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
