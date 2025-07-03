import json
import os
from typing import Dict, List, Optional

def load_mock_data() -> Optional[Dict]:
    """
    Load mock data from JSON file.
    
    Returns:
        Dict containing categories and products, or None if file not found
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(script_dir, 'mock_data.json')
    
    try:
        with open(json_path, 'r', encoding='utf-8') as file:
            return json.load(file)
    except FileNotFoundError:
        print(f"Error: mock_data.json not found at {json_path}")
        return None
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        return None

def get_products_data() -> List[Dict]:
    """
    Get just the products array from mock data.
    
    Returns:
        List of product dictionaries, empty list if data not found
    """
    mock_data = load_mock_data()
    if mock_data:
        return mock_data.get('products', [])
    return []

def get_categories_data() -> List[str]:
    """
    Get just the categories array from mock data.
    
    Returns:
        List of category strings, empty list if data not found
    """
    mock_data = load_mock_data()
    if mock_data:
        return mock_data.get('categories', [])
    return []

def get_products_by_category(category: str) -> List[Dict]:
    """
    Get products filtered by category.
    
    Args:
        category: Category name to filter by
        
    Returns:
        List of product dictionaries matching the category
    """
    products = get_products_data()
    return [product for product in products if product.get('category') == category]

def get_product_by_name(name: str) -> Optional[Dict]:
    """
    Get a single product by name.
    
    Args:
        name: Product name to search for
        
    Returns:
        Product dictionary if found, None otherwise
    """
    products = get_products_data()
    for product in products:
        if product.get('name') == name:
            return product
    return None 