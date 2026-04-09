PARTNERS = [
    {
        "name": "Habitat for Humanity",
        "categories": ["furniture", "home", "appliances"],
        "min_tier": "Good",
        "type": "donate",
        "description": "Nonprofit reselling donated goods to fund affordable housing"
    },
    {
        "name": "WS Certified Pre-Owned",
        "categories": ["all"],
        "min_tier": "Excellent",
        "type": "resale",
        "description": "Williams-Sonoma certified pre-owned program for near-mint items"
    },
    {
        "name": "TerraCycle",
        "categories": ["all"],
        "type": "recycle",
        "description": "Material-specific recycling streams, zero-waste certified"
    }
]

# kg CO2 avoided per kg of product diverted from production (EPA WARM model basis)
EMISSION_FACTOR = 2.5

# kg landfill diverted per kg of product (direct weight)
LANDFILL_FACTOR = 0.8