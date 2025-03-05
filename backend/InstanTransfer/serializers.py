from rest_framework import serializers
from .models import UserAccount, Wallet, Transaction, Currency

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