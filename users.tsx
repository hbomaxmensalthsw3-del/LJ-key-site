import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminLayout } from "@/components/layout";
import { useListUsers, useDeleteUser, useCreateUser, getListUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ShieldAlert, Trash2, Lock, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const createUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function AdminUsers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);

  const { data, isLoading } = useListUsers();
  const deleteUser = useDeleteUser();
  const createUser = useCreateUser();

  const form = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = (values: z.infer<typeof createUserSchema>) => {
    createUser.mutate(
      { data: values },
      {
        onSuccess: () => {
          toast({ title: "User Created", description: "New admin has been added to the system." });
          queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
          form.reset();
          setShowAddForm(false);
        },
        onError: () => {
          toast({ variant: "destructive", title: "Error", description: "Failed to create user." });
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUser.mutate(
        { id },
        {
          onSuccess: () => {
            toast({ title: "User Deleted", description: "Access revoked." });
            queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
          },
          onError: () => {
            toast({ variant: "destructive", title: "Error", description: "Failed to delete user." });
          },
        }
      );
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight uppercase text-primary">Access Control</h1>
            <span className="px-2 py-1 text-[10px] font-bold tracking-widest bg-primary/20 text-primary border border-primary/30 uppercase">
              Owner Only
            </span>
          </div>
          <p className="text-muted-foreground font-mono text-sm">Manage system administrators.</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="font-bold uppercase tracking-wider gap-2">
          {showAddForm ? "Cancel" : <><Plus className="w-4 h-4" /> Add Admin</>}
        </Button>
      </div>

      {showAddForm && (
        <div className="mb-8 p-6 border border-border bg-card">
          <h2 className="text-lg font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" /> Create Admin
          </h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
              <Button type="submit" className="font-bold uppercase tracking-widest" disabled={createUser.isPending}>
                {createUser.isPending ? "Creating..." : "Create Admin"}
              </Button>
            </form>
          </Form>
        </div>
      )}

      <div className="border border-border bg-card overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_15px_var(--primary)] opacity-30"></div>
        {isLoading ? (
          <div className="p-10 text-center font-mono text-muted-foreground animate-pulse">Loading personnel data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-background border-b border-border uppercase font-mono text-muted-foreground text-xs">
                <tr>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y border-border font-mono text-sm">
                {data?.users.map((u) => (
                  <tr key={u.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4 font-bold tracking-wider flex items-center gap-3">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      {u.username}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase border ${
                        u.role === 'owner' 
                          ? 'bg-primary/20 text-primary border-primary/30 shadow-[0_0_10px_var(--primary)]' 
                          : 'bg-blue-500/20 text-blue-500 border-blue-500/30'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{format(new Date(), "MMM d, yyyy")}</td>
                    <td className="px-6 py-4 text-right">
                      {u.role === 'owner' ? (
                        <div className="flex justify-end items-center pr-3">
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        </div>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(u.id)}
                          disabled={deleteUser.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
