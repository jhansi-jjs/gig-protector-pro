import hashlib
import numpy as np

# Simulate Prithvi-WxC representation dimension
EMBEDDING_DIM = 8

def generate_zone_embedding(zone: str, weather_enc: int) -> list:
    """
    Intelligent Facade for Level 1 Prithvi-WxC Foundation Model.
    
    In a real-world scenario, this function would call the HuggingFace API,
    pass in the geographical coordinates of the zone and historical satellite tensors, 
    and output the dense embedding array.
    
    For hackathon constraints, this uses a deterministic hash to map the Zone 
    and Weather state into a mathematically consistent 8-dimensional space.
    This provides our Level 2 (XGBoost) model with structurally valid embeddings to learn from.
    """
    # Create a unique but consistent signature for this zone + weather combo
    signature = f"{zone}_{weather_enc}".encode('utf-8')
    seed = int(hashlib.md5(signature).hexdigest()[:8], 16)
    
    # Initialize a local random state to ensure determinism
    rng = np.random.RandomState(seed)
    
    # Generate 8 continuous variables matching typical embedding distributions (normalized -1 to 1)
    embedding = rng.uniform(-1.0, 1.0, size=EMBEDDING_DIM)
    
    # Optional mapping to represent "bad" weather causing slight negative skews in embeddings
    if weather_enc in [2, 3, 5]: # Fog, Rainy, Stormy
        embedding -= 0.2
        
    return embedding.tolist()
