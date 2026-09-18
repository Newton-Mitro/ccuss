<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ReportArrayExport implements FromArray, ShouldAutoSize, WithStyles
{
    public function __construct(
        private readonly string $title,
        private readonly string $organizationName,
        private readonly string $organizationInfo,
        private readonly array $headings,
        private readonly array $rows,
    ) {
    }

    public function array(): array
    {
        return array_merge(
            [[$this->organizationName], [$this->organizationInfo], [$this->title], []],
            [$this->headings],
            $this->rows,
        );
    }

    public function styles(Worksheet $sheet): array
    {
        $lastColumn = $sheet->getHighestColumn();
        $sheet->mergeCells("A1:{$lastColumn}1");
        $sheet->mergeCells("A2:{$lastColumn}2");
        $sheet->mergeCells("A3:{$lastColumn}3");

        return [
            1 => ['font' => ['bold' => true, 'size' => 14, 'color' => ['rgb' => 'FFFFFF']], 'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '0F3D56']]],
            2 => ['font' => ['italic' => true, 'color' => ['rgb' => '64748B']]],
            3 => ['font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => '0F3D56']]],
            5 => ['font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']], 'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '0F766E']]],
        ];
    }
}
