interface Props {
    session: any;
}

export default function SessionDashboard({ session }: Props) {
    return (
        <div className="p-6">
            <h1 className="mb-4 text-xl font-bold">Teller Session Dashboard</h1>

            <div className="space-y-2 rounded border p-4">
                <div>
                    <strong>Status:</strong> {session.status}
                </div>

                <div>
                    <strong>Opening Cash:</strong> {session.opening_cash}
                </div>

                <div>
                    <strong>Opened At:</strong> {session.opened_at}
                </div>
            </div>
        </div>
    );
}
