from rest_framework import serializers
from .models import UserAccount, Wallet, Transaction, Currency
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from django.conf import settings
from django.urls import reverse
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import ValidationError


class UserAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAccount
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = UserAccount.objects.create_user(**validated_data)
        return user

class WalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wallet
        fields = ['id', 'user', 'balance', 'currency']

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'user', 'transaction_type', 'amount', 'date', 'status']

class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields =['id', 'code', 'name', 'exchange_rate' ]

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only =True)
    class Meta:
        model = UserAccount
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        user = UserAccount.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return UserAccount 
    
class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            user = UserAccount.objects.get(email=value)
        except UserAccount.DoesNotExist:
            raise serializers.ValidationError("User with this email does not exist.")

        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"

        send_mail(
            subject="Password Reset Request",
            message=f"Click the link below to reset your password:\n{reset_url}",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[user.email],
            fail_silently=False,
        )

        return value
    
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        email = attrs.get("email")  # Accept "email" instead of "username"
        password = attrs.get("password")

        if not email or not password:
            raise ValidationError({"error": "Email and password are required."})

        try:
            user = UserAccount.objects.get(email=email)
        except UserAccount.DoesNotExist:
            raise ValidationError({"email": ["User does not exist"]})

        if not user.check_password(password):
            raise ValidationError({"password": ["Incorrect password"]})

        attrs["username"] = user.username  # Django still requires "username"
        return super().validate(attrs)