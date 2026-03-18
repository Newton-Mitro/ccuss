import { ChevronDown, ChevronRight, Filter, Search } from 'lucide-react';
import { useState } from 'react';
import HeadingSmall from '../../../components/heading-small';
import CustomAuthLayout from '../../../layouts/custom-auth-layout';

const useCases = [
    {
        id: 'UC-01',
        title: 'Open Branch Day',
        actor: 'Branch Manager',
        description: 'Starts the operational business day for a branch.',
        preconditions: [
            'User must have permission to open branch day',
            'No existing open branch day for the branch',
        ],
        flow: [
            'Manager navigates to Branch Day Management',
            'Manager selects Open Branch Day',
            'Manager enters business_date',
            'System validates no open branch day exists',
            'System creates branch_days record',
            'System sets status to OPEN',
        ],
        postconditions: [
            'Branch operations become active',
            'Teller sessions can be opened',
        ],
    },
    {
        id: 'UC-02',
        title: 'View Branch Day Status',
        actor: 'Branch Staff',
        description: 'View the current branch operational status.',
        preconditions: ['User must belong to a branch'],
        flow: [
            'User opens Branch Day Status',
            'System fetches current branch_days record',
            'System displays business date, status, opened time, closed time',
        ],
        postconditions: ['User sees branch operational state'],
    },
    {
        id: 'UC-03',
        title: 'Open Teller Session',
        actor: 'Teller',
        description: 'Start teller working session for the day.',
        preconditions: [
            'Branch day must be OPEN',
            'Teller must be an authorized user',
        ],
        flow: [
            'Teller logs into system',
            'Teller selects Open Teller Session',
            'Teller enters opening_cash',
            'System validates branch day status',
            'System creates teller_sessions record',
            'System initializes teller drawer',
        ],
        postconditions: ['Teller can perform cash transactions'],
    },
    {
        id: 'UC-04',
        title: 'Assign Cash Drawer',
        actor: 'Vault Officer / Branch Manager',
        description: 'Assign operational cash to teller.',
        preconditions: [
            'Teller session must exist',
            'Vault must have sufficient balance',
        ],
        flow: [
            'Officer selects Assign Cash Drawer',
            'Select teller session',
            'Enter opening cash amount',
            'System creates cash_drawers record',
        ],
        postconditions: ['Teller receives operational cash drawer'],
    },
    {
        id: 'UC-05',
        title: 'Vault to Teller Cash Transfer',
        actor: 'Vault Officer',
        description: 'Transfer working cash from vault to teller drawer.',
        preconditions: [
            'Teller session must be active',
            'Vault must have sufficient balance',
        ],
        flow: [
            'Officer selects Vault to Teller Transfer',
            'Select vault and teller',
            'Enter transfer amount',
            'System validates vault balance',
            'System records transfer',
            'System updates balances',
        ],
        postconditions: [
            'Teller drawer balance increases',
            'Vault balance decreases',
        ],
    },
    {
        id: 'UC-06',
        title: 'Teller Cash Transaction',
        actor: 'Teller',
        description: 'Perform customer cash operations.',
        preconditions: [
            'Teller session must be active',
            'Cash drawer must exist',
        ],
        flow: [
            'Teller selects transaction type',
            'Enter transaction details',
            'System validates limits',
            'System records transaction',
            'System updates drawer balance',
        ],
        postconditions: ['Cash transaction recorded', 'Drawer balance updated'],
    },
    {
        id: 'UC-07',
        title: 'Return Cash to Vault',
        actor: 'Teller / Vault Officer',
        description: 'Return excess cash from teller drawer to vault.',
        preconditions: ['Teller session must be active'],
        flow: [
            'Teller selects Return Cash',
            'Enter return amount',
            'Select vault',
            'System validates drawer balance',
            'System records transfer',
            'System updates balances',
        ],
        postconditions: ['Vault balance increases', 'Drawer balance decreases'],
    },
    {
        id: 'UC-08',
        title: 'Teller Cash Balancing',
        actor: 'Teller',
        description: 'Reconcile system balance with physical cash.',
        preconditions: ['Teller session must be active'],
        flow: [
            'Teller selects Balance Cash',
            'System calculates expected balance',
            'Teller counts physical cash',
            'Teller enters actual_cash',
            'System calculates difference',
        ],
        postconditions: ['Cash balancing record stored'],
    },
    {
        id: 'UC-09',
        title: 'Cash Adjustment',
        actor: 'Supervisor / Branch Manager',
        description: 'Approve and record discrepancy adjustment.',
        preconditions: ['Cash balancing record must exist'],
        flow: [
            'Supervisor reviews balancing report',
            'Select adjustment type',
            'Enter reason',
            'Approve adjustment',
            'System records adjustment',
            'System updates drawer balance',
        ],
        postconditions: ['Cash discrepancy resolved'],
    },
    {
        id: 'UC-10',
        title: 'Close Teller Session',
        actor: 'Teller',
        description: 'End teller work session.',
        preconditions: [
            'All transactions must be completed',
            'Drawer must be balanced',
        ],
        flow: [
            'Teller selects Close Session',
            'Enter closing_cash',
            'System validates balances',
            'System updates session status',
        ],
        postconditions: ['Teller session becomes CLOSED'],
    },
    {
        id: 'UC-11',
        title: 'Vault to Vault Transfer',
        actor: 'Vault Officer / Manager',
        description: 'Move cash between vaults.',
        preconditions: ['Source vault must have sufficient balance'],
        flow: [
            'Officer selects Vault Transfer',
            'Select source vault',
            'Select destination vault',
            'Enter transfer amount',
            'Manager approves transfer',
            'System updates balances',
        ],
        postconditions: ['Vault balances updated'],
    },
    {
        id: 'UC-12',
        title: 'Close Branch Day',
        actor: 'Branch Manager',
        description: 'End branch financial operations.',
        preconditions: [
            'All teller sessions must be closed',
            'Vault balances must be reconciled',
        ],
        flow: [
            'Manager selects Close Branch Day',
            'System validates teller sessions',
            'System verifies vault balances',
            'System updates branch day status',
        ],
        postconditions: ['Branch day status becomes CLOSED'],
    },
];

