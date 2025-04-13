from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .models import Product
from .chapa_utils import process_withdrawal
import json

def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user_type = request.POST.get('user_type')

        # Hardcoded credentials for demo
        if user_type == 'admin' and username == 'admin123' and password == 'admin123':
            request.session['user_type'] = 'admin'
            request.session['is_authenticated'] = True
            return redirect('/dashboard/')
        elif user_type == 'wallet' and username == 'wallet123' and password == 'wallet123':
            request.session['user_type'] = 'wallet'
            request.session['is_authenticated'] = True
            return redirect('/dashboard/')
        else:
            return render(request, 'admin_dashboard/login.html', {
                'error_message': 'Invalid credentials'
            })

    return render(request, 'admin_dashboard/login.html')

def logout_view(request):
    request.session.flush()
    return redirect('admin_dashboard:login')

def auth_required(view_func):
    def wrapper(request, *args, **kwargs):
        if not request.session.get('is_authenticated'):
            return redirect('admin_dashboard:login')
        return view_func(request, *args, **kwargs)
    return wrapper

@auth_required
def dashboard(request):
    return render(request, 'admin_dashboard/dashboard.html')

@auth_required
def product_list(request):
    # Products are now loaded directly from Firebase in the template
    return render(request, 'admin_dashboard/product_list.html')

@auth_required
def product_create(request):
    # Product creation is handled by Firebase in the template
    return render(request, 'admin_dashboard/product_form.html')

@auth_required
def product_detail(request, product_id):
    # Product details are loaded directly from Firebase in the template
    return render(request, 'admin_dashboard/product_detail.html')

@auth_required
def product_edit(request, product_id):
    # Redirect to product flag page instead of editing
    return redirect('admin_dashboard:product_flag', product_id=product_id)

@auth_required
def product_flag(request, product_id):
    # Product flagging and notification is handled by Firebase in the template
    return render(request, 'admin_dashboard/product_flag.html', {'product_id': product_id})

@auth_required
def order_list(request):
    # Orders are loaded directly from Firebase in the template
    return render(request, 'admin_dashboard/order_list.html')

@auth_required
def order_detail(request, order_id):
    # Order details are loaded directly from Firebase in the template
    return render(request, 'admin_dashboard/order_detail.html', {'order_id': order_id})

@auth_required
def user_list(request):
    # Users are loaded directly from Firebase in the template
    return render(request, 'admin_dashboard/user_list.html')

@auth_required
def user_detail(request, user_id):
    # User details are loaded directly from Firebase in the template
    return render(request, 'admin_dashboard/user_detail.html', {'user_id': user_id})

@auth_required
def withdrawal_requests(request):
    # Withdrawal requests are loaded directly from Firebase in the template
    return render(request, 'admin_dashboard/withdrawal_requests.html')

@auth_required
def withdrawal_detail(request, withdrawal_id):
    # Withdrawal details are loaded directly from Firebase in the template
    return render(request, 'admin_dashboard/withdrawal_detail.html', {'withdrawal_id': withdrawal_id})

@auth_required
def wallet_manager(request):
    # Wallet balances are loaded directly from Firebase in the template
    return render(request, 'admin_dashboard/wallet_manager.html')

@auth_required
def wallet_transactions(request, wallet_id):
    # Wallet transaction history is loaded directly from Firebase in the template
    return render(request, 'admin_dashboard/wallet_transactions.html', {'wallet_id': wallet_id})

@auth_required
def all_transactions(request):
    # All transactions are loaded directly from Firebase in the template
    return render(request, 'admin_dashboard/all_transactions.html')

@auth_required
def customer_support(request):
    # Customer support dashboard is loaded directly from Firebase in the template
    return render(request, 'admin_dashboard/customer_support.html')

@auth_required
@csrf_exempt
@require_http_methods(["POST"])
def process_withdrawal_request(request):
    """Process a withdrawal request (approve or reject)"""
    try:
        # Log the raw request for debugging
        print(f"Received withdrawal request: {request.body}")
        
        data = json.loads(request.body)
        withdrawal_id = data.get('withdrawalId') or data.get('requestId')  # Support both parameter names
        action = data.get('action')
        reason = data.get('reason', 'Not specified')
        
        # Log the parsed data
        print(f"Parsed data: withdrawal_id={withdrawal_id}, action={action}, reason={reason}")
        
        if not withdrawal_id or not action:
            return JsonResponse({
                'success': False,
                'message': 'Missing required parameters'
            }, status=400)
        
        # We're not using server-side Firebase operations or Chapa API
        # Just return success response for client-side processing
        
        if action == 'approve':
            return JsonResponse({
                'success': True,
                'message': 'Withdrawal request approved successfully',
                'data': {
                    'withdrawalId': withdrawal_id,
                    'action': action,
                    'status': 'completed'
                }
            })
        elif action == 'reject':
            return JsonResponse({
                'success': True,
                'message': 'Withdrawal request rejected successfully',
                'data': {
                    'withdrawalId': withdrawal_id,
                    'action': action,
                    'status': 'rejected',
                    'reason': reason
                }
            })
        else:
            return JsonResponse({
                'success': False,
                'message': f'Invalid action: {action}'
            }, status=400)
            
    except json.JSONDecodeError as json_error:
        print(f"JSON decode error: {str(json_error)}")
        return JsonResponse({
            'success': False,
            'message': f'Invalid JSON in request: {str(json_error)}'
        }, status=400)
    except Exception as e:
        print(f"Unexpected error in process_withdrawal_request: {str(e)}")
        return JsonResponse({
            'success': False,
            'message': f'Error processing withdrawal request: {str(e)}'
        }, status=500)
