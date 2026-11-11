import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import LoadingSpinner from "@/components/ui/loadingSpinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { handleNestError, ValidationError } from "@/lib/handleNestError"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Search, UserRoundPlus } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import type { AddMemberSchema } from "../../type"
import DisplayUser from "../primitives/DisplayUser"
import AvailableUser from "../primitives/AvailableUser"

export const addMemberFormSchema = z.object({
    selectedUserId: z.string().min(1, "Please select a user to add."),
    role: z.enum(['admin', 'member'])
})

type AddMemberFormProps = {
    onsubmit: (data: AddMemberSchema) => Promise<unknown>;
    isLoading: boolean;
    className?: string;
}

const AddMemberForm = ({
    onsubmit, isLoading, className
}: AddMemberFormProps) => {
    const [searchUser, setSearchUser] = useState<string>("");
    const form = useForm<AddMemberSchema>({
        resolver: zodResolver(addMemberFormSchema),
        defaultValues: {
            selectedUserId: "",
            role: "member"
        }
    })

    const onSubmit = async (data: AddMemberSchema) => {
        try {
            await onsubmit(data);
        } catch (error: unknown) {
            if(error instanceof ValidationError) {
                handleNestError(error.response, form.setError);
            } else {
                toast.error((error instanceof Error && error.message) || "An error occurred while adding a team member.");
            }
        }
    }

    const userId = form.watch('selectedUserId');
    const role = form.watch('role');

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={cn("flex flex-col gap-4", className)}>
                <div className="flex-1 overflow-hidden">
                    <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
                        <div className="flex flex-col gap-5">
                            <section className="flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <Search className="size-5 text-primary" />
                                    <h3 className="text-lg font-semibold">Find existing user</h3>
                                </div>
                                <div className="flex flex-col gap-2">
                                    
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <Input 
                                            className="pl-8"
                                            value={searchUser}
                                            onChange={(e) => setSearchUser(e.target.value   )}
                                            placeholder="Search by username or email..." />
                                        </div>

                                        {userId && (
                                            <div>
                                                <DisplayUser userId={userId} userOnClick={() => form.setValue('selectedUserId', "")} />
                                            </div>
                                        )}

                                        <FormField 
                                        control={form.control}
                                        name="role"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Role</FormLabel>
                                                <FormControl>
                                                    <Select value={field.value} onValueChange={(value) => field.onChange(value)}>
                                                        <SelectTrigger className="w-32">
                                                            <SelectValue placeholder="Select Role" />
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
                                    
                                    <Button type="submit"
                                    className="w-full"
                                    disabled={isLoading || !userId || !role}
                                    >
                                        {isLoading ? <LoadingSpinner /> : <><UserRoundPlus />Add User</>}
                                    </Button>
                                </div>
                            </section>

                           <AvailableUser 
                           searchUser={searchUser}
                           selectedUser={userId}
                           setSelectedUser={(userId) => form.setValue('selectedUserId', userId)}
                           />
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    )
}

export default AddMemberForm
