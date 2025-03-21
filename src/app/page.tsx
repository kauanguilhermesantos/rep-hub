import React from "react";

import Header from "@/components/Header";
import Main from "@/components/Main";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header/>
      <main>
        <Main/>
      </main>
    </div>
  )
}
