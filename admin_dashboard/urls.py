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
    path('users/', views.user_list, name='user_list'),
    path('users/<str:user_id>/', views.user_detail, name='user_detail'),
]
