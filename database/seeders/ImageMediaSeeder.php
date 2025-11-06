<?php

namespace Database\Seeders;

use App\Media\Models\Media;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Http\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageMediaSeeder extends Seeder
{
    public function run(): void
    {
        $disk = Storage::disk('public');

        // Clean old uploads
        if ($disk->exists('uploads/images')) {
            $disk->deleteDirectory('uploads/images');
        }

        $sourceFolder = database_path('seeders/media/images');
        $files = glob($sourceFolder . '/*.*');

        if (empty($files)) {
            throw new \Exception("No sample media files found in {$sourceFolder}");
        }

        foreach (array_values($files) as $index => $file) {
            $extension = pathinfo($file, PATHINFO_EXTENSION);
            $fileName = ($index + 1) . '.' . $extension; // 1.jpg, 2.png, etc.

            // Copy file into storage/app/public/uploads
            $path = $disk->putFileAs('uploads/images', new File($file), $fileName);

            // Detect MIME type
            $mimeType = mime_content_type($file);

            // Create DB record
            Media::factory()->create([
                'file_name' => $fileName,
                'file_path' => $path,
                'file_type' => $mimeType,
                'alt_text' => pathinfo($file, PATHINFO_FILENAME),
                // 'uploaded_by' => User::inRandomOrder()->first()->id,
                'uploaded_by' => 1,
            ]);
        }
    }
}
