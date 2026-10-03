import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef, type SortingState, type Updater } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { permissionColors } from "../constants/permission";
import type { TeamMemberTableSortField, TeamMemberTableSortOrder, TeamMemberWithUser } from "../type";
import { TeamMemberActions } from "./TeamMemberCard";

type TeamMembersDataTableProps = {
    members: TeamMemberWithUser[];
    sortBy: TeamMemberTableSortField;
    sortOrder: TeamMemberTableSortOrder;
    onSortChange: (sortBy: TeamMemberTableSortField, sortOrder: TeamMemberTableSortOrder) => void;
    emptyMessage: string;
}

const sortableColumns: TeamMemberTableSortField[] = ['member', 'role', 'email', 'joined'];

const SortIcon = ({ direction }: { direction: false | 'asc' | 'desc' }) => {
    if (direction === 'asc') return <ArrowUp data-icon="inline-end" />;
    if (direction === 'desc') return <ArrowDown data-icon="inline-end" />;
    return <ChevronsUpDown data-icon="inline-end" />;
}

const columns: ColumnDef<TeamMemberWithUser>[] = [
    {
        id: 'member',
        accessorFn: (member) => member.user.displayName,
        header: 'Member',
        cell: ({ row }) => {
            const member = row.original;
            return (
                <div className="flex min-w-52 items-center gap-3">
                    <Avatar className="size-9 border border-border">
                        <AvatarImage src={member.user.avatarUrl || '/placeholder.svg'} alt={member.user.displayName} />
                        <AvatarFallback>{member.user.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{member.user.displayName}</p>
                        <p className="truncate text-xs text-muted-foreground">@{member.user.username}</p>
                    </div>
                </div>
            );
        },
    },
    {
        id: 'role',
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => (
            <Badge variant="outline" className={permissionColors[row.original.role]}>
                {row.original.role}
            </Badge>
        ),
    },
    {
        id: 'email',
        accessorFn: (member) => member.user.email,
        header: 'Email',
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.user.email}</span>,
    },
    {
        id: 'joined',
        accessorKey: 'joinedAt',
        header: 'Joined',
        cell: ({ row }) => <span className="text-muted-foreground">{format(new Date(row.original.joinedAt), 'MMM d, yyyy')}</span>,
    },
    {
        id: 'actions',
        enableSorting: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => <TeamMemberActions member={row.original} />,
    },
];

const TeamMembersDataTable = ({ members, sortBy, sortOrder, onSortChange, emptyMessage }: TeamMembersDataTableProps) => {
    const sorting: SortingState = [{ id: sortBy, desc: sortOrder === 'desc' }];

    const handleSortingChange = (updater: Updater<SortingState>) => {
        const nextSorting = typeof updater === 'function' ? updater(sorting) : updater;
        const nextSort = nextSorting[0];

        if (!nextSort || !sortableColumns.includes(nextSort.id as TeamMemberTableSortField)) return;

        onSortChange(nextSort.id as TeamMemberTableSortField, nextSort.desc ? 'desc' : 'asc');
    }

    const table = useReactTable({
        data: members,
        columns,
        state: { sorting },
        manualSorting: true,
        onSortingChange: handleSortingChange,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="min-h-[calc(100vh-19rem)] overflow-hidden rounded-lg border bg-background">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id} className={header.id === 'actions' ? 'w-14 pr-4 text-right' : 'first:pl-4'}>
                                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="-ml-3"
                                            onClick={() => header.column.toggleSorting(header.column.getIsSorted() === 'asc')}
                                        >
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            <SortIcon direction={header.column.getIsSorted()} />
                                        </Button>
                                    ) : flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id} className={cell.column.id === 'actions' ? 'pr-4 text-right' : 'first:pl-4'}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                            ))}
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-56 px-4 text-center text-muted-foreground">
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

export default TeamMembersDataTable;
