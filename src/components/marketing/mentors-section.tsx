"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";

export function MentorsSection() {
  return (
    <section className="section-padding">
      <div className="container-wide">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4">Mentores</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Aprende de expertos que{" "}
            <span className="gradient-text">sí ejecutan</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Nuestros mentores no solo enseñan teoría. Han construido negocios,
            alcanzado millones de personas y transformado empresas.
          </p>
        </motion.div>

        {/* Mentors Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {siteConfig.mentors.map((mentor, index) => (
            <motion.div
              key={mentor.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
            >
              <Card hover className="h-full overflow-hidden">
                {/* Image placeholder */}
                <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-primary/5 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full bg-surface-2 flex items-center justify-center text-4xl font-bold text-muted-foreground">
                      {mentor.name.split(" ").map(n => n[0]).join("")}
                    </div>
                  </div>
                  {/* Live day badge */}
                  <div className="absolute top-4 right-4">
                    <Badge variant="mentor">
                      {mentor.liveDay === "Lunes" ? "Lunes Sublimes" : "Miércoles Virales"}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-1">{mentor.name}</h3>
                  <p className="text-sm text-primary mb-4">{mentor.role}</p>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {mentor.bio}
                  </p>
                  {/* Specialties */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {mentor.specialties.slice(0, 4).map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="ghost" className="p-0 h-auto" asChild>
                    <Link href={`/mentores#${mentor.id}`}>
                      Ver más <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
