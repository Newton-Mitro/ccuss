<?php

namespace Database\Factories;

use App\Media\Models\Media;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class MediaFactory extends Factory
{
    protected $model = Media::class;

    public function definition(): array
    {
        // pick a random file type for realism
        $fileType = $this->faker->randomElement(['image/png', 'image/jpeg', 'application/pdf', 'image/jpg']);
        $extension = match ($fileType) {
            'application/pdf' => 'pdf',
            'image/png' => 'png',
            'image/jpeg', 'image/jpg' => 'jpg',
            default => 'bin',
        };

        $fileName = $this->faker->unique()->lexify('file_????') . '.' . $extension;

        return [
            'file_name' => $fileName,
            'file_path' => 'uploads/' . $this->faker->date('Y/m/d') . '/' . $fileName,
            'file_type' => $fileType,
            'alt_text' => $this->faker->optional()->sentence(3),

            // Random existing users or null if none exist
            'uploaded_by' => User::inRandomOrder()->value('id') ?? null,
            'updated_by' => $this->faker->boolean(50)
                ? (User::inRandomOrder()->value('id') ?? null)
                : null,
        ];
    }
}
