<?php

namespace App\Http\Controllers;

use Inertia\Inertia;

class DashboardController extends Controller
{
    public function home()
    {
        return Inertia::render('welcome');
    }
    public function index()
    {
        // -----------------------------------------
        // 📊 High-level KPIs — aligned with sidebar modules
        // -----------------------------------------
        $stats = [
            'branches' => 12,
            'customers' => 1240,
            'savingsAccounts' => 870,
            'shares' => 430,
            'loans' => 215,
            'cashTransactions' => 1260,
            'assets' => 85,
            'vendors' => 42,
            'cheques' => 155,
            'employees' => 56,
            'loanApplications' => 34,
            'users' => 20,
            'auditLogs' => 460,
            'settingsChanged' => 8,
            'totalVisitors' => 10240,
        ];

        // -----------------------------------------
        // 📈 Monthly Visitors (last 6 months)
        // -----------------------------------------
        $monthlyVisitors = [
            'May' => 1200,
            'Jun' => 950,
            'Jul' => 1050,
            'Aug' => 1300,
            'Sep' => 1100,
            'Oct' => 1420,
        ];

        // -----------------------------------------
        // 📋 Route Visits (top 10)
        // -----------------------------------------
        $routeVisits = [
            '/dashboard' => 2200,
            '/customers' => 1800,
            '/loans' => 1450,
            '/branches' => 1300,
            '/savings' => 1200,
            '/vendors' => 980,
            '/assets' => 870,
            '/hr' => 740,
            '/users' => 690,
        ];

        // -----------------------------------------
        // 📰 Latest Notices
        // -----------------------------------------
        $latestNotices = collect([
            ['id' => 1, 'title' => 'System Maintenance on Oct 25', 'created_at' => now()->subDays(1)],
            ['id' => 2, 'title' => 'New Branch Opening', 'created_at' => now()->subDays(4)],
            ['id' => 3, 'title' => 'Updated Loan Policy', 'created_at' => now()->subDays(6)],
        ]);

        // -----------------------------------------
        // 👥 Recent Customers
        // -----------------------------------------
        $customers = collect([
            ['id' => 1, 'name' => 'John Doe', 'account_no' => 'CUS-00123', 'joined_at' => now()->subDays(2)],
            ['id' => 2, 'name' => 'Sarah Lee', 'account_no' => 'CUS-00124', 'joined_at' => now()->subDays(3)],
            ['id' => 3, 'name' => 'David Kim', 'account_no' => 'CUS-00125', 'joined_at' => now()->subDays(5)],
        ]);

        // -----------------------------------------
        // 💸 Loan Applications
        // -----------------------------------------
        $loanApplications = collect([
            ['id' => 1, 'applicant' => 'Michael Scott', 'amount' => 5000, 'status' => 'Pending', 'created_at' => now()->subDays(2)],
            ['id' => 2, 'applicant' => 'Pam Beesly', 'amount' => 3500, 'status' => 'Approved', 'created_at' => now()->subDays(4)],
            ['id' => 3, 'applicant' => 'Jim Halpert', 'amount' => 7200, 'status' => 'Rejected', 'created_at' => now()->subDays(6)],
        ]);

        // -----------------------------------------
        // 🧾 Audit Logs
        // -----------------------------------------
        $auditLogs = collect([
            ['id' => 1, 'action' => 'User Login', 'user' => 'Admin', 'created_at' => now()->subHours(2)],
            ['id' => 10, 'action' => 'User Login', 'user' => 'Admin', 'created_at' => now()->subHours(2)],
            ['id' => 2, 'action' => 'Branch Created', 'user' => 'Manager', 'created_at' => now()->subHours(5)],
            ['id' => 3, 'action' => 'Settings Updated', 'user' => 'Admin', 'created_at' => now()->subHours(8)],
        ]);

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'monthlyVisitors' => $monthlyVisitors,
            'routeVisits' => $routeVisits,
            'latestNotices' => $latestNotices,
            'customers' => $customers,
            'loanApplications' => $loanApplications,
            'auditLogs' => $auditLogs,
        ]);
    }
}
