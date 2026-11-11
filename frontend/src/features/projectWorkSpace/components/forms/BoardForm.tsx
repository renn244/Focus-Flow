import { useForm } from "react-hook-form"
import { z } from "zod"
import type { BoardSchema } from "../../type"
import { zodResolver } from "@hookform/resolvers/zod"
import { handleNestError, ValidationError } from "@/lib/handleNestError"
import { toast } from "sonner"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import LoadingSpinner from "@/components/ui/loadingSpinner"
import { Textarea } from "@/components/ui/textarea"

export const BoardFormSchema = z.object({
    name: z.string().min(1, "Board name is required"),
    description: z.string()
        .min(10, "Description must be at least 10 characters long")
        .max(200, "Description must be at most 200 characters long")
        .optional(),
    projectId: z.string().min(1, "Project ID is required"),
})

type BoardFormProps = {
    onsubmit: (data: BoardSchema) => Promise<unknown>;
    isLoading: boolean;
    className?: string;
    projectId?: string;
    initialData?: BoardSchema;
    isUpdate?: boolean;
}

const BoardForm = ({
    onsubmit, isLoading,
    className = "", initialData, projectId,
    isUpdate = false
}: BoardFormProps) => {
    const form = useForm<BoardSchema>({
        resolver: zodResolver(BoardFormSchema),
        defaultValues: {
            name: initialData?.name || "",
            description: initialData?.description || "",
            projectId: initialData?.projectId || projectId || "",
        }
    })
    const buttonText = isUpdate ? "Update Board" : "Create Board";

    const onSubmit = async (data: BoardSchema) => {
        try {
            await onsubmit(data);
        } catch (error: unknown) {
            if(error instanceof ValidationError) {
                handleNestError(error.response, form.setError);
            } else {
                toast.error((error instanceof Error && error.message) || "An error occured while createing the board");
            }
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-4", className)}>
                <FormField 
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Board Name</FormLabel>
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
                            <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />

                <FormField 
                control={form.control}
                name="projectId"
                render={() => (
                    <FormItem>
                        <FormMessage />
                    </FormItem>
                )}
                />

                <Button disabled={isLoading} type="submit">
                    {isLoading ? <LoadingSpinner /> : buttonText}
                </Button>
            </form>
        </Form>
    )
}

export default BoardForm;