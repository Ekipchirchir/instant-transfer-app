from django.contrib import admin
from .models import UserAccount, Wallet,Transaction, Currency

# Register your models here.
admin.site.register(UserAccount)
admin.site.register(Wallet)
admin.site.register(Transaction)
admin.site.register(Currency)
