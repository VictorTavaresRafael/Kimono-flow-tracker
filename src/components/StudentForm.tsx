
import { useEffect, useState } from "react";
import { BeltType, Student } from "@/types/student";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

interface StudentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
  studentToEdit?: Student;
}

const defaultStudent: Omit<Student, "id"> = {
  ra: "",
  name: "",
  belt: "white",
  beltStartDate: new Date(),
  weight: 0,
  height: 0,
  additionalInfo: "",
  attendanceCount: 0
};

const StudentForm = ({ isOpen, onClose, onSave, studentToEdit }: StudentFormProps) => {
  const [formData, setFormData] = useState<Omit<Student, "id">>({ ...defaultStudent });
  const [beltStartDateStr, setBeltStartDateStr] = useState(
    new Date().toISOString().split('T')[0]
  );
  
  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        ...studentToEdit
      });
      
      // Converter data para formato de input date
      const dateObj = new Date(studentToEdit.beltStartDate);
      setBeltStartDateStr(dateObj.toISOString().split('T')[0]);
    } else {
      setFormData({ ...defaultStudent });
      setBeltStartDateStr(new Date().toISOString().split('T')[0]);
    }
  }, [studentToEdit, isOpen]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'weight' || name === 'height' ? parseFloat(value) : value
    }));
  };
  
  const handleBeltChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      belt: value as BeltType
    }));
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    setBeltStartDateStr(dateStr);
    
    setFormData(prev => ({
      ...prev,
      beltStartDate: new Date(dateStr)
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.ra || !formData.name || formData.weight <= 0 || formData.height <= 0) {
      toast({
        title: "Formulário incompleto",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    const studentData: Student = {
      id: studentToEdit?.id || "",
      ...formData,
    };
    
    onSave(studentData);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{studentToEdit ? "Editar Aluno" : "Adicionar Novo Aluno"}</DialogTitle>
          <DialogDescription>
            {studentToEdit 
              ? "Altere os dados do aluno conforme necessário."
              : "Preencha os dados para cadastrar um novo aluno."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="ra">RA (Registro do Aluno)*</Label>
              <Input
                id="ra"
                name="ra"
                placeholder="Ex: 2023001"
                value={formData.ra}
                onChange={handleInputChange}
                disabled={!!studentToEdit}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="name">Nome Completo*</Label>
              <Input
                id="name"
                name="name"
                placeholder="Nome do aluno"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="weight">Peso (kg)*</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="Ex: 75.5"
                  value={formData.weight || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="height">Altura (cm)*</Label>
                <Input
                  id="height"
                  name="height"
                  type="number"
                  min="0"
                  placeholder="Ex: 178"
                  value={formData.height || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="belt">Faixa*</Label>
                <Select
                  value={formData.belt}
                  onValueChange={handleBeltChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a faixa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="white">Branca</SelectItem>
                      <SelectItem value="blue">Azul</SelectItem>
                      <SelectItem value="purple">Roxa</SelectItem>
                      <SelectItem value="brown">Marrom</SelectItem>
                      <SelectItem value="black">Preta</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="beltStartDate">Data de Graduação*</Label>
                <Input
                  id="beltStartDate"
                  name="beltStartDate"
                  type="date"
                  value={beltStartDateStr}
                  onChange={handleDateChange}
                  required
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="additionalInfo">Informações Adicionais</Label>
              <Textarea
                id="additionalInfo"
                name="additionalInfo"
                placeholder="Observações sobre o aluno, lesões, objetivos, etc."
                value={formData.additionalInfo || ''}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {studentToEdit ? "Atualizar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StudentForm;
