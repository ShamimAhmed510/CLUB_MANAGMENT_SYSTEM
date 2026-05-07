import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPassword() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Request failed");
      }

      const body = await res.json();

      if (body._devResetLink) {
        toast({
          title: "Dev mode — email not sent",
          description: `Reset link: ${body._devResetLink}`,
        });
      }

      setSubmitted(true);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message ?? "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div
        className="flex-1 flex items-center justify-center py-12 px-4 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1e0b4b 0%, #2e1065 35%, #1e3a8a 70%, #0f2050 100%)" }}
      >
        <div className="absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }} />
        <div className="absolute bottom-[-60px] right-[-60px] w-72 h-72 rounded-full opacity-15 blur-3xl" style={{ background: "radial-gradient(circle, #2563eb, transparent)" }} />

        <div className="w-full max-w-md relative">
          <div className="glass-card-dark rounded-2xl overflow-hidden shadow-2xl">
            <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg, #7c3aed, #4f46e5, #2563eb)" }} />

            <div className="p-8">
              <div className="text-center mb-8">
                <div
                  className="mx-auto mb-4 w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
                >
                  <Mail className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-3xl font-serif font-bold text-white mb-1">Forgot Password</h1>
                <p className="text-sm text-white/60">
                  Enter your email and we'll send you a reset link
                </p>
              </div>

              {submitted ? (
                <div className="text-center space-y-4">
                  <div className="rounded-xl p-4 border border-green-500/30" style={{ background: "rgba(16,185,129,0.1)" }}>
                    <p className="text-green-300 text-sm font-medium">
                      If an account exists with that email, you'll receive a password reset link shortly.
                    </p>
                  </div>
                  <Link href="/login">
                    <button className="flex items-center gap-2 mx-auto text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors">
                      <ArrowLeft className="w-4 h-4" /> Back to login
                    </button>
                  </Link>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80 font-medium text-sm">Email address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                              <input
                                type="email"
                                placeholder="you@mu.edu"
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
                          Sending...
                        </span>
                      ) : "Send Reset Link →"}
                    </Button>

                    <div className="text-center">
                      <Link href="/login">
                        <button type="button" className="flex items-center gap-2 mx-auto text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors">
                          <ArrowLeft className="w-4 h-4" /> Back to login
                        </button>
                      </Link>
                    </div>
                  </form>
                </Form>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
