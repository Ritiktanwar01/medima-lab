from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
import uuid
import datetime

class UserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not username:
            raise ValueError('The Username field must be set')
        if not email:
            raise ValueError('The Email field must be set')
        
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        
        return self.create_user(username, email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    labName = models.CharField(max_length=255)
    pharmacyName = models.CharField(max_length=255, blank=True, default='')
    address = models.CharField(max_length=255, blank=True, default='')
    phone = models.CharField(max_length=20, blank=True, default='')
    website = models.CharField(max_length=255, blank=True, default='')
    gstNumber = models.CharField(max_length=50, blank=True, default='')
    printerName = models.CharField(max_length=100, blank=True, default='')
    role = models.CharField(max_length=20, default='user')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'labName']
    
    def __str__(self):
        return self.username

class Doctor(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    specialization = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    address = models.TextField(blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='doctors')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class NormalRange(models.Model):
    gender = models.CharField(max_length=10, choices=[
        ('male', 'Male'),
        ('female', 'Female'),
        ('child', 'Child'),
        ('all', 'All')
    ])
    minAge = models.IntegerField(default=0)
    maxAge = models.IntegerField(default=150)
    minValue = models.CharField(max_length=50)
    maxValue = models.CharField(max_length=50)
    unit = models.CharField(max_length=50)
    
    def __str__(self):
        return f"{self.minValue}-{self.maxValue} {self.unit} ({self.gender})"

class Parameter(models.Model):
    name = models.CharField(max_length=255)
    normal_ranges = models.ManyToManyField(NormalRange, related_name='parameters')
    
    def __str__(self):
        return self.name

class Test(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, blank=True)
    groupName = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    parameters = models.ManyToManyField(Parameter, related_name='tests')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tests')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class Patient(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    age = models.IntegerField()
    gender = models.CharField(max_length=10, choices=[
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other')
    ])
    mobile = models.CharField(max_length=20)
    whatsapp = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, blank=True, related_name='patients')
    doctorName = models.CharField(max_length=255, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='patients')
    registeredDate = models.DateTimeField(default=timezone.now)
    paymentType = models.CharField(max_length=10, choices=[
        ('prepaid', 'Prepaid'),
        ('postpaid', 'Postpaid')
    ], default='prepaid')
    registrationAmount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    totalAmount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    paidAmount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class TestResult(models.Model):
    parameter = models.CharField(max_length=255)
    value = models.CharField(max_length=255)
    unit = models.CharField(max_length=50, blank=True)
    normalRange = models.CharField(max_length=100, blank=True)
    
    def __str__(self):
        return f"{self.parameter}: {self.value}"

class TestInReport(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='test_reports')
    testName = models.CharField(max_length=255)
    results = models.ManyToManyField(TestResult, related_name='test_in_reports')
    
    def __str__(self):
        return self.testName

class Report(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reportId = models.CharField(max_length=20, unique=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='reports')
    patientName = models.CharField(max_length=255)
    doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, blank=True, related_name='reports')
    doctorName = models.CharField(max_length=255, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports')
    date = models.DateTimeField(default=timezone.now)
    tests = models.ManyToManyField(TestInReport, related_name='reports')
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('in-progress', 'In Progress'),
        ('completed', 'Completed')
    ], default='pending')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        if not self.reportId:
            date = timezone.now()
            year = date.strftime('%y')
            month = date.strftime('%m')
            day = date.strftime('%d')
            
            # Count reports created today by this user
            count = Report.objects.filter(
                user=self.user,
                created_at__date=date.date()
            ).count()
            
            # Format: REP-YYMMDD-001
            self.reportId = f"REP-{year}{month}{day}-{str(count + 1).zfill(3)}"
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.reportId

class TestInReceipt(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='test_receipts', null=True)
    testName = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return self.testName

class Receipt(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    receiptId = models.CharField(max_length=20, unique=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='receipts')
    patientName = models.CharField(max_length=255)
    date = models.DateTimeField(default=timezone.now)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    paymentMethod = models.CharField(max_length=50, choices=[
        ('Cash', 'Cash'),
        ('Credit Card', 'Credit Card'),
        ('Debit Card', 'Debit Card'),
        ('UPI', 'UPI'),
        ('Online', 'Online'),
        ('Other', 'Other')
    ], default='Cash')
    tests = models.ManyToManyField(TestInReceipt, related_name='receipts')
    status = models.CharField(max_length=20, choices=[
        ('Paid', 'Paid'),
        ('Partial', 'Partial'),
        ('Pending', 'Pending')
    ], default='Paid')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='receipts')
    report = models.ForeignKey(Report, on_delete=models.SET_NULL, null=True, blank=True, related_name='receipts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        if not self.receiptId:
            date = timezone.now()
            year = date.strftime('%y')
            month = date.strftime('%m')
            day = date.strftime('%d')
            
            # Count receipts created today by this user
            count = Receipt.objects.filter(
                user=self.user,
                created_at__date=date.date()
            ).count()
            
            # Format: REC-YYMMDD-001
            self.receiptId = f"REC-{year}{month}{day}-{str(count + 1).zfill(3)}"
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.receiptId