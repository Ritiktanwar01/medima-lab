from django.contrib import admin
from .models import User, Doctor, Test, Patient, Report, Receipt

admin.site.register(User)
admin.site.register(Doctor)
admin.site.register(Test)
admin.site.register(Patient)
admin.site.register(Report)
admin.site.register(Receipt)