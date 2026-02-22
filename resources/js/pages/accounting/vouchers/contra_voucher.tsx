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

export default function ContraVoucherEntry() {
    return (
        <CustomAuthLayout
            breadcrumbs={[
                { title: 'Accounting', href: '/accounting' },
                { title: 'Contra Voucher', href: '' },
            ]}
        >
            <Head title="Contra Voucher Entry" />

            <div className="animate-in space-y-6 text-foreground fade-in">
                {/* Page header */}
                <HeadingSmall
                    title="Contra Voucher Entry"
                    description="Record transfers between cash, bank, or GL ledger_accounts"
                />

                {/* Voucher card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-auto w-full space-y-6"
                >
                    <Card className="rounded-2xl border border-border shadow-lg">
                        <CardContent className="space-y-6 p-6">
                            {/* Voucher Info */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label className="font-medium">
                                        Voucher No
                                    </Label>
                                    <Input
                                        placeholder="Auto-generated or type manually"
                                        className="h-10 rounded-xl"
                                    />
                                </div>

                                <div>
                                    <Label className="font-medium">Date</Label>
                                    <Input
                                        type="date"
                                        className="h-10 rounded-xl"
                                    />
                                </div>
                            </div>

                            {/* From / To Accounts */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label className="font-medium">
                                        From Account
                                    </Label>
                                    <Input
                                        placeholder="Cash / Bank / GL Account"
                                        className="h-10 rounded-xl"
                                    />
                                </div>

                                <div>
                                    <Label className="font-medium">
                                        To Account
                                    </Label>
                                    <Input
                                        placeholder="Cash / Bank / GL Account"
                                        className="h-10 rounded-xl"
                                    />
                                </div>
                            </div>

                            {/* Amount / Reference */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label className="font-medium">
                                        Amount
                                    </Label>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        className="h-10 rounded-xl"
                                    />
                                </div>

                                <div>
                                    <Label className="font-medium">
                                        Reference
                                    </Label>
                                    <Input
                                        placeholder="Cheque No, Transfer No, etc."
                                        className="h-10 rounded-xl"
                                    />
                                </div>
                            </div>

                            {/* Narration */}
                            <div>
                                <Label className="font-medium">Narration</Label>
                                <Textarea
                                    placeholder="Describe the contra transaction..."
                                    className="h-28 rounded-2xl"
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-2">
                                <Button className="flex items-center gap-2 rounded-2xl px-6 py-3 shadow-md">
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
