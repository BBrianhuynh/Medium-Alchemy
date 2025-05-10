import json

json_data = {}
i = 0
j = 0
with open('static/data/items.json', 'r') as file:
    data = file.read()
    json_data = json.loads(data)

for key in json_data:
    print(key)