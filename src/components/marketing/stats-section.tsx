"use client";

import { motion } from "framer-motion";
import { Users, Eye, DollarSign, Building2 } from "lucide-react";
import { siteConfig } from "@/config/site";

const statsData = [
  {
    icon: Users,
    value: siteConfig.stats.students,
    label: "alumnos formados",
  },
  {
    icon: Eye,
    value: siteConfig.stats.reach,
    label: "de personas alcanzadas",
  },
  {
    icon: DollarSign,
    value: siteConfig.stats.adSpend,
    label: "gestionados en ads",
  },
  {
    icon: Building2,
    value: siteConfig.stats.enterprises,
    label: "empresas capacitadas",
  },
];

export function StatsSection() {
  return (
    <section className="py-16 md:py-20 border-y border-border bg-surface-1/50">
      <div className="container-wide">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center text-muted-foreground mt-8 text-sm"
        >
          Resultados reales. Experiencia comprobada. Educación que sí se ejecuta.
        </motion.p>
      </div>
    </section>
  );
}
