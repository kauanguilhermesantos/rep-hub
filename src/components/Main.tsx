import { ArrowRight, BarChart, Briefcase, Package, ShoppingCart, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

export default function Main() {
    return (
        // -screen h-screen flex items-center justify-center
        <section className="py-20 px-20 md:py-28 bg-gradient-to-b from-muted/50 to-background ">
          <div className=" flex flex-col md:flex-row items-center gap-8 md:gap-16 ">
            <div className="flex-1 space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Gerencie suas representações comerciais com eficiência
              </h1>
              <p className="text-2xl text-muted-foreground">
                Plataforma completa para representantes comerciais gerenciarem pedidos, clientes e marcas em um só
                lugar.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 ">
                {/* <Link href="/login-page?tab=register"> */}
                  <Button size="default" className="w-full sm:w-auto">
                    Começar agora
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                {/* </Link> */}
                {/* <Link href="#recursos"> */}
                  <Button size="default" variant="outline" className="w-full sm:w-auto">
                    Ver recursos
                  </Button>
                {/* </Link> */}
              </div>
            </div>
            <div className="flex-1 flex justify-center ">
              <div className="w-full max-w-md aspect-video bg-gradient-to-br from-primary/20 to-secondary/40 rounded-lg shadow-lg flex items-center justify-center">
                <div className="bg-background/90 backdrop-blur-sm p-6 rounded-md shadow-sm ">
                  <div className="flex items-center gap-3 mb-4">
                    <Briefcase className="h-8 w-8 text-primary" />
                    <span className="font-bold text-xl">Dashboard</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/50 p-3 rounded-md flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">Pedidos</span>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-md flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">Clientes</span>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-md flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">Marcas</span>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-md flex items-center gap-2">
                      <BarChart className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">Relatórios</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
    )
}