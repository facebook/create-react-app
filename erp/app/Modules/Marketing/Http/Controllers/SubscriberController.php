<?php

namespace App\Modules\Marketing\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Marketing\Models\Subscriber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriberController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Subscriber::withCount('mailingLists')
            ->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
            });
        }

        $subscribers = $query->paginate(25)->withQueryString();

        return Inertia::render('Marketing/Subscribers/Index', [
            'subscribers' => $subscribers,
            'filters'     => $request->only(['status', 'search']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'email' => 'required|email',
            'name'  => 'nullable|string|max:255',
        ]);

        $tenantId = auth()->user()->tenant_id;

        $subscriber = Subscriber::firstOrCreate(
            ['tenant_id' => $tenantId, 'email' => $data['email']],
            ['name' => $data['name'] ?? null]
        );

        $subscriber->subscribe();

        return redirect()->back()->with('success', 'Subscriber added.');
    }

    public function unsubscribe(Subscriber $subscriber): RedirectResponse
    {
        $subscriber->unsubscribe();

        return redirect()->back()->with('success', 'Subscriber unsubscribed.');
    }

    public function destroy(Subscriber $subscriber): RedirectResponse
    {
        $subscriber->delete();

        return redirect()->back()->with('success', 'Subscriber deleted.');
    }

    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt',
        ]);

        $tenantId = auth()->user()->tenant_id;
        $file     = $request->file('file');
        $handle   = fopen($file->getPathname(), 'r');

        $count   = 0;
        $headers = null;

        while (($row = fgetcsv($handle)) !== false) {
            if ($headers === null) {
                $headers = array_map('strtolower', array_map('trim', $row));
                continue;
            }

            $data = array_combine($headers, $row);

            $email = trim($data['email'] ?? '');
            if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                continue;
            }

            $subscriber = Subscriber::firstOrCreate(
                ['tenant_id' => $tenantId, 'email' => $email],
                [
                    'name'          => trim($data['name'] ?? ''),
                    'status'        => 'subscribed',
                    'subscribed_at' => now(),
                ]
            );

            if (!$subscriber->wasRecentlyCreated) {
                $subscriber->subscribe();
            }

            $count++;
        }

        fclose($handle);

        return redirect()->back()->with('success', "Imported {$count} subscribers.");
    }
}
