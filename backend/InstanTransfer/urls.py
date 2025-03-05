from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserAccountViewSet, WalletViewSet,TransactionViewSet,CurrencyViewSet, RegisterUserView, deposit, withdraw

router = DefaultRouter()
router.register(r'users',UserAccountViewSet)
router.register(r'wallets', WalletViewSet)
router.register(r'transactions', TransactionViewSet)
router.register(r'currencies', CurrencyViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterUserView.as_view(), name='register'),
    path('deposit/', deposit, name = 'deposit'),
    path('withdraw/', withdraw, name= 'withdraw'),
]