import { ValidationError } from "@/lib/handleNestError";
import axiosInstance from "@/lib/httpService";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import type { AxiosResponse } from "axios";
import useProjectDialogStore from "../store/useProjectDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type deleteProjectSuccessResponse = any;
type deleteProjectResponse = AxiosResponse<deleteProjectSuccessResponse, ExceptionResponse>;

const deleteProject = async (projectId: string): Promise<deleteProjectResponse['data']> => {
    const response = await axiosInstance.delete(`/projects/${projectId}`);

    if (response.status === 400) {
        throw new ValidationError(response.data);
    }

    if (response.status >= 400) {
        throw new Error(response.data.message || 'An error occurred while deleting the project');
    }

    return response.data;
}

export const useDeleteProjectMutation = (projectId: string) => {
    const setDeleteOpen = useProjectDialogStore((state) => state.setDeleteOpen);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => deleteProject(projectId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allProjects'] });
            setDeleteOpen(false);
        }
    })
}