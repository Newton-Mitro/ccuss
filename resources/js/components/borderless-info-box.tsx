function BolderLessInfoBox({ label, value }: { label: string; value: string }) {
    return (
        <div className="min-w-0">
            <span className="block text-xs text-muted-foreground">{label}</span>
            <p className="text-sm leading-5 font-medium break-words">{value}</p>
        </div>
    );
}

export default BolderLessInfoBox;
