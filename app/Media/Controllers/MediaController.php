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
        $perPage = $request->input('perPage', 10);
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

        return response()->json($mediaItems);
    }

    public function index(Request $request): Response
    {
        $perPage = $request->input('perPage', 20);
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
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $mimeType = $file->getClientMimeType();
            $extension = $file->getClientOriginalExtension();
            $fileName = uniqid() . '.' . $extension;
            $filePath = 'uploads/' . $fileName;

            Storage::disk('public')->putFileAs('uploads', $file, $fileName);

            if (str_starts_with($mimeType, 'image/')) {
                $optimizerChain = OptimizerChainFactory::create();
                $optimizerChain->optimize(storage_path('app/public/' . $filePath));
            }

            $altText = $request->input('alt_text') ?? pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);

            Media::create([
                'file_name' => $fileName,
                'file_path' => $filePath,
                'file_type' => $mimeType,
                'alt_text' => $altText,
                'uploaded_by' => Auth::id(),
            ]);

            return redirect()->back()->with('success', 'Media uploaded successfully.');
        }

        return redirect()->back()->with('error', 'No file uploaded.');
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

