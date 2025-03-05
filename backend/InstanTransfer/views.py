from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import viewsets, generics
from .models import UserAccount, Wallet, Transaction,Currency
from .serializers import UserAccountSerializer, WalletSerializer,TransactionSerializer, CurrencySerializer, UserRegistrationSerializer
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deposit(request):
    """Deposit money into the user's wallet."""
    amount = request.data.get("amount")

    if not amount or float(amount) <= 0:
        return Response({"error": "Invalid amount"}, status=status.HTTP_400_BAD_REQUEST)

    user_wallet, created = Wallet.objects.get_or_create(user=request.user)
    user_wallet.balance += float(amount)
    user_wallet.save()

    transaction = Transaction.objects.create(
        user=request.user,
        transaction_type="deposit",
        amount=amount,
        status="completed"
    )

    return Response({"message": "Deposit successful", "transaction": TransactionSerializer(transaction).data}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def withdraw(request):
    """Withdraw money from the user's wallet."""
    amount = request.data.get("amount")

    if not amount or float(amount) <= 0:
        return Response({"error": "Invalid amount"}, status=status.HTTP_400_BAD_REQUEST)

    user_wallet = Wallet.objects.filter(user=request.user).first()
    if not user_wallet or user_wallet.balance < float(amount):
        return Response({"error": "Insufficient balance"}, status=status.HTTP_400_BAD_REQUEST)

    user_wallet.balance -= float(amount)
    user_wallet.save()

    transaction = Transaction.objects.create(
        user=request.user,
        transaction_type="withdraw",
        amount=amount,
        status="completed"
    )

    return Response({"message": "Withdrawal successful", "transaction": TransactionSerializer(transaction).data}, status=status.HTTP_201_CREATED)

class UserAccountViewSet(viewsets.ModelViewSet):
    queryset = UserAccount.objects.all()
    serializer_class = UserAccountSerializer

class WalletViewSet(viewsets.ModelViewSet):
    queryset = Wallet.objects.all()
    serializer_class = WalletSerializer

class TransactionViewSet(viewsets.ModelViewSet):
    queryset =Transaction.objects.all()
    serializer_class =TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

class CurrencyViewSet(viewsets.ModelViewSet):
    queryset = Currency.objects.all()
    serializer_class = CurrencySerializer

class RegisterUserView(generics.CreateAPIView):
    queryset = UserAccount.objects.all()
    serializer_class = UserAccountSerializer
    permission_classes = []