export default function BranchCashManagement() {
    const [expanded, setExpanded] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const [actorFilter, setActorFilter] = useState('ALL');

    const actors = [
        'ALL',
        'Branch Manager',
        'Branch Staff',
        'Teller',
        'Vault Officer',
    ];

    const filtered = useCases.filter((u) => {
        const matchesSearch =
            u.title.toLowerCase().includes(search.toLowerCase()) ||
            u.id.toLowerCase().includes(search.toLowerCase());

        const matchesActor = actorFilter === 'ALL' || u.actor === actorFilter;

        return matchesSearch && matchesActor;
    });

    return (
        <CustomAuthLayout breadcrumbs={null}>
            <div className="space-y-4 text-foreground">
                {/* Header */}
                <div className="flex items-center gap-2">
                    <HeadingSmall
                        title="Branch Cash Management"
                        description="Operational workflows for branch vault and teller cash handling"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search use cases..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-9 w-full rounded-md border border-border bg-background pr-3 pl-8 text-sm focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />

                        <select
                            value={actorFilter}
                            onChange={(e) => setActorFilter(e.target.value)}
                            className="h-9 rounded-md border border-border bg-background px-3 text-sm"
                        >
                            {actors.map((a) => (
                                <option key={a}>{a}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Use Cases */}
                <div className="rounded-md border border-border">
                    {filtered.length === 0 && (
                        <div className="p-6 text-center text-muted-foreground">
                            No use cases found.
                        </div>
                    )}

                    {filtered.map((uc, i) => {
                        const isOpen = expanded === i;

                        return (
                            <div
                                key={uc.id}
                                className="border-b border-border last:border-none"
                            >
                                {/* Header */}
                                <button
                                    onClick={() =>
                                        setExpanded(isOpen ? null : i)
                                    }
                                    className="flex w-full items-center justify-between p-3 hover:bg-muted/40"
                                >
                                    <div className="flex items-center gap-3">
                                        {isOpen ? (
                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        )}

                                        <span className="font-medium">
                                            {uc.id}
                                        </span>

                                        <span className="text-sm text-muted-foreground">
                                            {uc.title}
                                        </span>

                                        <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                                            {uc.actor}
                                        </span>
                                    </div>
                                </button>

                                {/* Content */}
                                {isOpen && (
                                    <div className="flex flex-col gap-6 p-4">
                                        <div>
                                            <h3 className="mb-2 text-sm font-semibold">
                                                Description
                                            </h3>

                                            <p className="text-sm text-muted-foreground">
                                                {uc.description}
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="mb-2 text-sm font-semibold">
                                                Preconditions
                                            </h3>

                                            <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                                                {uc.preconditions.map(
                                                    (p, i) => (
                                                        <li key={i}>{p}</li>
                                                    ),
                                                )}
                                            </ul>
                                        </div>

                                        <div>
                                            <h3 className="mb-2 text-sm font-semibold">
                                                Main Flow
                                            </h3>

                                            <ol className="list-decimal space-y-1 pl-4 text-sm text-muted-foreground">
                                                {uc.flow.map((f, i) => (
                                                    <li key={i}>{f}</li>
                                                ))}
                                            </ol>
                                        </div>

                                        <div className="md:col-span-3">
                                            <h3 className="mb-2 text-sm font-semibold">
                                                Postconditions
                                            </h3>

                                            <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                                                {uc.postconditions.map(
                                                    (p, i) => (
                                                        <li key={i}>{p}</li>
                                                    ),
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </CustomAuthLayout>
    );
}
