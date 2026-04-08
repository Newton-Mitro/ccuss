import { SidebarItem } from '../../types';

export const chequeManagementMenu: SidebarItem[] = [
    {
        name: 'Cheque Management',
        icon: <i className="fa-solid fa-money-check-dollar" />, // 🔥 more domain-specific
        children_expanded: false,
        permission: ['cheque.view'],
        children: [
            {
                name: 'Cheque Books',
                icon: <i className="fa-solid fa-book-open" />, // 📖 clearer than plain book
                path: '/bank-cheque-books',
                match_path: 'bank-cheque-books',
                permission: ['cheque.book.view'],
            },
            {
                name: 'Cheques',
                icon: <i className="fa-solid fa-file-signature" />, // ✍️ represents signed cheque
                path: '/bank-cheques',
                match_path: 'bank-cheques',
                permission: ['cheque.view'],
            },
        ],
    },
];
