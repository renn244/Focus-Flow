import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import LoadingSpinner from "@/components/ui/loadingSpinner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import type { ProjectSchema } from "../../type"
import { handleNestError, ValidationError } from "@/lib/handleNestError"
import { colorOptions } from "../../constants/ProjectColorVariants"

export const ProjectFormSchema = z.object({
    name: z.string().min(1, "Project name is required"),
    description: z.string()
        .min(10, "Description must be at least 10 characters")
        .max(300, "Description must be at most 300 characters")
        .optional(),
    priority: z.enum(["low", "medium", "high"]),
    dueDate: z.date(),
    color: z.string().min(1, "Color is required"),
})

type ProjectFormProps = {
    onsubmit: (data: ProjectSchema) => Promise<unknown>;
    isLoading: boolean;
    className?: string;
    initialData?: ProjectSchema;
    isUpdate?: boolean; 
}

const ProjectForm = ({
    onsubmit, className = "", isLoading,
    initialData,  isUpdate = false
}: ProjectFormProps) => {
    const form = useForm<ProjectSchema>({
        resolver: zodResolver(ProjectFormSchema),
        defaultValues: {
            name: initialData?.name || "", 
            description: initialData?.description ||"",
            priority: initialData?.priority || undefined, 
            dueDate: initialData?.dueDate ? initialData.dueDate : undefined,
            color: initialData?.color || "", 
        },
    })
    const buttonText = isUpdate ? "Update Project" : "Create Project";

    const onSubmit = async (data: ProjectSchema) => {
        try {
            await onsubmit(data);
        } catch (error: unknown) {
            if(error instanceof ValidationError) {
                handleNestError(error.response, form.setError);
            } else {
                toast.error((error instanceof Error && error.message) || "An error occurred while creating the project");
            }
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-4", className)}>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-4">
                        <FormField 
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Project Name</FormLabel>
                                <FormControl>
                                    <Input {...field} />
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
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea {...field} className="max-h-[236px]" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />

                        <FormField  
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Priority</FormLabel>
                                <FormControl>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Priority" />
                                        </SelectTrigger>
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
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />                            
                    </div>

                    <div className="space-y-4">
                        <FormField 
                        control={form.control}
                        name="dueDate"
                        render={() => (
                            <FormItem>
                                <FormLabel>Due Date</FormLabel>
                                <FormControl>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                            variant="outline"
                                            className={
                                                `w-full justify-start text-left font-normal
                                                ${form.formState.errors.dueDate ? "border-red-500" : ""}
                                                ${!form.watch('dueDate') && "text-muted-foreground"}`
                                            }
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {form.watch('dueDate') ? format(form.watch('dueDate'), "PPP") : "Pick a date"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                            disabled={(date) => date < new Date()}
                                            selected={form.watch('dueDate')}
                                            onSelect={(date) => {
                                                form.setValue('dueDate', date || new Date());
                                                form.clearErrors('dueDate');
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

                        <FormField 
                        control={form.control}
                        name="color"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Project Color</FormLabel>
                                <FormControl>
                                     <div className="grid grid-cols-2 gap-2">
                                        {colorOptions.map((color) => (
                                            <button
                                            key={color.value}
                                            type="button"
                                            onClick={() => field.onChange(color.value)}
                                            className={`p-3 rounded-lg border-2 transition-all ${
                                                form.watch('color') === color.value
                                                ? "border-gray-400 ring-2 ring-blue-500"
                                                : "border-gray-200 hover:border-gray-300"
                                            }`}
                                            >
                                                <div className={`w-full h-6 rounded ${color.class}`}></div>
                                                <p className="text-xs mt-1 text-gray-600">{color.label}</p>
                                            </button>
                                        ))}
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                </div>
                <Button disabled={isLoading} type="submit" className="min-w-[127.5px]">
                    {isLoading ? <LoadingSpinner /> : buttonText}
                </Button>
            </form>
        </Form>
    )
}

export default ProjectForm
