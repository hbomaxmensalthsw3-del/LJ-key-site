import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRedeemKey, useHealthCheck } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Terminal, Key, User, ShieldCheck } from "lucide-react";

const redeemSchema = z.object({
  keyValue: z.string().min(1, "Key is required"),
  username: z.string().min(1, "Roblox username is required"),
});

export default function Home() {
  const { toast } = useToast();
  const redeemKey = useRedeemKey();
  const { data: health, isError: isHealthError } = useHealthCheck();

  const form = useForm<z.infer<typeof redeemSchema>>({
    resolver: zodResolver(redeemSchema),
    defaultValues: {
      keyValue: "",
      username: "",
    },
  });

  const onSubmit = (values: z.infer<typeof redeemSchema>) => {
    redeemKey.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast({
              title: "Access Granted",
              description: "Your key has been successfully redeemed.",
            });
            form.reset();
          } else {
            toast({
              variant: "destructive",
              title: "Access Denied",
              description: data.message || "Failed to redeem key.",
            });
          }
        },
        onError: (error: any) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: error?.data?.error || error?.message || "An unexpected error occurred.",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background text-foreground p-4 relative overflow-hidden">
      {/* Glitchy background noise/grid simulation */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_15px_var(--primary)] opacity-80"></div>

      <div className="w-full max-w-4xl z-10 flex flex-col items-center">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-primary/10 border border-primary/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(20,200,80,0.15)] relative">
            <div className="absolute inset-0 bg-primary/20 animate-pulse"></div>
            <Terminal className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter uppercase text-center drop-shadow-[0_0_8px_rgba(20,200,80,0.5)]">
            Project <span className="text-primary">Void</span>
          </h1>
          <p className="text-muted-foreground mt-2 font-mono text-sm tracking-wider uppercase">
            Authentication Gateway
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl z-10">
          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold uppercase tracking-widest text-primary/80">System Capabilities</h2>
              <p className="text-muted-foreground text-sm font-mono">
                Advanced runtime execution and memory manipulation. Premium access only.
              </p>
            </div>
            
            <ul className="space-y-4 font-mono text-sm">
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                <span><strong className="text-foreground">Level 8 Execution</strong><br/><span className="text-muted-foreground">Bypass advanced anti-cheat measures seamlessly.</span></span>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                <span><strong className="text-foreground">Custom Drawing API</strong><br/><span className="text-muted-foreground">Render custom shapes, ESPs, and overlays directly.</span></span>
              </li>
              <li className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                <span><strong className="text-foreground">Script Hub Access</strong><br/><span className="text-muted-foreground">Cloud-synced library of premium community scripts.</span></span>
              </li>
            </ul>
          </div>

          <div className="bg-card border border-border p-8 relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary"></div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="keyValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Access Key</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="XXXX-XXXX-XXXX-XXXX"
                            className="pl-10 bg-background/50 border-muted focus-visible:border-primary focus-visible:ring-primary/20 font-mono text-primary placeholder:text-muted-foreground/30"
                            data-testid="input-key"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Roblox Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Player123"
                            className="pl-10 bg-background/50 border-muted focus-visible:border-primary focus-visible:ring-primary/20 font-mono"
                            data-testid="input-username"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-widest uppercase h-12 relative group overflow-hidden"
                  disabled={redeemKey.isPending}
                  data-testid="button-redeem"
                >
                  <div className="absolute inset-0 w-full h-full bg-[linear-gradient(transparent_0%,rgba(0,0,0,0.1)_50%,transparent_100%)] bg-[length:100%_4px] group-hover:animate-[scroll_1s_linear_infinite]"></div>
                  {redeemKey.isPending ? "Authenticating..." : (
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5" /> Initialize Payload
                    </span>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>

        <div className="mt-8 flex justify-center space-x-6 text-xs font-mono text-muted-foreground/50">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isHealthError ? 'bg-destructive' : 'bg-primary animate-pulse'}`}></div>
            {isHealthError ? 'System Offline' : (health ? 'System Online' : 'Checking Status...')}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
            Undetected
          </div>
          <a href="/login" className="hover:text-muted-foreground/80 transition-colors">
            Admin
          </a>
        </div>
      </div>
    </div>
  );
}
