"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth-client";
import { api } from "@/trpc/react";
import { Badge, CheckSquare, Clock, ListTodo, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { data: session } = auth.useSession();
  const { data: stats, isLoading: statsLoading } = api.tasks.getStats.useQuery();
  const { data: tasks, isLoading: tasksLoading } = api.tasks.list.useQuery();

  const recentTasks = tasks?.slice(0, 5) ?? [];

  const statCards = [
    {
      title: "Total de Tasks",
      value: stats?.total ?? 0,
      icon: ListTodo,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Completadas",
      value: stats?.completed ?? 0,
      icon: CheckSquare,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Pendentes",
      value: stats?.pending ?? 0,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { label: "Pendente", variant: "secondary" as const },
      in_progress: { label: "Em Progresso", variant: "default" as const },
      completed: { label: "Completa", variant: "outline" as const },
    };
    return variants[status as keyof typeof variants] ?? variants.pending;
  };

  return (
    <div className="space-y-8">
      {/* Welcome Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Olá, {session?.user?.name ?? "Usuário"}! 👋
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Bem-vindo ao seu painel de gerenciamento de tasks. Aqui você pode
            visualizar suas estatísticas e acompanhar seu progresso.
          </p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {statsLoading ? (
          <div className="col-span-3 flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </p>
                      <p className="mt-2 text-3xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`rounded-full p-3 ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Recent Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {tasksLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : recentTasks.length === 0 ? (
            <p className="py-8 text-center text-gray-500">
              Nenhuma task cadastrada ainda.
            </p>
          ) : (
            <div className="space-y-4">
              {recentTasks.map((task) => {
                const statusInfo = getStatusBadge(task.status);
                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      {task.description && (
                        <p className="mt-1 text-sm text-gray-600">
                          {task.description.slice(0, 100)}
                          {task.description.length > 100 ? "..." : ""}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-gray-500">
                        Criada em{" "}
                        {new Date(task.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <Badge variant={statusInfo.variant} className="ml-4">
                      {statusInfo.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
