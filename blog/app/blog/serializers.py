import re

from marshmallow import post_dump

from app.extensions import ma
from app.blog.models import Blog

_UUID_SEGMENT = re.compile(
    r'^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$'
)


def _photo_names_to_ids(stored: str) -> str:
    """Stare wpisy mogły mieć pełny URL; API zwraca wyłącznie UUID rozdzielone przecinkami."""
    if not stored:
        return stored
    out = []
    for p in (x.strip() for x in stored.split(',') if x.strip()):
        if _UUID_SEGMENT.match(p):
            out.append(p.lower())
        elif '/files/' in p:
            seg = p.split('/files/')[-1].split('?')[0]
            out.append(seg.lower() if _UUID_SEGMENT.match(seg) else p)
        else:
            out.append(p)
    return ','.join(out)


class BlogSerializer(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Blog
        fields = ('id', 'user_id', 'cooperators', 'content', 'photo_names', 'views', 'countries', 'title', 'add_date', 'update_date')

    @post_dump
    def normalize_photo_names_in_response(self, data, **kwargs):
        if data.get('photo_names'):
            data = dict(data)
            data['photo_names'] = _photo_names_to_ids(data['photo_names'])
        return data

