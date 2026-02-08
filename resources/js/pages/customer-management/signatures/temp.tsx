<td className="px-2 py-1">
    <TooltipProvider>
        <div className="flex space-x-2">
            <Tooltip>
                <TooltipTrigger asChild>
                    <a
                        href={`/auth/signatures/${s.id}`}
                        className="text-primary hover:text-primary/80"
                    >
                        <Eye className="h-5 w-5" />
                    </a>
                </TooltipTrigger>
                <TooltipContent>View</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <a
                        href={`/auth/signatures/${s.id}/edit`}
                        className="text-green-600 hover:text-green-500"
                    >
                        <Pencil className="h-5 w-5" />
                    </a>
                </TooltipTrigger>
                <TooltipContent>Edit</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        type="button"
                        onClick={() => handleDelete(s.id, '')}
                        className="text-destructive hover:text-destructive/80"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
            </Tooltip>
        </div>
    </TooltipProvider>
</td>;
