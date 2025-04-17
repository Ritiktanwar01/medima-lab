from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from .models import (
    User, Doctor, Test, Patient, Report, Receipt,
    Parameter, NormalRange, TestResult, TestInReport, TestInReceipt
)
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer,
    DoctorSerializer, TestSerializer, PatientSerializer,
    ReportSerializer, ReceiptSerializer
)

# Authentication views
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    print(request.data)
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'success': True,
            'token': str(refresh.access_token),
            'user': {
                'id': str(user.id),
                'name': user.username,
                'email': user.email,
                'labName': user.labName,
                'role': user.role
            }
        })
    return Response({'success': False, 'message': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        
        user = authenticate(username=username, password=password)
        
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'success': True,
                'token': str(refresh.access_token),
                'user': {
                    'id': str(user.id),
                    'name': user.username,
                    'email': user.email,
                    'labName': user.labName,
                    'role': user.role
                }
            })
        return Response({'success': False, 'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    return Response({'success': False, 'message': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

# Admin authentication
@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    # Check if admin user exists
    try:
        admin = User.objects.get(username=username, role='admin')
    except User.DoesNotExist:
        # If admin doesn't exist, create one with the provided credentials (only for first login)
        admin_count = User.objects.filter(role='admin').count()
        
        if admin_count == 0 and username == 'ritik' and password == 'jaat':
            admin = User.objects.create_user(
                username=username,
                password=password,
                email='admin@medima.com',
                labName='Medima Admin',
                role='admin'
            )
        else:
            return Response({'success': False, 'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    
    # Verify password
    user = authenticate(username=username, password=password)
    if not user or user.role != 'admin':
        return Response({'success': False, 'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    
    # Create token
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'success': True,
        'token': str(refresh.access_token),
        'user': {
            'id': str(user.id),
            'username': user.username,
            'role': user.role
        }
    })

# Doctor views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def doctor_list(request):
    if request.method == 'GET':
        search = request.query_params.get('search', '')
        
        if search:
            doctors = Doctor.objects.filter(
                user=request.user,
                name__icontains=search
            ) | Doctor.objects.filter(
                user=request.user,
                specialization__icontains=search
            )
        else:
            doctors = Doctor.objects.filter(user=request.user)
        
        serializer = DoctorSerializer(doctors, many=True)
        print(serializer.data)
        return Response({'success': True, 'data': serializer.data})
    
    elif request.method == 'POST':
        serializer = DoctorSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'data': serializer.data}, status=status.HTTP_201_CREATED)
        return Response({'success': False, 'message': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def doctor_detail(request, pk):
    doctor = get_object_or_404(Doctor, id=pk, user=request.user)
    
    if request.method == 'GET':
        serializer = DoctorSerializer(doctor)
        return Response({'success': True, 'data': serializer.data})
    
    elif request.method == 'PUT':
        serializer = DoctorSerializer(doctor, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'data': serializer.data})
        return Response({'success': False, 'message': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        doctor.delete()
        return Response({'success': True, 'data': {}}, status=status.HTTP_204_NO_CONTENT)

# Test views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def test_list(request):
    if request.method == 'GET':
        search = request.query_params.get('search', '')
        group = request.query_params.get('group', '')
        
        tests = Test.objects.filter(user=request.user)
        
        if search:
            tests = tests.filter(name__icontains=search) | tests.filter(code__icontains=search)
        
        if group:
            tests = tests.filter(groupName__icontains=group)
        
        serializer = TestSerializer(tests, many=True)
        groups = Test.objects.filter(user=request.user).values_list('groupName', flat=True).distinct()
        
        return Response({
            'success': True, 
            'data': serializer.data,
            'groups': groups
        })
    
    elif request.method == 'POST':
        serializer = TestSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'data': serializer.data}, status=status.HTTP_201_CREATED)
        return Response({'success': False, 'message': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def test_detail(request, pk):
    test = get_object_or_404(Test, id=pk, user=request.user)
    
    if request.method == 'GET':
        serializer = TestSerializer(test)
        return Response({'success': True, 'data': serializer.data})
    
    elif request.method == 'PUT':
        serializer = TestSerializer(test, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'data': serializer.data})
        return Response({'success': False, 'message': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        test.delete()
        return Response({'success': True, 'data': {}}, status=status.HTTP_204_NO_CONTENT)

# Patient views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def patient_list(request):
    if request.method == 'GET':
        search = request.query_params.get('search', '')
        
        if search:
            patients = Patient.objects.filter(
                user=request.user,
                name__icontains=search
            ) | Patient.objects.filter(
                user=request.user,
                mobile__icontains=search
            ) | Patient.objects.filter(
                user=request.user,
                email__icontains=search
            )
        else:
            patients = Patient.objects.filter(user=request.user)
        
        serializer = PatientSerializer(patients, many=True)
        return Response({'success': True, 'data': serializer.data})
    
    elif request.method == 'POST':
        serializer = PatientSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'data': serializer.data}, status=status.HTTP_201_CREATED)
        return Response({'success': False, 'message': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def patient_detail(request, pk):
    patient = get_object_or_404(Patient, id=pk, user=request.user)
    
    if request.method == 'GET':
        serializer = PatientSerializer(patient)
        return Response({'success': True, 'data': serializer.data})
    
    elif request.method == 'PUT':
        serializer = PatientSerializer(patient, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'data': serializer.data})
        return Response({'success': False, 'message': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        patient.delete()
        return Response({'success': True, 'data': {}}, status=status.HTTP_204_NO_CONTENT)

# Report views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def report_list(request):
    if request.method == 'GET':
        search = request.query_params.get('search', '')
        status_filter = request.query_params.get('status', '')
        
        reports = Report.objects.filter(user=request.user)
        
        if search:
            reports = reports.filter(
                reportId__icontains=search
            ) | reports.filter(
                patientName__icontains=search
            )
        
        if status_filter and status_filter != 'all':
            reports = reports.filter(status=status_filter)
        
        serializer = ReportSerializer(reports, many=True)
        return Response({'success': True, 'data': serializer.data})
    
    elif request.method == 'POST':
        serializer = ReportSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'data': serializer.data}, status=status.HTTP_201_CREATED)
        return Response({'success': False, 'message': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def report_detail(request, pk):
    report = get_object_or_404(Report, id=pk, user=request.user)
    
    if request.method == 'GET':
        serializer = ReportSerializer(report)
        return Response({'success': True, 'data': serializer.data})
    
    elif request.method == 'PUT':
        serializer = ReportSerializer(report, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'data': serializer.data})
        return Response({'success': False, 'message': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        report.delete()
        return Response({'success': True, 'data': {}}, status=status.HTTP_204_NO_CONTENT)

# Receipt views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def receipt_list(request):
    if request.method == 'GET':
        search = request.query_params.get('search', '')
        
        receipts = Receipt.objects.filter(user=request.user)
        
        if search:
            receipts = receipts.filter(
                receiptId__icontains=search
            ) | receipts.filter(
                patientName__icontains=search
            )
        
        serializer = ReceiptSerializer(receipts, many=True)
        return Response({'success': True, 'data': serializer.data})
    
    elif request.method == 'POST':
        serializer = ReceiptSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'data': serializer.data}, status=status.HTTP_201_CREATED)
        return Response({'success': False, 'message': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def receipt_detail(request, pk):
    receipt = get_object_or_404(Receipt, id=pk, user=request.user)
    
    if request.method == 'GET':
        serializer = ReceiptSerializer(receipt)
        return Response({'success': True, 'data': serializer.data})
    
    elif request.method == 'PUT':
        serializer = ReceiptSerializer(receipt, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'data': serializer.data})
        return Response({'success': False, 'message': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        receipt.delete()
        return Response({'success': True, 'data': {}}, status=status.HTTP_204_NO_CONTENT)

# Lab info views
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def lab_info(request):
    user = request.user
    
    if request.method == 'GET':
        lab_info = {
            'labName': user.labName,
            'pharmacyName': user.pharmacyName,
            'address': user.address,
            'phone': user.phone,
            'email': user.email,
            'website': user.website,
            'gstNumber': user.gstNumber,
        }
        return Response({'success': True, 'data': lab_info})
    
    elif request.method == 'PUT':
        user.labName = request.data.get('labName', user.labName)
        user.pharmacyName = request.data.get('pharmacyName', user.pharmacyName)
        user.address = request.data.get('address', user.address)
        user.phone = request.data.get('phone', user.phone)
        user.email = request.data.get('email', user.email)
        user.website = request.data.get('website', user.website)
        user.gstNumber = request.data.get('gstNumber', user.gstNumber)
        user.save()
        
        serializer = UserSerializer(user)
        return Response({'success': True, 'data': serializer.data})