from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import (
    Doctor, Test, Patient, Report, Receipt, 
    Parameter, NormalRange, TestResult, TestInReport, TestInReceipt
)

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'labName', 'pharmacyName', 'address', 'phone', 'website', 'gstNumber', 'printerName', 'role']
        read_only_fields = ['id']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'labName']
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

class NormalRangeSerializer(serializers.ModelSerializer):
    class Meta:
        model = NormalRange
        fields = ['id', 'gender', 'minAge', 'maxAge', 'minValue', 'maxValue', 'unit']

class ParameterSerializer(serializers.ModelSerializer):
    normal_ranges = NormalRangeSerializer(many=True, read_only=True)
    
    class Meta:
        model = Parameter
        fields = ['id', 'name', 'normal_ranges']

class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = ['id', 'name', 'specialization', 'phone', 'email', 'address']
    
    def create(self, validated_data):
        user = self.context['request'].user
        doctor = Doctor.objects.create(user=user, **validated_data)
        return doctor

class TestSerializer(serializers.ModelSerializer):
    parameters = ParameterSerializer(many=True, read_only=True)
    
    class Meta:
        model = Test
        fields = ['id', 'name', 'code', 'groupName', 'price', 'parameters']
    
    def create(self, validated_data):
        user = self.context['request'].user
        test = Test.objects.create(user=user, **validated_data)
        return test

class PatientSerializer(serializers.ModelSerializer):
    doctor = serializers.PrimaryKeyRelatedField(queryset=Doctor.objects.all(), required=False, allow_null=True)
    
    class Meta:
        model = Patient
        fields = [
            'id', 'name', 'age', 'gender', 'mobile', 'whatsapp', 'email',
            'doctor', 'doctorName', 'registeredDate', 'paymentType',
            'registrationAmount', 'totalAmount', 'paidAmount', 'balance'
        ]
    
    def create(self, validated_data):
        user = self.context['request'].user
        doctor = validated_data.pop('doctor', None)
        
        if doctor:
            validated_data['doctorName'] = doctor.name
        
        patient = Patient.objects.create(user=user, **validated_data)
        return patient

class TestResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestResult
        fields = ['id', 'parameter', 'value', 'unit', 'normalRange']

class TestInReportSerializer(serializers.ModelSerializer):
    results = TestResultSerializer(many=True, read_only=True)
    
    class Meta:
        model = TestInReport
        fields = ['id', 'test', 'testName', 'results']

class ReportSerializer(serializers.ModelSerializer):
    tests = TestInReportSerializer(many=True, read_only=True)
    
    class Meta:
        model = Report
        fields = [
            'id', 'reportId', 'patient', 'patientName', 'doctor', 'doctorName',
            'date', 'tests', 'status', 'notes'
        ]
    
    def create(self, validated_data):
        user = self.context['request'].user
        report = Report.objects.create(user=user, **validated_data)
        return report

class TestInReceiptSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestInReceipt
        fields = ['id', 'test', 'testName', 'price']

class ReceiptSerializer(serializers.ModelSerializer):
    tests = TestInReceiptSerializer(many=True, read_only=True)
    
    class Meta:
        model = Receipt
        fields = [
            'id', 'receiptId', 'patient', 'patientName', 'date',
            'amount', 'paymentMethod', 'tests', 'status', 'report'
        ]
    
    def create(self, validated_data):
        user = self.context['request'].user
        receipt = Receipt.objects.create(user=user, **validated_data)
        return receipt