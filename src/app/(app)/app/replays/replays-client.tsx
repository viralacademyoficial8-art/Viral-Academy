"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Play, Clock, User, Calendar, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Replay {
  id: string;
  title: string;
  description: string | null;
  type: string;
  mentor: {
    name: string;
    avatar: string | null | undefined;
  };
  videoUrl: string;
  duration: number | null;
  thumbnail: string | null;
  recordedAt: string;
}

interface ReplaysClientProps {
  replays: Replay[];
}

const LIVE_TYPES: Record<string, { label: string; color: string }> = {
  MINDSET: { label: "Mentalidad", color: "bg-purple-500/10 text-purple-500" },
  MARKETING: { label: "Marketing", color: "bg-primary/10 text-primary" },
  SPECIAL: { label: "Especial", color: "bg-accent/10 text-accent" },
};

export function ReplaysClient({ replays }: ReplaysClientProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedType, setSelectedType] = React.useState<string | null>(null);

  const filteredReplays = replays.filter((replay) => {
    const matchesSearch = replay.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || replay.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold">Replays</h1>
        <p className="text-muted-foreground">
          Revive las sesiones en vivo que te perdiste.
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar replays..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedType === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType(null)}
          >
            Todos
          </Button>
          {Object.entries(LIVE_TYPES).map(([key, { label }]) => (
            <Button
              key={key}
              variant={selectedType === key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(selectedType === key ? null : key)}
            >
              {label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Replays Grid */}
      {filteredReplays.length === 0 ? (
        <div className="text-center py-12">
          <Play className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No se encontraron replays.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReplays.map((replay, index) => {
            const typeInfo = LIVE_TYPES[replay.type] || LIVE_TYPES.SPECIAL;
            const date = new Date(replay.recordedAt);

            return (
              <motion.div
                key={replay.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <a href={replay.videoUrl} target="_blank" rel="noopener noreferrer">
                  <Card className="overflow-hidden group cursor-pointer">
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 relative flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-6 h-6 text-primary ml-1" />
                        </div>
                      </div>
                      {replay.duration && (
                        <Badge className="absolute bottom-3 right-3 bg-black/80">
                          {replay.duration} min
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-5 space-y-3">
                      <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                      <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                        {replay.title}
                      </h3>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{replay.mentor.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{format(date, "d MMM yyyy", { locale: es })}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
