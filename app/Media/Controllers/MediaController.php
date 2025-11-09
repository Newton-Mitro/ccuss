<?php
namespace App\Media\Controllers;

use App\Http\Controllers\Controller;
use App\Media\Models\Media;
use App\Media\Requests\StoreMediaRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Spatie\ImageOptimizer\OptimizerChainFactory;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class MediaController extends Controller
{
    public function getMedia(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 10);
        $type = $request->input('type', 'all');

        // Only fetch media uploaded by the authenticated user
        $query = Media::where('uploaded_by', Auth::id());

        if ($type !== 'all') {
            match ($type) {
                'images' => $query->where('file_type', 'like', 'image/%'),
                'videos' => $query->where('file_type', 'like', 'video/%'),
                'audio' => $query->where('file_type', 'like', 'audio/%'),
                'pdf' => $query->where('file_type', 'application/pdf'),
                default => null,
            };
        }

        $mediaItems = $query->latest()->paginate($perPage);
        $mediaItems->withPath('/auth/api/media');

        return response()->json([
            'data' => $mediaItems->items(),
            'links' => $mediaItems->linkCollection(),
            'meta' => [
                'current_page' => $mediaItems->currentPage(),
                'last_page' => $mediaItems->lastPage(),
                'per_page' => $mediaItems->perPage(),
                'total' => $mediaItems->total(),
            ],
            'filters' => [
                'type' => $type,
            ],
        ]);
    }

    public function index(Request $request): Response
    {
        $perPage = $request->input('per_page', 10);
        $type = $request->input('type', 'all');

        // Only media uploaded by the authenticated user
        $query = Media::where('uploaded_by', Auth::id());

        if ($type !== 'all') {
            switch ($type) {
                case 'images':
                    $query->where('file_type', 'like', 'image/%');
                    break;
                case 'videos':
                    $query->where('file_type', 'like', 'video/%');
                    break;
                case 'audio':
                    $query->where('file_type', 'like', 'audio/%');
                    break;
                case 'pdf':
                    $query->where('file_type', 'application/pdf');
                    break;
            }
        }

        $mediaItems = $query->latest()->paginate($perPage)->withQueryString();

        return Inertia::render('media/index', [
            'mediaItems' => $mediaItems,
            'filters' => [
                'type' => $type,
            ],
        ]);
    }


    public function store(StoreMediaRequest $request): RedirectResponse
    {
        if ($request->hasFile('files')) {
            $files = $request->file('files');
            $uploadedFiles = [];

            foreach ($files as $file) {
                $mimeType = $file->getClientMimeType();
                $extension = $file->getClientOriginalExtension();
                $fileName = uniqid() . '.' . $extension;
                $filePath = 'uploads/' . $fileName;

                // Store file in public disk
                Storage::disk('public')->putFileAs('uploads', $file, $fileName);

                // Optimize if it's an image
                if (str_starts_with($mimeType, 'image/')) {
                    $optimizerChain = OptimizerChainFactory::create();
                    $optimizerChain->optimize(storage_path('app/public/' . $filePath));
                }

                // Use provided alt_texts or fallback to filename
                $altTextInput = $request->input('alt_text');
                $altText = is_array($altTextInput)
                    ? ($altTextInput[$file->getClientOriginalName()] ?? pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME))
                    : ($altTextInput ?? pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));

                // Create DB record
                $media = Media::create([
                    'file_name' => $fileName,
                    'file_path' => $filePath,
                    'file_type' => $mimeType,
                    'alt_text' => $altText,
                    'uploaded_by' => Auth::id(),
                ]);

                $uploadedFiles[] = $media;
            }

            return redirect()
                ->back()
                ->with('success', count($uploadedFiles) . ' file(s) uploaded successfully.');
        }

        return redirect()->back()->with('error', 'No files uploaded.');
    }


    public function show(Media $medium): Response
    {

        return Inertia::render('media/show', [
            'media' => $medium,
        ]);
    }

    public function destroy(Media $medium): RedirectResponse
    {
        // Only allow deletion if media was uploaded by the authenticated user
        if ($medium->uploaded_by !== Auth::id()) {
            return redirect()->route('media.index')->with('error', 'Unauthorized to delete this media.');
        }

        if (!empty($medium->file_path)) {
            $path = str_replace('storage/', '', $medium->file_path);
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }

        $medium->delete();

        return redirect()->route('media.index')->with('success', 'Media deleted successfully.');
    }
}

