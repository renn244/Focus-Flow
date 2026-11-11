import { useForm } from "react-hook-form"
import { z } from "zod"
import type { ColumnSchema } from "../../type"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { handleNestError, ValidationError } from "@/lib/handleNestError"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import LoadingSpinner from "@/components/ui/loadingSpinner"
import { ColorPicker, ColorPickerAlpha, ColorPickerEyeDropper, ColorPickerFormat, ColorPickerHue, ColorPickerOutput, ColorPickerSelection, ColorPickerShowcase } from "@/components/ui/shadcn-io/color-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Color from "color"

export const columnFormSchema = z.object({
    title: z.string().min(1, "Title is required"),
    color: z.string().min(1, "Color is required"),
    boardId: z.string().optional(),
})

type ColumnFormProps = {
    onsubmit: (data: ColumnSchema) => Promise<unknown>;
    isLoading: boolean;
    className?: string;
    boardId?: string;
    initialData?: ColumnSchema;
    isUpdate?: boolean;
}

const ColumnForm = ({
    onsubmit, isLoading,
    className, initialData, boardId,
    isUpdate = false
}: ColumnFormProps) => {
    const form = useForm<ColumnSchema>({
        resolver: zodResolver(columnFormSchema),
        defaultValues: {
            title: initialData?.title || "",
            color: initialData?.color || "",
            boardId: initialData?.boardId || boardId || "",
        }
    })
    const buttonText = isUpdate ? "Update Column" : "Create Column";

    const onSubmit = async (data: ColumnSchema) => {
        try {
            if(!isUpdate && !data.boardId) {
                form.setError("boardId", {
                    type: "manual",
                    message: "boardId is required"
                })
            }

            await onsubmit(data);
        } catch (error: unknown) {
            if (error instanceof ValidationError) {
                handleNestError(error.response, form.setError);
            } else {
                toast.error((error instanceof Error && error.message) || "An error occurred while creating the column");
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
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                            <Input {...field} />
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
                        <FormLabel>Color</FormLabel>
                        <FormControl>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-min">
                                        Pick a color <div style={{ background: form.watch('color') }} className={`h-4 w-4 rounded-xs`}/>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="start" side="right" className="w-full max-w-[350px] rounded-md border bg-background p-4 shadow-sm">
                                    <ColorPicker 
                                    defaultValue={form.watch('color') || undefined}
                                    onChange={(rgba) => {
                                        const hex = Color.rgb(rgba).hex().toLowerCase();
                                        if(form.watch('color') === hex) return ;
                                        field.onChange(hex);
                                    }}
                                    >
                                        <ColorPickerShowcase />
                                        <ColorPickerSelection />
                                        <div className="flex items-center gap-4">
                                            <ColorPickerEyeDropper />
                                            <div className="w-full grid gap-1">
                                            <ColorPickerHue />
                                            <ColorPickerAlpha />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <ColorPickerOutput  />
                                            <ColorPickerFormat />
                                        </div>
                                    </ColorPicker>
                                </PopoverContent>
                            </Popover>
                        </FormControl>
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

export default ColumnForm