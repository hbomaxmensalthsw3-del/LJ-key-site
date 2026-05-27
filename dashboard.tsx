import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  useGetStats, 
  useListKeys, 
  useDeleteKey,
  useValidateKey,
  getListKeysQueryKey,
  getGetStatsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Trash2, Key as KeyIcon, ShieldCheck, XCircle, RefreshCw, CheckCircle, Search } from "lucide-react";
import type { ListKeysStatus } from "@workspace/api-client-react";

const validateSchema = z.object({
  keyValue: z.string().min(1, "Key is required")
});

export default function Dashboard() {

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<ListKeysStatus>("all");

  const [validationResult, setValidationResult] = useState<{
    valid: boolean,
    message?: string
  } | null>(null);

  const { data: stats, isLoading: statsLoading } = useGetStats();

  const { data: keysData, isLoading: keysLoading } = useListKeys(
    {
      status: statusFilter === "all"
        ? undefined
        : statusFilter
    },
    {
      query: {
        queryKey: getListKeysQueryKey({
          status: statusFilter === "all"
            ? undefined
            : statusFilter
        })
      }
    }
  );

  const deleteKey = useDeleteKey();
  const validateKey = useValidateKey();

  const validateForm = useForm<z.infer<typeof validateSchema>>({
    resolver: zodResolver(validateSchema),
    defaultValues: {
      keyValue: "",
    },
  });

  const onValidate = (values: z.infer<typeof validateSchema>) => {

    validateKey.mutate(
      {
        data: {
          keyValue: values.keyValue
        }
      },
      {
        onSuccess: (data) => {

          setValidationResult({
            valid: data.valid,
            message: data.message
          });

          if (data.valid) {

            toast({
              title: "Key Valid",
              description: "The key is active and ready to use."
            });

          } else {

            toast({
              variant: "destructive",
              title: "Key Invalid",
              description: data.message || "The key is not valid."
            });
          }
        },

        onError: () => {

          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to validate key."
          });
        }
      }
    );
  };

  const handleDelete = (id: number) => {

    if (confirm("Are you sure you want to delete this key?")) {

      deleteKey.mutate(
        { id },
        {
          onSuccess: () => {

            toast({
              title: "Key Deleted",
              description: "The key was permanently removed."
            });

            queryClient.invalidateQueries({
              queryKey: getListKeysQueryKey({
                status: statusFilter === "all"
                  ? undefined
                  : statusFilter
              })
            });

            queryClient.invalidateQueries({
              queryKey: getGetStatsQueryKey()
            });
          },

          onError: () => {

            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to delete key."
            });
          }
        }
      );
    }
  };

  const getStatusColor = (status: string) => {

    switch (status) {

      case "active":
        return "bg-primary/20 text-primary border-primary/30";

      case "redeemed":
        return "bg-blue-500/20 text-blue-500 border-blue-500/30";

      case "expired":
        return "bg-destructive/20 text-destructive border-destructive/30";

      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (

    <AdminLayout>

      <div className="flex justify-between items-end mb-8">

        <div>

          <h1 className="text-3xl font-bold tracking-tight uppercase text-primary mb-2">
            System Overview
          </h1>

          <p className="text-muted-foreground font-mono text-sm">
            Real-time statistics and access management.
          </p>

        </div>

        <Link href="/admin/create">

          <Button className="font-bold uppercase tracking-wider gap-2">
            <KeyIcon className="w-4 h-4" />
            Generate New
          </Button>

        </Link>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        <Card className="bg-card border-border">

          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">

            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Total Keys
            </CardTitle>

            <KeyIcon className="w-4 h-4 text-primary" />

          </CardHeader>

          <CardContent>
            <div className="text-3xl font-bold font-mono">
              {statsLoading ? "-" : stats?.totalKeys}
            </div>
          </CardContent>

        </Card>

        <Card className="bg-card border-border">

          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">

            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Active
            </CardTitle>

            <ShieldCheck className="w-4 h-4 text-primary" />

          </CardHeader>

          <CardContent>
            <div className="text-3xl font-bold font-mono">
              {statsLoading ? "-" : stats?.activeKeys}
            </div>
          </CardContent>

        </Card>

        <Card className="bg-card border-border">

          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">

            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Redeemed
            </CardTitle>

            <RefreshCw className="w-4 h-4 text-blue-500" />

          </CardHeader>

          <CardContent>
            <div className="text-3xl font-bold font-mono text-blue-500">
              {statsLoading ? "-" : stats?.redeemedKeys}
            </div>
          </CardContent>

        </Card>

        <Card className="bg-card border-border">

          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">

            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Expired
            </CardTitle>

            <XCircle className="w-4 h-4 text-destructive" />

          </CardHeader>

          <CardContent>
            <div className="text-3xl font-bold font-mono text-destructive">
              {statsLoading ? "-" : stats?.expiredKeys}
            </div>
          </CardContent>

        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

        <div className="lg:col-span-2">

          <div className="flex justify-between items-center mb-4">

            <h2 className="text-xl font-bold uppercase tracking-widest text-primary/80">
              Access Log
            </h2>

            <div className="w-48">

              <Select
                value={statusFilter}
                onValueChange={(val) =>
                  setStatusFilter(val as ListKeysStatus)
                }
              >

                <SelectTrigger className="font-mono text-sm bg-background border-border">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">ALL_STATUS</SelectItem>
                  <SelectItem value="active">ACTIVE</SelectItem>
                  <SelectItem value="redeemed">REDEEMED</SelectItem>
                  <SelectItem value="expired">EXPIRED</SelectItem>
                </SelectContent>

              </Select>

            </div>

          </div>

          <div className="border border-border bg-card overflow-hidden relative">

            {keysLoading ? (

              <div className="p-10 text-center font-mono text-muted-foreground animate-pulse">
                Loading secure data...
              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full text-sm text-left">

                  <thead className="bg-background border-b border-border uppercase font-mono text-muted-foreground text-xs">

                    <tr>
                      <th className="px-6 py-4">Key Value</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Redeemed By</th>
                      <th className="px-6 py-4">Note</th>
                      <th className="px-6 py-4">Created</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>

                  </thead>

                  <tbody className="divide-y border-border font-mono text-sm">

                    {keysData?.keys.map((key) => (

                      <tr key={key.id} className="hover:bg-primary/5 transition-colors">

                        <td className="px-6 py-4 font-bold tracking-wider">
                          {key.keyValue}
                        </td>

                        <td className="px-6 py-4">

                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase border ${getStatusColor(key.status)}`}>
                            {key.status}
                          </span>

                        </td>

                        <td className="px-6 py-4 text-muted-foreground">
                          {key.redeemedBy || "—"}
                        </td>

                        <td className="px-6 py-4 text-muted-foreground truncate max-w-[150px]">
                          {key.note || "—"}
                        </td>

                        <td className="px-6 py-4 text-muted-foreground">
                          {format(new Date(key.createdAt), "MMM d, yyyy")}
                        </td>

                        <td className="px-6 py-4 text-right flex justify-end gap-2">

                          <Button
                            variant="ghost"
                            className="text-green-500 hover:text-green-400 hover:bg-green-500/10 font-bold text-xs"
                            onClick={() => {
                              navigator.clipboard.writeText(key.keyValue)
                              alert("Key copiada!")
                            }}
                          >
                            COPY
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(key.id)}
                            disabled={deleteKey.isPending}
                            data-testid={`btn-delete-${key.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>

                        </td>

                      </tr>

                    ))}

                    {keysData?.keys.length === 0 && (

                      <tr>

                        <td
                          colSpan={6}
                          className="px-6 py-10 text-center text-muted-foreground font-mono"
                        >
                          NO_RECORDS_FOUND
                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>

        <div>

          <h2 className="text-xl font-bold uppercase tracking-widest text-primary/80 mb-4">
            Diagnostic Tool
          </h2>

          <Card className="bg-card border-border relative overflow-hidden">

            <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_15px_var(--primary)] opacity-50"></div>

            <CardHeader>

              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Search className="w-4 h-4" />
                Validate Key
              </CardTitle>

            </CardHeader>

            <CardContent>

              <Form {...validateForm}>

                <form
                  onSubmit={validateForm.handleSubmit(onValidate)}
                  className="space-y-4"
                >

                  <FormField
                    control={validateForm.control}
                    name="keyValue"
                    render={({ field }) => (
                      <FormItem>

                        <FormControl>
                          <Input
                            placeholder="Enter key to validate..."
                            className="bg-background border-border font-mono"
                            {...field}
                          />
                        </FormControl>

                        <FormMessage />

                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full font-bold uppercase tracking-widest gap-2"
                    disabled={validateKey.isPending}
                  >
                    {validateKey.isPending
                      ? "Checking..."
                      : "Run Diagnostic"}
                  </Button>

                </form>

              </Form>

              {validationResult && (

                <div className={`mt-4 p-3 border rounded text-xs font-mono uppercase font-bold flex items-center gap-2 ${
                  validationResult.valid
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-destructive/10 border-destructive text-destructive"
                }`}>

                  {validationResult.valid
                    ? <CheckCircle className="w-4 h-4" />
                    : <XCircle className="w-4 h-4" />
                  }

                  {validationResult.valid
                    ? "Key Valid & Active"
                    : (validationResult.message || "Invalid Key")
                  }

                </div>

              )}

            </CardContent>

          </Card>

        </div>

      </div>

    </AdminLayout>
  );
}