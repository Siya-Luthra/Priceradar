import requests
from bs4 import BeautifulSoup
import random
import re

USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0',
]

def fetch_product_data(url):
    """
    Scrapes the given URL for product information.
    Uses basic BeautifulSoup parsing to extract price and availability.
    """
    headers = {
        'User-Agent': random.choice(USER_AGENTS),
        'Accept-Language': 'en-US,en;q=0.9',
    }

    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        raise Exception(f"Connection error: {e}")

    soup = BeautifulSoup(response.content, 'html.parser')

    data = {
        'price': None,
        'title': None,
        'is_available': False
    }

    # Generic parsing skeleton
    try:
        title_tag = soup.find('h1')
        if title_tag:
            data['title'] = title_tag.get_text(strip=True)
    except Exception:
        pass

    try:
        price_tag = soup.select_one('.price, .current-price, [data-price], span[class*="price"]')
        if price_tag:
            price_text = price_tag.get_text(strip=True).replace('$', '').replace(',', '')
            match = re.search(r'\d+(\.\d+)?', price_text)
            if match:
                data['price'] = float(match.group())
    except Exception:
        pass

    # Basic availability check
    try:
        out_of_stock_keywords = ['out of stock', 'currently unavailable', 'sold out']
        page_text = soup.get_text().lower()
        data['is_available'] = not any(kw in page_text for kw in out_of_stock_keywords)
    except Exception:
        data['is_available'] = True

    return data
