
const transformReorderColumn = (reorderColumnData: any[]) => {
    return  reorderColumnData.reduce((acc, column, index) => {
        acc.push({ _id: column._id, order: index });
        return acc;
    }, [] as { _id: string, order: number }[]) as { _id: string, order: number }[];
}

export default transformReorderColumn;