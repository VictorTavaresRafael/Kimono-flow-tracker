import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, ra: string, role: 'professor' | 'monitor') => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);  useEffect(() => {
    // Verificar se há um usuário logado ao inicializar
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setCurrentUser(session?.user ?? null);
        setLoading(false);
          if (event === 'SIGNED_IN' && session?.user) {
          console.log('Usuário logado com sucesso:', session.user.email);
          
          // Verificar se é primeira vez logando (email foi confirmado)
          const emailConfirmed = session.user.email_confirmed_at;
          if (emailConfirmed) {
            toast({
              title: 'Email confirmado!',
              description: 'Sua conta foi ativada com sucesso. Bem-vindo!',
            });
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);  const signUp = async (email: string, password: string, name: string, ra: string, role: 'professor' | 'monitor') => {
    setLoading(true);
    try {
      // 1. Criar conta no Supabase Auth com confirmação de email desabilitada para desenvolvimento
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            ra,
            role
          },
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });

      if (error) throw error;

      if (data.user) {
        // 2. Criar registro na tabela usuarios
        const { error: dbError } = await supabase
          .from('usuarios')
          .insert({
            ra,
            nome: name,
            tipo: role,
            senha_hash: 'supabase_auth', // Marcador para indicar que usa Supabase Auth
            criado_em: new Date().toISOString()
          });

        if (dbError) {
          console.error('Erro ao criar usuário na tabela:', dbError);
          // Se falhar ao criar na tabela, ainda mostrar sucesso mas log do erro
          toast({
            title: 'Conta criada parcialmente',
            description: 'Conta criada no sistema de autenticação. Entre em contato com o administrador se tiver problemas.',
            variant: 'default',
          });
          return;
        }

        // Verificar se o usuário precisa confirmar email
        if (data.session) {
          toast({
            title: 'Conta criada e login realizado!',
            description: 'Bem-vindo ao sistema!',
          });
        } else {
          toast({
            title: 'Conta criada com sucesso!',
            description: 'Verifique seu email para confirmar a conta antes de fazer login.',
          });
        }
      }
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      toast({
        title: 'Erro no cadastro',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };  const signIn = async (email: string, password: string) => {
    console.log('signIn iniciado para:', email);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erro no signIn:', error);
        
        // Tratamento específico para email não confirmado
        if (error.message === 'Email not confirmed') {
          toast({
            title: 'Email não confirmado',
            description: 'Clique no botão abaixo para reenviar o email de confirmação.',
            variant: 'destructive',
          });
          // Reenviar automaticamente o email de confirmação
          setTimeout(() => {
            resendConfirmation(email);
          }, 2000);
        } else if (error.message.includes('Invalid login credentials')) {
          toast({
            title: 'Credenciais inválidas',
            description: 'Email ou senha incorretos. Verifique suas credenciais.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Erro no login',
            description: error.message || 'Ocorreu um erro inesperado',
            variant: 'destructive',
          });
        }
        throw error;
      }

      if (data.session) {
        console.log('signIn bem-sucedido');
        toast({
          title: 'Login realizado com sucesso!',
          description: 'Bem-vindo de volta!',
        });
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: 'Logout realizado',
        description: 'Até logo!',
      });
    } catch (error: any) {
      console.error('Erro no logout:', error);
      toast({
        title: 'Erro no logout',
        description: error.message || 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  const resendConfirmation = async (email: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });

      if (error) throw error;

      toast({
        title: 'Email de confirmação reenviado',
        description: 'Verifique sua caixa de entrada e pasta de spam.',
      });
    } catch (error: any) {
      console.error('Erro ao reenviar confirmação:', error);
      toast({
        title: 'Erro ao reenviar email',
        description: error.message || 'Tente novamente em alguns minutos',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    signUp,
    signIn,
    signOut,
    resendConfirmation,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
