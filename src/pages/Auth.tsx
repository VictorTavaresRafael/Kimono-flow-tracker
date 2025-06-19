import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, User, Lock, Mail, UserCheck, GraduationCap } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import EmailConfirmation from '@/components/EmailConfirmation';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    ra: '',
    role: 'professor' as 'professor' | 'monitor'
  });
  const { signIn, signUp, loading, currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirecionar se usuário já está logado
  useEffect(() => {
    if (currentUser) {
      navigate('/', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      role: value as 'professor' | 'monitor'
    }));
  };  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Tentando fazer login com:', formData.email);
    
    try {
      if (isLogin) {
        console.log('Chamando signIn...');
        await signIn(formData.email, formData.password);
        console.log('signIn concluído');
        // O redirecionamento será feito pelo useEffect quando currentUser mudar
      } else {
        if (!formData.name || !formData.ra) {
          throw new Error('Preencha todos os campos obrigatórios');
        }
        console.log('Chamando signUp...');
        await signUp(formData.email, formData.password, formData.name, formData.ra, formData.role);
        console.log('signUp concluído');
        
        // Mostrar tela de confirmação de email se necessário
        setPendingEmail(formData.email);
        setShowEmailConfirmation(true);
      }
    } catch (error: any) {
      console.error('Erro no handleSubmit:', error);
      
      // Se for erro de email não confirmado, mostrar tela de confirmação
      if (error.message === 'Email not confirmed') {
        setPendingEmail(formData.email);
        setShowEmailConfirmation(true);
      }
    }
  };
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setShowEmailConfirmation(false);
    setPendingEmail('');
    setFormData({
      email: '',
      password: '',
      name: '',
      ra: '',
      role: 'professor'
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center p-4">
      
      {/* Mostrar tela de confirmação de email se necessário */}
      {showEmailConfirmation && pendingEmail ? (
        <div className="space-y-4">
          <EmailConfirmation email={pendingEmail} />
          <div className="text-center">
            <Button 
              variant="ghost" 
              onClick={() => {
                setShowEmailConfirmation(false);
                setPendingEmail('');
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Voltar para login
            </Button>
          </div>
        </div>
      ) : (
        <Card className="w-full max-w-md p-8 shadow-xl border-t-4 border-t-blue-500">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <GraduationCap className="h-10 w-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isLogin ? 'Entrar' : 'Criar Conta'}
            </h1>
            <p className="text-gray-500 mt-2">
              {isLogin 
                ? 'Acesse o sistema de controle de alunos' 
                : 'Registre-se para acessar o sistema'
              }
            </p>
          </div>

        <form onSubmit={handleSubmit} className="space-y-6">          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <div className="relative">
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
                required
                className="pl-10"
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Campos adicionais para cadastro */}
          {!isLogin && (
            <>              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nome Completo
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={loading}
                    required
                    className="pl-10"
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ra" className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  RA (Registro)
                </Label>
                <div className="relative">
                  <Input
                    id="ra"
                    name="ra"
                    type="text"
                    placeholder="Ex: PROF001, MON001"
                    value={formData.ra}
                    onChange={handleInputChange}
                    disabled={loading}
                    required
                    className="pl-10"
                  />
                  <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                <p className="text-xs text-gray-500">
                  Use PROF para professores ou MON para monitores
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Função</Label>
                <Select onValueChange={handleRoleChange} value={formData.role}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione sua função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professor">Professor</SelectItem>
                    <SelectItem value="monitor">Monitor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}          {/* Senha */}
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Senha
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
                required
                minLength={6}
                className="pl-10 pr-10"
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {!isLogin && (
              <p className="text-xs text-gray-500">
                Mínimo de 6 caracteres
              </p>
            )}
          </div>

          {/* Botão de submit */}
          <Button 
            type="submit" 
            className="w-full h-12 text-lg transition-all"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processando...</span>
              </div>
            ) : (
              isLogin ? 'Entrar' : 'Criar Conta'
            )}
          </Button>
        </form>

        {/* Toggle entre login e cadastro */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
          </p>
          <button
            type="button"
            onClick={toggleMode}
            className="mt-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
            disabled={loading}
          >
            {isLogin ? 'Criar nova conta' : 'Fazer login'}
          </button>
        </div>        <div className="mt-8 text-center text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Sistema de Controle JJ</p>
          <p className="mt-1">Acesso restrito a professores e monitores</p>
        </div>
      </Card>
      )}
    </div>
  );
};

export default Auth;
