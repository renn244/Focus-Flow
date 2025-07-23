import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Task, TaskSchema } from "../../type";
import { handleNestError, ValidationError } from "@/lib/handleNestError";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { InputTags } from "@/components/ui/input-tags";
import { Badge } from "@/components/ui/badge";
import useTaskDialogStore from "../../store/useTaskDialog";

// later add assignee as well as 
export const TaskFormSchema = z.object({
    title: z.string().min(1, "Task title is required"),
    description: z.string()
        .min(10, "Description must be at least 10 characters long")
        .max(300, "Description must be at most 300 characters long")
        .optional(),
    dueDate: z.date().optional(),
    priority: z.enum(["low", "medium", "high"]).default("medium"),
    columnId: z.string().min(1, "Column ID is required"),
    boardId: z.string().min(1, "Board ID is required"),
    tags: z.array(z.string()).optional(),
})

const commonTags = ["Frontend", "Backend", "Design", "UI/UX", "API", "Database"]

type TaskFormProps = {
    onsubmit: (data: TaskSchema) => Promise<Task>;
    isLoading: boolean;
    isUpdate?: boolean;
    className?: string;
    initialData?: TaskSchema;
    columnId?: string;
    boardId?: string;
}

const TaskForm = ({
    onsubmit, isLoading, isUpdate,
    className, initialData,
    columnId, boardId,
}: TaskFormProps) => {
    const setCreateOpen = useTaskDialogStore((state) => state.setCreateOpen);
    const form = useForm({
        resolver: zodResolver(TaskFormSchema),
        defaultValues: {
            title: initialData?.title || "", 
            description: initialData?.description || "", 
            dueDate: initialData?.dueDate || undefined,
            priority: initialData?.priority || "medium", 
            columnId: columnId || initialData?.columnId || "",
            boardId: boardId || initialData?.boardId || "", 
            tags: initialData?.tags || [],
        }
    })
    const buttonText = isUpdate ? "Update Task" : "Create Task";

    const onSubmit = async (data: TaskSchema) => {
        try {
            await onsubmit(data);
        } catch(error: any | ValidationError) {
            if(error instanceof ValidationError) {
                handleNestError(error.response, form.setError);
            } else {
                toast.error(error.message || "An error occurred while creating the task");
            }
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-4", className)}>

                <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-sm font-medium">Task Title</FormLabel>
                        <FormControl>
                            <Input placeholder="Enter task title..." {...field} className="text-sm" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-sm font-medium">Description</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="Describe the task in detail..."
                            className="min-h-[100px] text-sm resize-none"
                            {...field}
                            />
                        </FormControl>
                        <FormDescription className="text-xs">
                            {field.value?.length || 0}/300 characters
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium">Priority</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="low">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            Low Priority
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="medium">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                            Medium Priority
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="high">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                            High Priority
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="dueDate"
                        render={() => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium">Due Date</FormLabel>
                            <FormControl>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                        variant="outline"
                                        className={
                                            `w-full justify-start text-left font-normal
                                            ${form.formState.errors.dueDate ? "text-muted-foreground" : ""}
                                            ${!form.watch('dueDate') && "text-muted-foreground"}`
                                        }
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {form.watch("dueDate") ? format(new Date(form.watch("dueDate")!), "PPP") : "Pick a date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <Calendar 
                                        disabled={(date) => date < new Date()}
                                        selected={form.watch("dueDate") ? new Date(form.watch("dueDate")!) : undefined}
                                        onSelect={(date) => {
                                            form.setValue("dueDate", date || new Date());
                                            form.clearErrors("dueDate");
                                        }}
                                        mode="single"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>

                <FormField 
                control={form.control}
                name="tags"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                            <InputTags value={field.value || []} onChange={field.onChange} />
                        </FormControl>
                        <div className="flex flex-1 gap-0.75">
                            {commonTags
                            .filter(tag => !field.value?.includes(tag))
                            .map((tag) => (
                                <Badge className="cursor-pointer" 
                                onClick={() => field.onChange([...(field.value || []), tag])} key={tag}>
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
                />

                <DialogFooter className="gap-2">
                    <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading} className="min-w-[100px]">
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            buttonText
                        )}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    )
}

export default TaskForm;