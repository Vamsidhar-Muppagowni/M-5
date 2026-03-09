with open('backend/routes/ml.js', 'r', encoding='utf-8') as f:
    content = f.read()
old = "router.post('/recommend-price', mlController.recommendPrice);"
new = "router.post('/recommend-price', mlController.recommendPrice);\nrouter.post('/recommend-fertilizer', mlController.recommendFertilizer);"
with open('backend/routes/ml.js', 'w', encoding='utf-8') as f:
    f.write(content.replace(old, new, 1))
print('done')
