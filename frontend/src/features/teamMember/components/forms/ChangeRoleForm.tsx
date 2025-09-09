import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import LoadingSpinner from "@/components/ui/loadingSpinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { handleNestError, ValidationError } from "@/lib/handleNestError"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { UserCog } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import { useChangeRoleDialog } from "../../store/changeRoleStore"
import type { ChangeRoleSchema, TeamMemberWithUser } from "../../type"

export const changeRoleFormSchema = z.object({
    memberId: z.string().min(1, "Member ID is required"),
    role: z.enum(["admin", "member"]),
    reason: z.string().max(400).optional()
})

type ChangeRoleFormProps = {
    onsubmit: (data: ChangeRoleSchema) => Promise<void>;
    isLoading: boolean;
    className?: string;
    initialData: TeamMemberWithUser;
}

const ChangeRoleForm = ({ 
    onsubmit, isLoading,
    className, initialData
}: ChangeRoleFormProps) => {
    const setIsOpen = useChangeRoleDialog((state) => state.setIsOpen);
    const form = useForm<ChangeRoleSchema>({
        resolver: zodResolver(changeRoleFormSchema),
        defaultValues: {
            memberId: initialData._id,
            role: initialData.role
        }
    })

    const onSubmit = async (data: ChangeRoleSchema) => {
        try {
            await onsubmit(data);
        } catch (error: any | ValidationError) {
            if(error instanceof ValidationError) {
                handleNestError(error.response, form.setError);
            } else {
                toast.error(error.message || "An error occured while adding a team member.");
            }
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-4", className)}>
                <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">

                    <Card className="py-0">
                        <CardContent className="p-3 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Avatar className="w-16 h-16">
                                        <AvatarImage src={initialData.user.avatarUrl || "/placeholder.svg"} alt={initialData.user.displayName} />
                                        <AvatarFallback className="text-lg">{initialData.user.displayName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg text-gray-900">{initialData.user.displayName}</h3>
                                </div>
                                <FormField 
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel>Select Role</FormLabel>
                                        <FormControl>
                                            <Select value={field.value} onValueChange={(value) => field.onChange(value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                    <SelectItem value="member">Member</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                                />
                            </div>

                            <FormField 
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel>Reason For Change (optional)</FormLabel>
                                    <FormControl>
                                        <Textarea {...field}
                                        placeholder="Provide a reason for this role change..."
                                        className="min-h-[80px]"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                            />

                        </CardContent>
                    </Card>


                    {/* {hasChanges && (
                        <Card className="border-blue-200 bg-blue-50">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                <Info className="w-5 h-5 text-blue-600" />
                                Change Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {newRole !== member.role && (
                                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                    <span className="text-sm font-medium">Role</span>
                                    <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">{member.role}</span>
                                    <ArrowRight className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-medium text-blue-600">{newRole}</span>
                                    </div>
                                </div>
                                )}
                                {newPermissions !== member.permissions && (
                                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                    <span className="text-sm font-medium">Permissions</span>
                                    <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                        {currentPermission?.label}
                                    </Badge>
                                    <ArrowRight className="w-4 h-4 text-gray-400" />
                                    <Badge
                                        variant="outline"
                                        className={`text-xs ${selectedPermission?.bgColor} ${selectedPermission?.color}`}
                                    >
                                        {selectedPermission?.label}
                                    </Badge>
                                    </div>
                                </div>
                                )}
                            </CardContent>
                        </Card>
                    )} */}
                </div>

                <div className="flex justify-end gap-3">
                    <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                    type="submit"
                    disabled={isLoading}
                    >
                        {isLoading? (
                            <LoadingSpinner />
                        ) : (
                            <>
                                <UserCog className="w-4 h-4 mr-2" />
                                Update Role
                            </>
                        )}
                    </Button>
                </div>

            </form>
        </Form>
    )
}

export default ChangeRoleForm;