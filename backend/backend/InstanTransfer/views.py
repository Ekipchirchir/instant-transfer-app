from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import viewsets, generics
from .models import UserAccount, Wallet, Transaction,Currency
from .serializers import UserAccountSerializer, WalletSerializer,TransactionSerializer, CurrencySerializer, UserRegistrationSerializer, PasswordResetSerializer
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated
from decimal import Decimal
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework.views import APIView
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
import requests
from rest_framework import serializers
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from InstanTransfer import serializers
from .serializers import CustomTokenObtainPairSerializer
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from .models import Transaction


@api_view(['POST'])
def test_view(request):
    print("🚀 API HIT! Request Data:", request.data)  # Debugging log
    return Response({"message": "Received"}, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deposit(request):
    """Deposit money into the user's wallet."""
    amount = request.data.get("amount")

    if not amount:
        return Response({"error": "Amount is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        amount = Decimal(amount)  # Convert amount to Decimal
        if amount <= 0:
            return Response({"error": "Invalid deposit amount"}, status=status.HTTP_400_BAD_REQUEST)
    except:
        return Response({"error": "Invalid amount format"}, status=status.HTTP_400_BAD_REQUEST)

    user_wallet, created = Wallet.objects.get_or_create(user=request.user)
    user_wallet.balance += amount  # Decimal calculation
    user_wallet.save()

    transaction = Transaction.objects.create(
        user=request.user,
        transaction_type="deposit",
        amount=amount,
        status="completed"
    )

    return Response({
        "message": "Deposit successful",
        "transaction": TransactionSerializer(transaction).data
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def withdraw(request):
    """Withdraw money from the user's wallet."""
    amount = request.data.get("amount")

    if not amount or float(amount) <= 0:
        return Response({"error": "Invalid amount"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        amount = Decimal(amount)  # Convert amount to Decimal
    except:
        return Response({"error": "Invalid amount format"}, status=status.HTTP_400_BAD_REQUEST)

    user_wallet = Wallet.objects.filter(user=request.user).first()
    if not user_wallet or user_wallet.balance < amount:
        return Response({"error": "Insufficient balance"}, status=status.HTTP_400_BAD_REQUEST)

    user_wallet.balance -= amount  # Fix: Now both are Decimals
    user_wallet.save()

    transaction = Transaction.objects.create(
        user=request.user,
        transaction_type="withdraw",
        amount=amount,
        status="completed"
    )

    return Response(
        {"message": "Withdrawal successful", "transaction": TransactionSerializer(transaction).data}, 
        status=status.HTTP_201_CREATED
    )



@api_view(["GET"])
@permission_classes([IsAuthenticated])  # ✅ Requires authentication
def transactions(request):
    """
    Fetch all transactions for the logged-in user.
    """
    user = request.user  # ✅ Ensure user is authenticated
    transactions = Transaction.objects.filter(user=user).order_by("-date")
    serializer = TransactionSerializer(transactions, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def transaction_list(request):
    transactions = Transaction.objects.filter(user=request.user).order_by('-date')
    data = [{"id": t.id, "amount": t.amount, "status": t.status, "transaction_type": t.transaction_type, "date": t.date} for t in transactions]
    return JsonResponse(data, safe=False)

@api_view(['POST'])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')

    try:
        user = UserAccount.objects.get(email=email)
    except UserAccount.DoesNotExist:
        return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=user.username, password=password)

    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        })
    else:
        return Response({"error": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)



@api_view(["POST"])
def convert_currency(request):
    """Converts an amount from one currency to another using live exchange rates."""
    from_currency = request.data.get("from_currency")
    to_currency = request.data.get("to_currency")
    amount = request.data.get("amount")

    if not from_currency or not to_currency or not amount:
        return Response({"error": "Missing required fields"}, status=400)

    try:
        amount = float(amount)
    except ValueError:
        return Response({"error": "Invalid amount"}, status=400)

    # Fetch live exchange rates
    api_url = f"{settings.EXCHANGE_RATE_API_URL}/{settings.EXCHANGE_RATE_API_KEY}/latest/{from_currency}"
    response = requests.get(api_url)
    
    if response.status_code != 200:
        return Response({"error": "Failed to fetch exchange rates"}, status=500)

    data = response.json()
    exchange_rate = data.get("conversion_rates", {}).get(to_currency)

    if not exchange_rate:
        return Response({"error": "Invalid currency code"}, status=400)

    converted_amount = amount * exchange_rate

    return Response({
        "from_currency": from_currency,
        "to_currency": to_currency,
        "amount": amount,
        "converted_amount": round(converted_amount, 2),
        "exchange_rate": exchange_rate
    }, status=200)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_details(request):
    """Fetch the logged-in user's details, including username, account number, and balance."""
    user = request.user
    wallet = Wallet.objects.filter(user=user).first()

    return Response({
        "username": user.username,
        "account_number": f"ACCT-{user.id:06d}",  # Generate derived account number
        "balance": wallet.balance if wallet else 0.00
    }, status=status.HTTP_200_OK)


class UserAccountViewSet(viewsets.ModelViewSet):
    queryset = UserAccount.objects.all()
    serializer_class = UserAccountSerializer

class WalletViewSet(viewsets.ModelViewSet):
    queryset = Wallet.objects.all()
    serializer_class = WalletSerializer

from rest_framework.permissions import IsAuthenticated

class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]  # ✅ Ensure this is present

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)  # ✅ Ensures user sees only their transactions



class CurrencyViewSet(viewsets.ModelViewSet):
    queryset = Currency.objects.all()
    serializer_class = CurrencySerializer

    def update_exhange_rates(self):
        API_URL = "https://api.exchangerate-api.com/v4/latest/USD" 
        response =  requests.get(API_URL)
        if response.status_code ==200:
            data = response.json()
            for code, rate in data ["rates"].items():
                Currency.objects.update_or_create(code = code, defaults={"excahange_rate": rate})


class RegisterUserView(generics.CreateAPIView):
    queryset = UserAccount.objects.all()
    serializer_class = UserAccountSerializer
    permission_classes = []

class PasswordResetRequestView(APIView):
    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            return Response({"message": "Password reset link sent to email."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(APIView):
    def post(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError):
            return Response({"error": "Invalid reset link."}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"error": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        new_password = request.data.get("password")
        user.set_password(new_password)
        user.save()
        return Response({"message": "Password has been reset successfully."}, status=status.HTTP_200_OK)
    
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        email = attrs.get("email")  # Expecting "email" instead of "username"
        password = attrs.get("password")

        print("Received login request:", attrs)  # Debug log

        if not email or not password:
            print("❌ Missing email or password")
            raise ValidationError({"error": "Email and password are required."})

        try:
            user = UserAccount.objects.get(email=email)
            print("✅ User found:", user)
        except UserAccount.DoesNotExist:
            print("❌ User not found:", email)
            raise ValidationError({"email": ["User does not exist"]})

        if not user.check_password(password):
            print("❌ Incorrect password for:", email)
            raise ValidationError({"password": ["Incorrect password"]})

        attrs["username"] = user.username  # Assign username for Django's JWT
        print("✅ Authentication successful for:", user.username)
        return super().validate(attrs)
    
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer