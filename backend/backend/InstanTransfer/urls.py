from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserAccountViewSet, WalletViewSet,TransactionViewSet,CurrencyViewSet, RegisterUserView, deposit, withdraw, login_view, PasswordResetRequestView, PasswordResetConfirmView, convert_currency



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
    path('login/', login_view, name='login'),
    path('password-reset/', PasswordResetRequestView.as_view(), name="password_reset"),
    path('password-reset-confirl/<uid64>/<token>/', PasswordResetConfirmView.as_view(), name="password_reset_confirm"),
    path('convert-currency/', convert_currency, name="convert_currency"),
]
