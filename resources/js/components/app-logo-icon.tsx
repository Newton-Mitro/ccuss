export default function AppLogoIcon(props: any) {
    return (
        <img
            src={import.meta.env.VITE_LOGO_PATH}
            alt="Logo"
            className="w-40"
            {...props}
        />
    );
}
