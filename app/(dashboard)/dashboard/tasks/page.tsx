"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { CreateTaskInput, createTaskSchema } from "@/lib/validations";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@radix-ui/react-select";
import { Task } from "better-auth/react";
import { Plus, Loader2, Badge, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";



export default function TasksPage() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const utils = api.useUtils();
  const { data: tasks, isLoading } = api.tasks.list.useQuery();

  const createMutation = api.tasks.create.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
      utils.tasks.getStats.invalidate();
      toast({
        title: "Task criada!",
        description: "Sua task foi criada com sucesso.",
      });
      setIsCreateOpen(false);
      createForm.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao criar task",
        description: error.message,
      });
    },
  });

  const updateMutation = api.tasks.update.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
      utils.tasks.getStats.invalidate();
      toast({
        title: "Task atualizada!",
        description: "Suas alterações foram salvas.",
      });
      setIsEditOpen(false);
      setSelectedTask(null);
      editForm.reset();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar task",
        description: error.message,
      });
    },
  });

  const deleteMutation = api.tasks.delete.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
      utils.tasks.getStats.invalidate();
      toast({
        title: "Task excluída!",
        description: "A task foi removida com sucesso.",
      });
      setIsDeleteOpen(false);
      setSelectedTask(null);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao excluir task",
        description: error.message,
      });
    },
  });

  const createForm = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "pending",
    },
  });

  const editForm = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
  });

  const onCreateSubmit = (data: CreateTaskInput) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: CreateTaskInput) => {
    if (!selectedTask) return;
    updateMutation.mutate({
      id: selectedTask.id,
      ...data,
    });
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    editForm.reset({
      title: task.title,
      description: task.description ?? "",
      status: task.status,
    });
    setIsEditOpen(true);
  };

  const handleDelete = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedTask) return;
    deleteMutation.mutate({ id: selectedTask.id });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { label: "Pendente", variant: "secondary" as const },
      in_progress: { label: "Em Progresso", variant: "default" as const },
      completed: { label: "Completa", variant: "outline" as const },
    };
    return variants[status as keyof typeof variants] ?? variants.pending;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Minhas Tasks</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Task
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : tasks && tasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              Você ainda não tem nenhuma task. Crie sua primeira task para começar!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks?.map((task) => {
            const statusInfo = getStatusBadge(task.status);
            return (
              <Card key={task.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {task.description && (
                    <p className="mb-4 text-sm text-gray-600">{task.description}</p>
                  )}
                  <div className="mb-4 text-xs text-gray-500">
                    Criada em {new Date(task.createdAt).toLocaleDateString("pt-BR")}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(task)}
                      className="flex-1"
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(task)}
                      className="flex-1"
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Nova Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-title">Título</Label>
              <Input
                id="create-title"
                placeholder="Digite o título da task"
                {...createForm.register("title")}
              />
              {createForm.formState.errors.title && (
                <p className="text-sm text-destructive">
                  {createForm.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-description">Descrição</Label>
              <textarea
                id="create-description"
                placeholder="Descreva sua task (opcional)"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...createForm.register("description")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-status">Status</Label>
              <Select
                value={createForm.watch("status")}
                onValueChange={(value) =>
                  createForm.setValue("status", value as "pending" | "in_progress" | "completed")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="in_progress">Em Progresso</SelectItem>
                  <SelectItem value="completed">Completa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1"
              >
                {createMutation.isPending ? "Criando..." : "Criar Task"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Título</Label>
              <Input
                id="edit-title"
                placeholder="Digite o título da task"
                {...editForm.register("title")}
              />
              {editForm.formState.errors.title && (
                <p className="text-sm text-destructive">
                  {editForm.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <textarea
                id="edit-description"
                placeholder="Descreva sua task (opcional)"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...editForm.register("description")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={editForm.watch("status")}
                onValueChange={(value) =>
                  editForm.setValue("status", value as "pending" | "in_progress" | "completed")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="in_progress">Em Progresso</SelectItem>
                  <SelectItem value="completed">Completa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1"
              >
                {updateMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Tem certeza que deseja excluir a task "{selectedTask?.title}"? Esta ação não pode ser desfeita.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="flex-1"
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
