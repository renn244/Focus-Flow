import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import ColumnForm from '../forms/ColumnForm'
import { useGetColumnById } from '../../hooks/Column/useGetColumnById'
import useColumnDialogStore from '../../store/useColumnDialog'
import LoadingSpinner from '@/components/ui/loadingSpinner'
import { useEditColumnMutation } from '../../hooks/Column/useEditColumnMutation'
import NotFoundDialog from '@/components/common/Dialog/NotFound-Dialog'
import SomethingWentWrongDialog from '@/components/common/Dialog/SomethingWentWrong-Dialog'

const EditColumnDialog = () => {
    const isEditOpen = useColumnDialogStore((state) => state.isEditOpen);
    const editColumnId = useColumnDialogStore((state) => state.editColumnId);
    const setEditOpen = useColumnDialogStore((state) => state.setEditOpen);

    const { data, isLoading, error, refetch, isRefetching } = useGetColumnById(editColumnId);
    const { mutateAsync, isPending } = useEditColumnMutation(editColumnId || '');

    if(isEditOpen === false || !editColumnId) {
        return null;
    }

    return (
        <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Column</DialogTitle>
                </DialogHeader>
                {isLoading && (
                    <div className="flex items-center justify-center h-64">
                        <LoadingSpinner />
                    </div>
                )}
                {error && (
                    <SomethingWentWrongDialog 
                    onBack={() => setEditOpen(false)} 
                    onRetry={refetch} retryLoading={isRefetching}
                    />
                )}
                {(!data && !isLoading && !error) && (
                    <NotFoundDialog 
                    onBack={() => setEditOpen(false)} 
                    onRetry={refetch} retryLoading={isRefetching}
                    title="Column not found" />
                )}
                {data && (
                    <ColumnForm 
                    initialData={{
                        title: data.title,
                        color: data.color || '',
                    }}
                    onsubmit={mutateAsync as any}
                    isLoading={isPending}
                    isUpdate />
                )}
            </DialogContent>
        </Dialog>
    )
}

export default EditColumnDialog