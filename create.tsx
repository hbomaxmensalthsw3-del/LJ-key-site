import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateKey, useCreateKeysBulk } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { KeyRound, ShieldCheck, Zap } from "lucide-react";

const singleKeySchema = z.object({
  note: z.string().optional(),
  expiresInDays: z.coerce.number().min(1, "Must be at least 1 day").optional().or(z.literal("")),
});

const bulkKeySchema = z.object({
  count: z.coerce.number().min(1, "Must generate at least 1").max(100, "Max 100 per batch"),
  note: z.string().optional(),
  expiresInDays: z.coerce.number().min(1, "Must be at least 1 day").optional().or(z.literal("")),
});

export default function CreateKey() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const createKey = useCreateKey();
  const createKeysBulk = useCreateKeysBulk();

  const singleForm = useForm<z.infer<typeof singleKeySchema>>({
    resolver: zodResolver(singleKeySchema),
    defaultValues: {
      note: "",
      expiresInDays: "",
    },
  });

  const bulkForm = useForm<z.infer<typeof bulkKeySchema>>({
    resolver: zodResolver(bulkKeySchema),
    defaultValues: {
      count: 10,
      note: "Bulk Generated",
      expiresInDays: "",
    },
  });

  const onSingleSubmit = (values: z.infer<typeof singleKeySchema>) => {
    createKey.mutate(
      { data: { note: values.note, expiresInDays: values.expiresInDays ? Number(values.expiresInDays) : undefined } },
      {
        onSuccess: () => {
          toast({ title: "Key Generated", description: "New access key created successfully." });
          setLocation("/admin");
        },
        onError: () => {
          toast({ variant: "destructive", title: "Error", description: "Failed to generate key." });
        }
      }
    );
  };

  const onBulkSubmit = (values: z.infer<typeof bulkKeySchema>) => {
    createKeysBulk.mutate(
      { data: { count: values.count, note: values.note, expiresInDays: values.expiresInDays ? Number(values.expiresInDays) : undefined } },
      {
        onSuccess: (data) => {
          toast({ title: "Batch Complete", description: `${data.count} keys generated successfully.` });
          setLocation("/admin");
        },
        onError: () => {
          toast({ variant: "destructive", title: "Error", description: "Failed to generate keys." });
        }
      }
    );
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight uppercase text-primary mb-2">Key Generator</h1>
        <p className="text-muted-foreground font-mono text-sm">Issue new access credentials to the system.</p>
      </div>

      <div className="max-w-2xl bg-card border border-border p-6 relative">
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary"></div>

        <Tabs defaultValue="single" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-background border border-border rounded-none h-12">
            <TabsTrigger value="single" className="font-bold uppercase tracking-widest data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-none">
              Single Issue
            </TabsTrigger>
            <TabsTrigger value="bulk" className="font-bold uppercase tracking-widest data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-none">
              Batch Generate
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single">
            <Form {...singleForm}>
              <form onSubmit={singleForm.handleSubmit(onSingleSubmit)} className="space-y-6">
                <FormField
                  control={singleForm.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Internal Note (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. For YouTube Sponsor" className="bg-background border-border font-mono" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={singleForm.control}
                  name="expiresInDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Expires In (Days) (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Leave empty for lifetime" className="bg-background border-border font-mono" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full font-bold uppercase tracking-widest gap-2" disabled={createKey.isPending}>
                  {createKey.isPending ? "Generating..." : <><KeyRound className="w-4 h-4" /> Issue Credential</>}
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="bulk">
            <Form {...bulkForm}>
              <form onSubmit={bulkForm.handleSubmit(onBulkSubmit)} className="space-y-6">
                <FormField
                  control={bulkForm.control}
                  name="count"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={100} className="bg-background border-border font-mono text-primary font-bold text-lg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={bulkForm.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Batch Note (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Discord Giveaway" className="bg-background border-border font-mono" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={bulkForm.control}
                  name="expiresInDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Expires In (Days) (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Leave empty for lifetime" className="bg-background border-border font-mono" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full font-bold uppercase tracking-widest gap-2" disabled={createKeysBulk.isPending}>
                  {createKeysBulk.isPending ? "Generating Batch..." : <><Zap className="w-4 h-4" /> Initialize Batch</>}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}