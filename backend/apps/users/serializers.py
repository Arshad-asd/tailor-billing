from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'phone', 'role', 'is_active', 'date_joined']
        read_only_fields = ['id', 'date_joined']
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Ensure role is included in the response
        data['role'] = instance.role
        return data


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'name', 'phone', 'role', 'password', 'confirm_password']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if not email:
            raise serializers.ValidationError({'email': 'Email is required.'})
        
        if not password:
            raise serializers.ValidationError({'password': 'Password is required.'})

        if email and password:
            user = authenticate(email=email, password=password)
            if not user:
                raise serializers.ValidationError({
                    'non_field_errors': 'Invalid email or password. Please check your credentials and try again.'
                })
            if not user.is_active:
                raise serializers.ValidationError({
                    'non_field_errors': 'Account is disabled. Please contact support.'
                })
            attrs['user'] = user
        else:
            raise serializers.ValidationError({
                'non_field_errors': 'Email and password are required.'
            })

        return attrs
