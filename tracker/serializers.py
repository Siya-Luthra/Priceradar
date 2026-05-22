from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from .models import Watchlist, PriceAlert, Variant, Product, Website

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            validated_data['username'],
            validated_data.get('email', ''),
            validated_data['password']
        )
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Incorrect Credentials")

class WatchlistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Watchlist
        fields = ('id', 'user', 'variant', 'added_at')
        read_only_fields = ('user',)

    def validate(self, attrs):
        # We need to make sure we don't bypass unique constraints on update
        user = self.context['request'].user
        variant = attrs.get('variant')
        
        # In DRF, unique together can also be validated by validators on Meta, 
        # but custom validation is more flexible.
        if Watchlist.objects.filter(user=user, variant=variant).exists():
            # If it's an update, checking identity is important, but typically watchlist is post/delete.
            if self.instance and self.instance.variant == variant:
                return attrs
            raise serializers.ValidationError("This variant is already in your watchlist.")
        return attrs

class PriceAlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = PriceAlert
        fields = ('id', 'user', 'variant', 'target_price', 'is_active', 'channel', 'created_at')
        read_only_fields = ('user',)

    def validate_target_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Target price must be strictly positive.")
        return value

class VariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Variant
        fields = ('id', 'attributes', 'product_url', 'current_price', 'is_tracked')

class ProductSerializer(serializers.ModelSerializer):
    variants = VariantSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = ('id', 'name', 'category', 'description', 'image_url', 'created_at', 'variants')
