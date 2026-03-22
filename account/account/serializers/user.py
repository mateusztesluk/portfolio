from rest_framework import serializers
from django.contrib.auth.models import User

from .profile import ProfileSerializer


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'is_superuser', 'profile', 'id')
        read_only_fields = ('is_superuser', )


class PublicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username')
