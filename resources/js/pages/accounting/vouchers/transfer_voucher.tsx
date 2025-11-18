import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CustomAuthLayout from '@/layouts/custom-auth-layout';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Textarea } from '../../../components/ui/text-area';

export default function TransferVoucherEntry() {
    return (
        <CustomAuthLayout
            breadcrumbs={[
                { title: 'Accounting', href: '/accounting' },
                { title: 'Transfer Voucher', href: '' },
            ]}
        >
            <Head title="Transfer Voucher Entry" />

            <div className="animate-in space-y-6 text-foreground fade-in">
                <HeadingSmall
                    title="Transfer Voucher Entry"
                    description="Record fund transfers between accounts efficiently"
                />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-auto w-full max-w-3xl space-y-6 p-6"
                >
                    <Card className="rounded-2xl shadow-md">
                        <CardContent className="space-y-6 p-6">
                            {/* Voucher Info */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label>Voucher No</Label>
                                    <Input placeholder="Auto-generated or type manually" />
                                </div>
                                <div>
                                    <Label>Date</Label>
                                    <Input type="date" />
                                </div>
                            </div>

                            {/* Accounts */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label>From Account (Credit)</Label>
                                    <Input placeholder="Select GL Account" />
                                </div>
                                <div>
                                    <Label>To Account (Debit)</Label>
                                    <Input placeholder="Select GL Account" />
                                </div>
                            </div>

                            {/* Amount & Reference */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label>Amount</Label>
                                    <Input type="number" placeholder="0.00" />
                                </div>
                                <div>
                                    <Label>Reference</Label>
                                    <Input placeholder="Cheque No, Receipt No, etc." />
                                </div>
                            </div>

                            {/* Narration */}
                            <div>
                                <Label>Narration</Label>
                                <Textarea placeholder="Describe the purpose of this transfer..." />
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end">
                                <Button className="rounded-2xl px-6">
                                    Submit{' '}
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </CustomAuthLayout>
    );
}
