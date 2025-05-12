import json

# Load your JSON data (replace this with actual file read if needed)
with open('items.json', 'r') as f:
    data = json.load(f)

# Step 1: Collect all item IDs that are used in "parents"
used_as_parent = set()

for item in data.values():
    for combo in item.get("parents", []):
        used_as_parent.update(combo)

# Step 2: Update each item's "isFinal" field based on whether its ID is in used_as_parent
for item_id, item in data.items():
    print((item_id not in used_as_parent))
    item['isFinal'] = item_id not in used_as_parent

# Step 3: Write the updated data back to the file (optional)
with open('updated_items.json', 'w') as f:
    json.dump(data, f, indent=4)

print("Updated 'isFinal' flags based on parent usage.")
