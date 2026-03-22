from django.contrib.auth.models import User
from rest_framework.serializers import ValidationError

from account.serializers.user import PublicUserSerializer, UserSerializer
from account.models import Profile


class UserService:
    """
    Service to manage all data related with user and profile
    """

    def create_user(self, user_data):
        profile_data = user_data.pop('profile', None)
        password = user_data.pop('password', '')

        user = User.objects.create(**user_data)
        user.set_password(password)
        user.save()

        if profile_data:
            profile = user.profile
            profile.location = profile_data.get('location', '')
            profile.facebook_name = profile_data.get('facebook_name', '')
            profile.facebook_id = profile_data.get('facebook_id', '')
            profile.save()

        serializer = UserSerializer(user)
        return serializer.data

    def update_user(self, user_id: int, data: dict):
        profile_data = data.pop('profile', None)

        user_instance = User.objects.get(id=user_id)
        user_instance.username = data.get('username', user_instance.username)
        user_instance.first_name = data.get('first_name', user_instance.first_name)
        user_instance.last_name = data.get('last_name', user_instance.last_name)
        user_instance.email = data.get('email', user_instance.email)
        user_instance.is_superuser = data.get('is_superuser', user_instance.is_superuser)
        user_instance.save()

        if profile_data:
            profile_instance = user_instance.profile
            profile_instance.location = profile_data.get('location', profile_instance.location)
            profile_instance.facebook_id = profile_data.get('facebook_id', profile_instance.facebook_id)
            profile_instance.facebook_name = profile_data.get('facebook_name', profile_instance.facebook_name)
            profile_instance.save()

        serializer = UserSerializer(user_instance)
        return serializer.data

    def remove_user(self, user_id: int):
        user = User.objects.get(id=user_id)
        user.delete()

    def get_user(self, user_id: int):
        user = User.objects.get(id=user_id)
        serializer = UserSerializer(user)
        return serializer.data

    def sign_in(self, user: User):
        token = WebToken.objects.get(user=user)
        return token.key

    def fb_account_exists(self, fb_id: str):
        user_exist = Profile.objects.filter(facebook_id=fb_id).exists()
        return user_exist

    def get_users(self, filters=None, profile_filters=None, ordering=None):
        filters = self._format_model_filters(filters) if filters else {}
        profile_filters = self._format_model_filters(profile_filters, 'profile') if profile_filters else {}
        queryset = User.objects.filter(**filters, **profile_filters)
        queryset = queryset.order_by(ordering) if ordering else queryset
        serializer = PublicUserSerializer(queryset, many=True)
        return serializer.data

    def _format_model_filters(self, filters: dict, prefix: str = None):
        base_key = '{}__'.format(prefix) if prefix else ''
        formatted_dict = {}
        for key, options in filters.items():
            key = base_key + key
            type = options['type']
            if type == 'contains':
                key += '__icontains'
            elif type == 'in':
                key += '__in'
            elif type == 'equal':
                pass

            formatted_dict[key] = options['value']
        return formatted_dict
