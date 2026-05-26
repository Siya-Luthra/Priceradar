import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'priceradar_backend.settings')
django.setup()

from tracker.models import Product

updates = {
    'Apple iPhone 15 Pro': 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=400',
    'Samsung 49" Odyssey OLED G9': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=400',
    'The Pragmatic Programmer': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400'
}

for name, url in updates.items():
    Product.objects.filter(name=name).update(image_url=url)

print("Images updated successfully!")
