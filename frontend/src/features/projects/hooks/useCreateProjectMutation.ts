import { ValidationError } from "@/lib/handleNestError";
import axiosInstance from "@/lib/httpService";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import useProjectDialogStore from "../store/useProjectDialog";
import type { ProjectSchema, ProjectWithOwner } from "../type";

type createProjectSuccessResponse = ProjectWithOwner;
type createProjectResponse = AxiosResponse<createProjectSuccessResponse, ExceptionResponse>;

const createProject = async (data: ProjectSchema): Promise<createProjectResponse['data']> => {
    const response = await axiosInstance.post('/projects', data);

    if(response.status === 400) {
        throw new ValidationError(response.data);
    }

    if(response.status >= 400) {
        throw new Error(response.data.message || 'An error occurred while creating the project');
    }

    return response.data;
}

export const useCreateProjectMutation = () => {
    const setCreateOpen = useProjectDialogStore((state) => state.setCreateOpen);
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allProjects'] });            
            setCreateOpen(false);
        }
    })
}