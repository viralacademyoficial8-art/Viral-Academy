"use client";

import {
  Users,
  CreditCard,
  TrendingUp,
  TrendingDown,
  BarChart3,
  DollarSign,
  GraduationCap,
  Target,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AnalyticsData {
  usersByDay: Array<{ date: string; count: number }>;
  subscriptionsByDay: Array<{ date: string; count: number }>;
  enrollmentsByDay: Array<{ date: string; count: number }>;
  topCourses: Array<{
    id: string;
    title: string;
    enrollments: number;
    mentor: string;
  }>;
  metrics: {
    currentUsers: number;
    previousUsers: number;
    userGrowth: number;
    currentSubscriptions: number;
    previousSubscriptions: number;
    subscriptionGrowth: number;
    mrr: number;
    completionRate: number;
    churnedSubscriptions: number;
    churnRate: number;
  };
}

interface AnalyticsClientProps {
  data: AnalyticsData;
}

function SimpleBarChart({
  data,
  label,
}: {
  data: Array<{ date: string; count: number }>;
  label: string;
}) {
  const maxValue = Math.max(...data.map((d) => d.count), 1);
  const total = data.reduce((acc, d) => acc + d.count, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-medium">{total} total</span>
      </div>
      <div className="flex items-end gap-1 h-32">
        {data.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Sin datos
          </div>
        ) : (
          data.map((d, i) => (
            <div
              key={i}
              className="flex-1 bg-primary/80 hover:bg-primary rounded-t transition-colors cursor-pointer group relative"
              style={{ height: `${(d.count / maxValue) * 100}%`, minHeight: d.count > 0 ? "4px" : "0" }}
              title={`${d.date}: ${d.count}`}
            >
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {d.count}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Hace 30 días</span>
        <span>Hoy</span>
      </div>
    </div>
  );
}

export function AnalyticsClient({ data }: AnalyticsClientProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Métricas y rendimiento de los últimos 30 días
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nuevos Usuarios
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.metrics.currentUsers}</div>
            <div className="flex items-center text-xs">
              {data.metrics.userGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span
                className={
                  data.metrics.userGrowth >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }
              >
                {formatPercentage(data.metrics.userGrowth)}
              </span>
              <span className="text-muted-foreground ml-1">vs periodo anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nuevas Suscripciones
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.metrics.currentSubscriptions}
            </div>
            <div className="flex items-center text-xs">
              {data.metrics.subscriptionGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span
                className={
                  data.metrics.subscriptionGrowth >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }
              >
                {formatPercentage(data.metrics.subscriptionGrowth)}
              </span>
              <span className="text-muted-foreground ml-1">vs periodo anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.metrics.mrr)}
            </div>
            <p className="text-xs text-muted-foreground">
              Ingresos recurrentes mensuales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.metrics.churnRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {data.metrics.churnedSubscriptions} cancelaciones
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Registros de Usuarios
            </CardTitle>
            <CardDescription>Últimos 30 días</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={data.usersByDay} label="Nuevos usuarios por día" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Nuevas Suscripciones
            </CardTitle>
            <CardDescription>Últimos 30 días</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart
              data={data.subscriptionsByDay}
              label="Suscripciones por día"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Inscripciones a Cursos
            </CardTitle>
            <CardDescription>Últimos 30 días</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart
              data={data.enrollmentsByDay}
              label="Inscripciones por día"
            />
          </CardContent>
        </Card>
      </div>

      {/* Top Courses & Completion Rate */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cursos Más Populares</CardTitle>
            <CardDescription>Por número de inscripciones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topCourses.map((course, index) => (
                <div key={course.id} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{course.title}</p>
                    <p className="text-sm text-muted-foreground">
                      por {course.mentor}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{course.enrollments}</p>
                    <p className="text-xs text-muted-foreground">inscritos</p>
                  </div>
                </div>
              ))}

              {data.topCourses.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay datos de cursos
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tasa de Finalización</CardTitle>
            <CardDescription>Lecciones completadas vs iniciadas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary">
                {data.metrics.completionRate.toFixed(0)}%
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                de lecciones iniciadas son completadas
              </p>
            </div>

            <Progress value={data.metrics.completionRate} className="h-3" />

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Meta: 70%</p>
                <p className="text-xs text-muted-foreground">
                  Tasa de finalización objetivo
                </p>
              </div>
              <div>
                <Target className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">
                  {data.metrics.completionRate >= 70 ? "En meta" : "Por mejorar"}
                </p>
                <p className="text-xs text-muted-foreground">Estado actual</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
