<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Khatma;
use App\Models\SeekerNeed;
use App\Models\Gift;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AdminController extends Controller
{
    public function index()
    {
        $stats = [
            'total_users' => User::count(),
            'total_khatmas' => Khatma::count(),
            'total_needs' => SeekerNeed::count(),
            'total_gifts' => Gift::count(),
            'active_khatmas' => Khatma::where('status', 'active')->count(),
            'pending_needs' => SeekerNeed::where('status', 'pending')->count(),
            'khatma_users' => User::where('role', 'khatma')->count(),
            'seeker_users' => User::where('role', 'seeker')->count(),
            'admin_users' => User::where('role', 'admin')->count(),
            'total_impact_points' => Khatma::sum('impact_score'),
        ];

        return response()->json($stats);
    }

    public function users(Request $request)
    {
        $query = User::query();

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%');
        }

        $users = $query->latest()->paginate($request->per_page ?? 20);

        return response()->json($users);
    }

    public function updateRole(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'role' => 'required|in:khatma,seeker,admin',
        ]);

        $oldRole = $user->role;
        $user->role = $request->role;
        $user->save();

        Log::info('User role updated by admin', [
            'admin_id' => $request->user()->id,
            'target_user_id' => $user->id,
            'old_role' => $oldRole,
            'new_role' => $user->role,
        ]);

        return response()->json([
            'message' => 'تم تحديث الدور بنجاح',
            'user' => $user,
        ]);
    }

    public function deleteKhatma($id)
    {
        $khatma = Khatma::findOrFail($id);
        $khatma->delete();

        Log::info('Khatma deleted by admin', [
            'admin_id' => auth()->id(),
            'khatma_id' => $id,
            'khatma_user_id' => $khatma->user_id,
        ]);

        return response()->json(['message' => 'تم حذف الختمة بنجاح']);
    }

    public function deleteNeed($id)
    {
        $need = SeekerNeed::findOrFail($id);
        $need->delete();

        Log::info('Need deleted by admin', [
            'admin_id' => auth()->id(),
            'need_id' => $id,
            'need_user_id' => $need->user_id,
        ]);

        return response()->json(['message' => 'تم حذف الطلب بنجاح']);
    }

    public function createUser(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:khatma,seeker,admin',
            'city' => 'nullable|string|max:255',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'role' => $request->role,
            'city' => $request->city,
        ]);

        Log::info('User created by admin', [
            'admin_id' => auth()->id(),
            'new_user_id' => $user->id,
            'role' => $user->role,
        ]);

        return response()->json([
            'message' => 'تم إنشاء المستخدم بنجاح',
            'user' => $user,
        ], 201);
    }
}
