import { ValidationError } from "@/lib/handleNestError";
import axiosInstance from "@/lib/httpService";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import type { AxiosResponse } from "axios";
import useProjectDialogStore from "../store/useProjectDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProjectWithOwner } from "../type";


type editProjectSuccessResponse = ProjectWithOwner;
type editProjectResponse = AxiosResponse<editProjectSuccessResponse, ExceptionResponse>;

const editProject = async (id: string, data: any): Promise<editProjectResponse['data']> => {
    const response = await axiosInstance.patch(`/projects/${id}`, data);

    if (response.status === 400) {
        throw new ValidationError(response.data);
    }

    if (response.status >= 400) {
        throw new Error(response.data.message || 'An error occurred while updating the project');
    }

    return response.data;
}

export const useEditProjectMutation = (projectId: string) => {
    const setEditOpen = useProjectDialogStore((state) => state.setEditOpen);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => editProject(projectId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allProjects'] });
            setEditOpen(false);
        }
    });
}