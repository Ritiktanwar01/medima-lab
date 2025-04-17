from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('auth/signup/', views.register_user, name='register'),
    path('auth/login/', views.login_user, name='login'),
    path('admin/auth/', views.admin_login, name='admin_login'),
    
    # Doctors
    path('doctors/', views.doctor_list, name='doctor_list'),
    path('doctors/<str:pk>/', views.doctor_detail, name='doctor_detail'),
    
    # Tests
    path('tests/', views.test_list, name='test_list'),
    path('tests/<str:pk>/', views.test_detail, name='test_detail'),
    
    # Patients
    path('patients/', views.patient_list, name='patient_list'),
    path('patients/<str:pk>/', views.patient_detail, name='patient_detail'),
    
    # Reports
    path('reports/', views.report_list, name='report_list'),
    path('reports/<str:pk>/', views.report_detail, name='report_detail'),
    
    # Receipts
    path('receipts/', views.receipt_list, name='receipt_list'),
    path('receipts/<str:pk>/', views.receipt_detail, name='receipt_detail'),
    
    # Settings
    path('settings/lab-info/', views.lab_info, name='lab_info'),
]