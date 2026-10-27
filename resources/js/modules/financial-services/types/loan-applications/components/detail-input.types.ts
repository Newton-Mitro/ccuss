export type DetailInputProps = {
    label: string;
    value: string | number;
    onChange: (value: string) => void;
    type?: string;
    error?: string;
    placeholder?: string;
};
