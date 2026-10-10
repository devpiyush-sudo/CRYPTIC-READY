import { useClerk } from "@clerk/react";
import { Button } from "@heroui/react";
import { ArrowRightIcon, ShieldCheckIcon } from "lucide-react";
import { APP_NAME, AppLogo } from "../AppLogo";
import { AuthCardShell } from "./AuthCardShell";

const AFTER_AUTH = "/";

export function AuthActionPanel() {
  const clerk = useClerk();

  return (
    <section className="relative flex flex-1 flex-col items-stretch justify-center overflow-hidden px-5 py-12 sm:px-10 md:px-14 md:py-10 lg:px-16">
      <AuthCardShell>
        <div className="mb-8 flex flex-col items-center text-center">
          <AppLogo size={60} className="mb-4 rounded-2xl shadow-lg" alt="" />
          <h1 className="text-xl font-semibold tracking-tight">Welcome to {APP_NAME}</h1>
          <p className="mt-1 text-sm text-muted">Sign in to start chatting.</p>
        </div>

        <Button
          fullWidth
          size="lg"
          variant="primary"
          className="group h-13 rounded-2xl text-[15px] font-semibold shadow-xl shadow-accent/35"
          onPress={() => clerk.openSignIn({ fallbackRedirectUrl: AFTER_AUTH, forceRedirectUrl: AFTER_AUTH })}
        >
          <span className="flex items-center justify-center gap-2">
            Continue
            <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </Button>

        <div className="mt-8 flex items-center justify-center gap-2 border-t border-black/6 pt-6 text-[11px] text-[#8E8E93] dark:border-white/8 dark:text-[#636366]">
          <ShieldCheckIcon className="size-3.5 shrink-0 text-[#34C759] dark:text-[#30D158]" strokeWidth={2} aria-hidden />
          <span>Secure sign-in powered by Clerk</span>
        </div>
      </AuthCardShell>
    </section>
  );
}
