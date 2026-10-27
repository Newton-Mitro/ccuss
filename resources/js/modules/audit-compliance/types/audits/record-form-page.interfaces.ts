export interface Register {
    route: string;
    title: string;
    singular: string;
    area: string;
    description: string;
}

export interface RecordData {
    id: number;
    reference: string;
    title: string;
    category: string | null;
    description: string | null;
    status: string;
    priority: string;
    responsible_person: string | null;
    due_date: string | null;
    related_record_id: number | null;
}

export interface RelatedRecord {
    id: number;
    kind: string;
    reference: string;
    title: string;
}

export interface Props {
    register: Register;
    record: RecordData | null;
    relatedRecords: RelatedRecord[];
    statuses: string[];
    priorities: string[];
}
