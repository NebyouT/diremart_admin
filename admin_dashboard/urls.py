from django.urls import path
from . import views

app_name = 'admin_dashboard'

urlpatterns = [
    path('', views.login_view, name='login'),  # Make login the default view
    path('dashboard/', views.dashboard, name='dashboard'),
    path('logout/', views.logout_view, name='logout'),
    path('products/', views.product_list, name='product_list'),
    path('products/create/', views.product_create, name='product_create'),
    path('products/<str:product_id>/', views.product_detail, name='product_detail'),
    path('products/<str:product_id>/edit/', views.product_edit, name='product_edit'),
    path('products/<str:product_id>/flag/', views.product_flag, name='product_flag'),
    path('orders/', views.order_list, name='order_list'),
    path('orders/<str:order_id>/', views.order_detail, name='order_detail'),
    path('users/', views.user_list, name='user_list'),
    path('users/<str:user_id>/', views.user_detail, name='user_detail'),
    path('withdrawals/', views.withdrawal_requests, name='withdrawal_requests'),
    path('withdrawals/<str:withdrawal_id>/', views.withdrawal_detail, name='withdrawal_detail'),
    path('process-withdrawal/', views.process_withdrawal_request, name='process_withdrawal'),
    path('wallets/', views.wallet_manager, name='wallet_manager'),
    path('wallets/<str:wallet_id>/transactions/', views.wallet_transactions, name='wallet_transactions'),
    path('transactions/', views.all_transactions, name='all_transactions'),
    path('customer-support/', views.customer_support, name='customer_support'),
]
