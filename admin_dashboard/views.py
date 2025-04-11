from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .models import Product
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
def user_list(request):
    # Users are loaded directly from Firebase in the template
    return render(request, 'admin_dashboard/user_list.html')

@auth_required
def user_detail(request, user_id):
    # User details are loaded directly from Firebase in the template
    return render(request, 'admin_dashboard/user_detail.html', {'user_id': user_id})
