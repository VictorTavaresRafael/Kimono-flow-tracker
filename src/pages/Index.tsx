import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Student } from "@/types/student";
import { getStudents, saveStudent } from "@/utils/helpers";
import StudentCard from "@/components/StudentCard";
import StudentProfile from "@/components/StudentProfile";
import StudentForm from "@/components/StudentForm";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import { useAuth } from "@/contexts/AuthContext";
import { PlusCircle, QrCode, Search, LogOut, User, Calendar } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";

const Index = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);  const [studentToEdit, setStudentToEdit] = useState<Student | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  
  // Carregar alunos
  useEffect(() => {
    const loadStudents = async () => {
      try {
        setIsLoading(true);
        const loadedStudents = await getStudents();
        setStudents(loadedStudents);
        setFilteredStudents(loadedStudents);
      } catch (error) {
        console.error('Erro ao carregar alunos:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os alunos",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStudents();
  }, []);
  
  // Filtrar alunos quando a busca mudar
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredStudents(students);
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    const filtered = students.filter(
      student => 
        student.name.toLowerCase().includes(query) || 
        student.ra.toLowerCase().includes(query)
    );
    
    setFilteredStudents(filtered);
  }, [searchQuery, students]);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleOpenStudentProfile = (student: Student) => {
    setSelectedStudent(student);
  };
  
  const handleCloseStudentProfile = () => {
    setSelectedStudent(null);
  };
    const handleSaveStudent = async (student: Student) => {
    try {
      const savedStudent = await saveStudent(student);
      
      // Recarregar a lista de estudantes
      const updatedStudents = await getStudents();
      setStudents(updatedStudents);
      setFilteredStudents(updatedStudents);
      
      setIsFormOpen(false);
      setStudentToEdit(undefined);
      
      toast({
        title: "Aluno salvo com sucesso",
        description: student.id ? "Dados atualizados com sucesso." : "Novo aluno cadastrado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar aluno:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o aluno",
        variant: "destructive"
      });
    }
  };
    const handleOpenForm = (student?: Student) => {
    setStudentToEdit(student);
    setIsFormOpen(true);
  };

  const { currentUser, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {selectedStudent ? (
        <StudentProfile 
          student={selectedStudent} 
          onBack={handleCloseStudentProfile}
        />
      ) : (
        <div className="w-full max-w-3xl mx-auto px-4 py-6">
          {/* Header com informações do usuário */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">
                  Bem-vindo, {currentUser?.user_metadata?.name || 'Usuário'}
                </h2>
                <p className="text-sm text-gray-500">
                  {currentUser?.user_metadata?.role === 'professor' ? 'Professor' : 'Monitor'} • 
                  RA: {currentUser?.user_metadata?.ra}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/attendance">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Registrar Presença
                </Button>
              </Link>
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

          <header className="mb-6">
            <h1 className="text-2xl font-bold text-jj-navy mb-2">Sistema de Controle de Alunos</h1>
            <p className="text-gray-600">
              Gerencie seus alunos de jiu-jitsu com facilidade.
            </p>
          </header>
          
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Buscar alunos por nome ou RA..."
                value={searchQuery}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold">
              {filteredStudents.length} {filteredStudents.length === 1 ? "Aluno" : "Alunos"}
            </h2>
          </div>
            <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Carregando alunos...</p>
              </div>
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onClick={() => handleOpenStudentProfile(student)}
                />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  Nenhum aluno encontrado.
                </p>
                {searchQuery && (
                  <Button
                    variant="link"
                    onClick={() => setSearchQuery("")}
                    className="mt-2"
                  >
                    Limpar busca
                  </Button>
                )}
              </div>
            )}
          </div>
          
          {/* Botões flutuantes */}
          <div className="fixed bottom-6 left-6">
            <Button 
              className="h-14 w-14 rounded-full shadow-lg bg-jj-blue hover:bg-jj-navy transition-colors"
              onClick={() => setIsQRDialogOpen(true)}
            >
              <QrCode />
              <span className="sr-only">Gerar QR Code</span>
            </Button>
          </div>
          <div className="fixed bottom-6 right-6">
            <Button 
              className="h-14 w-14 rounded-full shadow-lg"
              onClick={() => handleOpenForm()}
            >
              <PlusCircle />
              <span className="sr-only">Adicionar Aluno</span>
            </Button>
          </div>
          
          {/* Modal de QR Code */}
          <QRCodeGenerator 
            isOpen={isQRDialogOpen} 
            onClose={() => setIsQRDialogOpen(false)}
          />
          
          {/* Modal de Formulário */}
          <StudentForm 
            isOpen={isFormOpen}
            onClose={() => {
              setIsFormOpen(false);
              setStudentToEdit(undefined);
            }}
            onSave={handleSaveStudent}
            studentToEdit={studentToEdit}
          />
        </div>
      )}
    </div>
  );
};

export default Index;
