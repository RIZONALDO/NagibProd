import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Video, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

interface PublicSettings {
  company_name?: string | null;
  system_name?: string | null;
  logo_url?: string | null;
}

export default function LoginPage() {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const [loginVal, setLoginVal] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<PublicSettings>({});

  useEffect(() => {
    fetch("/api/settings/public")
      .then(r => r.json())
      .then(data => setSettings(data))
      .catch(() => {});
  }, []);

  const companyName = settings.company_name || settings.system_name || "Nagibe Produção";
  const logoUrl = settings.logo_url;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginVal || !password) return;
    setLoading(true);
    setError(null);
    try {
      await login(loginVal, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={companyName}
                className="h-16 w-16 object-contain rounded-xl"
              />
            ) : (
              <div className="bg-primary text-primary-foreground p-3 rounded-xl">
                <Video className="h-8 w-8" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{companyName}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Bem-vindo ao sistema de gestão operacional.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login">Login</Label>
            <Input
              id="login"
              type="text"
              placeholder="Seu login de acesso"
              value={loginVal}
              onChange={(e) => setLoginVal(e.target.value)}
              autoComplete="username"
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
                required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 text-muted-foreground"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading || !loginVal || !password}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Sistema restrito. Acesso somente para usuários autorizados.
        </p>
      </div>
    </div>
  );
}
