
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Student } from "@/types/student";
import { getStudents, saveStudent } from "@/utils/helpers";
import StudentCard from "@/components/StudentCard";
import StudentProfile from "@/components/StudentProfile";
import StudentForm from "@/components/StudentForm";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import { PlusCircle, QrCode, Search } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | undefined>(undefined);
  
  // Carregar alunos
  useEffect(() => {
    const loadedStudents = getStudents();
    setStudents(loadedStudents);
    setFilteredStudents(loadedStudents);
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
  
  const handleSaveStudent = (student: Student) => {
    const savedStudent = saveStudent(student);
    
    // Atualizar a lista de estudantes
    setStudents(getStudents());
    
    setIsFormOpen(false);
    setStudentToEdit(undefined);
    
    toast({
      title: "Aluno salvo com sucesso",
      description: student.id ? "Dados atualizados com sucesso." : "Novo aluno cadastrado com sucesso.",
    });
  };
  
  const handleOpenForm = (student?: Student) => {
    setStudentToEdit(student);
    setIsFormOpen(true);
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
            {filteredStudents.length > 0 ? (
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
