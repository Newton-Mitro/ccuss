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
                path: '/cheque-books',
                match_path: 'cheque-books',
                permission: ['cheque.book.view'],
            },
            {
                name: 'Cheques',
                icon: <i className="fa-solid fa-file-signature" />, // ✍️ represents signed cheque
                path: '/cheques',
                match_path: 'cheques',
                permission: ['cheque.view'],
            },
        ],
    },
];
