"use client";

import { motion } from "framer-motion";
import { Video, Calendar, Clock, User, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Live {
  id: string;
  title: string;
  description: string | null;
  type: string;
  mentor: {
    name: string;
    avatar: string | null | undefined;
  };
  scheduledAt: string;
  duration: number | null;
  meetingUrl: string | null;
  thumbnail: string | null;
}

interface LivesClientProps {
  upcomingLives: Live[];
  pastLives: Live[];
}

const LIVE_TYPES: Record<string, { label: string; color: string }> = {
  MINDSET: { label: "Mentalidad", color: "bg-purple-500/10 text-purple-500" },
  MARKETING: { label: "Marketing", color: "bg-primary/10 text-primary" },
  SPECIAL: { label: "Especial", color: "bg-accent/10 text-accent" },
};

function LiveCard({ live, isUpcoming }: { live: Live; isUpcoming: boolean }) {
  const date = new Date(live.scheduledAt);
  const typeInfo = LIVE_TYPES[live.type] || LIVE_TYPES.SPECIAL;

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 relative flex items-center justify-center">
        <Video className="w-16 h-16 text-primary/30" />
        {isUpcoming && (
          <Badge className="absolute top-3 left-3 bg-green-500">Próximo</Badge>
        )}
      </div>
      <CardContent className="p-5 space-y-4">
        <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
        <h3 className="font-semibold text-lg line-clamp-2">{live.title}</h3>
        {live.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{live.description}</p>
        )}
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{live.mentor.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{format(date, "EEEE d 'de' MMMM, yyyy", { locale: es })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{format(date, "h:mm a")} {live.duration && `· ${live.duration} min`}</span>
          </div>
        </div>
        {isUpcoming && live.meetingUrl && (
          <Button className="w-full" asChild>
            <a href={live.meetingUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Unirse a la sesión
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function LivesClient({ upcomingLives, pastLives }: LivesClientProps) {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold">Sesiones en Vivo</h1>
        <p className="text-muted-foreground">
          Aprende en tiempo real con nuestros mentores cada semana.
        </p>
      </motion.div>

      {/* Schedule Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid sm:grid-cols-2 gap-4"
      >
        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Video className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="font-semibold">Lunes Sublimes</p>
                <p className="text-sm text-muted-foreground">Mentalidad · 7:00 PM</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Video className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Miércoles Virales</p>
                <p className="text-sm text-muted-foreground">Marketing & IA · 7:00 PM</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming">Próximas ({upcomingLives.length})</TabsTrigger>
          <TabsTrigger value="past">Pasadas ({pastLives.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcomingLives.length === 0 ? (
            <div className="text-center py-12">
              <Video className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No hay sesiones programadas próximamente.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingLives.map((live, index) => (
                <motion.div
                  key={live.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <LiveCard live={live} isUpcoming />
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {pastLives.length === 0 ? (
            <div className="text-center py-12">
              <Video className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No hay sesiones pasadas.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastLives.map((live, index) => (
                <motion.div
                  key={live.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <LiveCard live={live} isUpcoming={false} />
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
