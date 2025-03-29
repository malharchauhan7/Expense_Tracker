import random
def generate_random_color():
    hue = random.random()
    saturation = 0.7 + random.random() * 0.3  
    value = 0.8 + random.random() * 0.2  
    
    h = hue * 6
    c = value * saturation
    x = c * (1 - abs(h % 2 - 1))
    m = value - c
    
    if h < 1: rgb = (c, x, 0)
    elif h < 2: rgb = (x, c, 0)
    elif h < 3: rgb = (0, c, x)
    elif h < 4: rgb = (0, x, c)
    elif h < 5: rgb = (x, 0, c)
    else: rgb = (c, 0, x)
    
    r = int((rgb[0] + m) * 255)
    g = int((rgb[1] + m) * 255)
    b = int((rgb[2] + m) * 255)
    
    return f"#{r:02x}{g:02x}{b:02x}"