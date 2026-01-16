"use client";

import { Card } from "@/components/ui/card";
import { Cpu, Globe, Code, Handshake } from "lucide-react";

export function Features() {
  const features = [
    {
      title: "Zero Gas Fees",
      desc: "Leveraging ERC-4337 Account Abstraction, we sponsor all gas fees via a Paymaster. Users pay $0 to start.",
      icon: <Cpu className="w-6 h-6 text-mint-400" />,
    },
    {
      title: "Real-Time Settlement",
      desc: "State channels allow for pay-per-second granularity. Close the tab, the payment stops instantly.",
      icon: <Handshake className="w-6 h-6 text-mint-400" />,
    },
    {
      title: "Universal Access",
      desc: "Built on Polygon & Base for sub-cent fees. Compatible with any EVM wallet or social login.",
      icon: <Globe className="w-6 h-6 text-mint-400" />,
    },
    {
      title: "Creator Control",
      desc: "5 lines of code to integrate. Set your rate, withdraw earnings instantly. No platform lock-in.",
      icon: <Code className="w-6 h-6 text-mint-400" />,
    },
  ];

  return (
    <section
      id="features"
      className="py-24 bg-zinc-950 border-t border-zinc-900"
    >
      <div className="container mx-auto px-6">
        <div className="mb-16 md:mb-24">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            The Micro-Economy <br />
            <span className="text-zinc-600">Infrastructure.</span>
          </h2>
          <div className="h-1 w-20 bg-mint-400 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <Card
              key={i}
              className="group hover:border-mint-500/30 transition-colors duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-zinc-800/50 flex items-center justify-center mb-6 group-hover:bg-mint-500/10 transition-colors">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
