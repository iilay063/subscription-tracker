import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-12 border-t py-6 text-center text-xs text-muted-foreground">
      <div className="container flex flex-col items-center justify-center gap-2 sm:flex-row">
        <span>
          Built by{" "}
          <span className="font-medium text-foreground">Ilay Weizman</span>{" "}
          (
          <a
            href="https://github.com/iilay063"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            @iilay063
          </a>
          )
        </span>
        <span className="hidden sm:inline opacity-50">·</span>
        <a
          href="https://github.com/iilay063/subscription-tracker"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:text-foreground"
        >
          <Github className="h-3.5 w-3.5" />
          Source
        </a>
      </div>
    </footer>
  );
}
