import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Turma } from "@/types/student";

interface TurmaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (turma: Omit<Turma, 'id' | 'criado_em'>) => void;
  professorId: number;
}

const TurmaForm = ({ isOpen, onClose, onSave, professorId }: TurmaFormProps) => {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    onSave({ nome, descricao, professor_id: professorId });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Nova Turma</DialogTitle>
          <DialogDescription>Preencha os dados para cadastrar uma nova turma.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nome">Nome da Turma*</Label>
            <Input id="nome" value={nome} onChange={e => setNome(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" value={descricao} onChange={e => setDescricao(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="submit">Criar Turma</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TurmaForm; 