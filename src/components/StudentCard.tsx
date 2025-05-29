
import { Student } from "@/types/student";
import { calculateBeltTime, getBeltColor } from "@/utils/helpers";
import { User } from "lucide-react";

interface StudentCardProps {
  student: Student;
  onClick: () => void;
}

const StudentCard = ({ student, onClick }: StudentCardProps) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md p-4 mb-3 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mr-4">
          <User className="h-6 w-6 text-gray-500" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{student.name}</h3>
            <span className="text-sm text-gray-500">RA: {student.ra}</span>
          </div>
          
          <div className="flex items-center mt-2">
            <span 
              className={`${getBeltColor(student.belt)} text-xs px-2 py-1 rounded-full mr-2`}
            >
              Faixa {student.belt === 'white' ? 'Branca' : 
                     student.belt === 'blue' ? 'Azul' : 
                     student.belt === 'purple' ? 'Roxa' : 
                     student.belt === 'brown' ? 'Marrom' : 'Preta'}
            </span>
            <span className="text-xs text-gray-500">
              {calculateBeltTime(student.beltStartDate)} na faixa
            </span>
          </div>
          
          <div className="mt-1 text-xs text-gray-500">
            <span>{student.weight}kg • {student.height}cm • {student.attendanceCount} presenças</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCard;
