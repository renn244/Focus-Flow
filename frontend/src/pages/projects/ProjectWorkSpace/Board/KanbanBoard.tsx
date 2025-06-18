import BoardCard from "./BoardCard"

const KanbanBoard = () => {
    return (
        <div className="flex gap-3 pt-2.5 overflow-x-auto">
            {['To do', 'In Progress', 'Done'].map((status) => (
                <BoardCard />
            ))}
            {/* Create Custom Boards */}
        </div>
    )
}

export default KanbanBoard