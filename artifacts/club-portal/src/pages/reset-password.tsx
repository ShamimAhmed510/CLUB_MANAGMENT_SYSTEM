import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation, Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { LockKeyhole, CheckCircle2, XCircle } from "lucide-react";

const schema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof schema>;

export default function ResetPassword() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token"));
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: FormValues) => {
    if (!token) {
      toast({ title: "Invalid link", description: "No reset token found.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Reset failed");
      setSuccess(true);
      setTimeout(() => setLocation("/login"), 3000);
    } catch (err: any) {
      toast({ title: "Reset failed", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <Layout>
        <div
          className="flex-1 flex items-center justify-center py-12 px-4"
          style={{ background: "linear-gradient(135deg, #1e0b4b 0%, #2e1065 35%, #1e3a8a 70%, #0f2050 100%)" }}
        >
          <div className="w-full max-w-md">
            <div className="glass-card-dark rounded-2xl overflow-hidden shadow-2xl">
              <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #ef4444, #dc2626)" }} />
              <div className="p-8 text-center">
                <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Invalid Reset Link</h2>
                <p className="text-white/60 text-sm mb-6">
                  This link is missing a token. Please request a new one.
                </p>
                <Link href="/forgot-password">
                  <button className="text-violet-400 hover:text-violet-300 text-sm font-semibold transition-colors">
                    Request new link
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div
        className="flex-1 flex items-center justify-center py-12 px-4 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1e0b4b 0%, #2e1065 35%, #1e3a8a 70%, #0f2050 100%)" }}
      >
        <div className="absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />

        <div className="w-full max-w-md relative">
          <div className="glass-card-dark rounded-2xl overflow-hidden shadow-2xl">
            <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #7c3aed, #4f46e5, #2563eb)" }} />

            <div className="p-8">
              {success ? (
                <div className="text-center space-y-4">
                  <CheckCircle2 className="w-14 h-14 text-green-400 mx-auto" />
                  <h2 className="text-2xl font-bold text-white">Password Updated!</h2>
                  <p className="text-white/60 text-sm">
                    Your password has been changed. Redirecting you to login...
                  </p>
                  <Link href="/login">
                    <button className="text-violet-400 hover:text-violet-300 text-sm font-semibold transition-colors">
                      Go to login now
                    </button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <div
                      className="mx-auto mb-4 w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl"
                      style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
                    >
                      <LockKeyhole className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-white mb-1">Reset Password</h1>
                    <p className="text-sm text-white/60">Choose a strong new password</p>
                  </div>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/80 font-medium text-sm">New Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                                <input
                                  type="password"
                                  placeholder="••••••••"
                                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium text-white placeholder:text-white/30 border border-white/15 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 outline-none transition-all duration-200"
                                  style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(4px)" }}
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-400 text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/80 font-medium text-sm">Confirm Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                                <input
                                  type="password"
                                  placeholder="••••••••"
                                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium text-white placeholder:text-white/30 border border-white/15 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 outline-none transition-all duration-200"
                                  style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(4px)" }}
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-red-400 text-xs" />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 rounded-xl text-sm font-bold tracking-wide shadow-lg transition-all duration-200 mt-2"
                        style={{
                          background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                          boxShadow: "0 8px 24px rgba(124, 58, 237, 0.4)",
                        }}
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                            Updating...
                          </span>
                        ) : "Update Password →"}
                      </Button>
                    </form>
                  </Form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
