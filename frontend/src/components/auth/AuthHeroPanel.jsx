import { APP_NAME } from "../AppLogo";

const heroPanelClassName = [
  "relative flex min-h-[min(280px,38vh)] shrink-0 flex-col overflow-hidden",
  "bg-[#E8E8ED] dark:bg-black",
  "md:w-[44%] md:max-w-xl md:border-r md:border-black/10 dark:md:border-white/10",
  "lg:w-[42%] lg:max-w-none",
].join(" ");

function Bubble({ me = false, children, className = "" }) {
  return (
    <div
      className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-[14px] shadow-sm ${
        me ? "self-end rounded-br-md bg-accent text-accent-foreground" : "self-start rounded-bl-md bg-surface"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function AuthHeroPanel() {
  return (
    <section className={heroPanelClassName}>
      <div className="relative z-1 flex flex-1 flex-col px-6 pb-6 pt-8 md:px-8 md:pb-8 md:pt-10">
        <div className="text-center md:text-left">
          <p className="mb-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-500 dark:text-[#636366]">
            Real-time messaging
          </p>
          <h2 className="text-balance font-mono text-[1.15rem] font-semibold uppercase leading-snug tracking-[0.06em] text-zinc-900 dark:text-white sm:text-[1.25rem]">
            Open {APP_NAME}
          </h2>
          <p className="mx-auto mt-2.5 max-w-88 text-pretty font-mono text-[11px] font-medium leading-relaxed tracking-wide text-zinc-600 dark:text-[#98989D] md:mx-0 md:max-w-none">
            Chats, photos and videos arrive instantly. Sign in on the right to continue.
          </p>
        </div>

        <div className="flex flex-1 items-center justify-center py-6 md:py-4" aria-hidden>
          <div className="flex w-full max-w-72 flex-col gap-2.5 motion-safe:animate-[auth-float-y_4.5s_ease-in-out_infinite]">
            <Bubble>Hey! Are you online?</Bubble>
            <Bubble me>Always 👋</Bubble>
            <Bubble>Send me the photos</Bubble>
            <Bubble me>On their way 📸</Bubble>
          </div>
        </div>
      </div>
    </section>
  );
}
