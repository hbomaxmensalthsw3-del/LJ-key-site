import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Terminal } from "lucide-react";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth-context";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { setToken, refetch } = useAuth();
  const { toast } = useToast();
  const loginMutation = useLogin();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(
      { data: values },
      {
        onSuccess: async (data) => {
          if (data.token) {
            setToken(data.token);
          }
          await refetch();
          setLocation("/admin");
        },
        onError: () => {
          toast({ variant: "destructive", title: "Access Denied", description: "Invalid credentials" });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md border border-border bg-card p-8 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_15px_var(--primary)] opacity-50"></div>
        
        <div className="flex flex-col items-center mb-8">
          <Terminal className="w-12 h-12 text-primary mb-4" />
          <h1 className="text-3xl font-bold tracking-widest uppercase text-primary text-center">Project Void</h1>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest mt-2">Authorized Personnel Only</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase tracking-widest text-xs">Username</FormLabel>
                  <FormControl>
                    <Input className="bg-background border-border font-mono" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase tracking-widest text-xs">Password</FormLabel>
                  <FormControl>
                    <Input type="password" className="bg-background border-border font-mono" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full font-bold uppercase tracking-widest" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Authenticating..." : "Access System"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
