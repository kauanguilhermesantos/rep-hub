import { Button } from "@/components/ui/button"

export default function Header() {
    return (
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-22 py-10">
          <span>RepHub</span>
          <div className="flex items-center gap-2 py-8">
            <Button variant={"ghost"}>Entrar</Button>
            <Button>Registrar</Button>
          </div>
        </div>
      </header>
    )
  }
