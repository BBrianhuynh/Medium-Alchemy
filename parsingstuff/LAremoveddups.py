import json

def normalize_parents(parents):
    return tuple(sorted(parents))  # Normalize the pair to ensure order doesn't matter

def remove_duplicate_parents(json_path):
    with open(json_path, "r") as f:
        data = json.load(f)

    for item in data.values():
        seen = set()
        unique_parents = []
        for pair in item["parents"]:
            norm = normalize_parents(pair)
            if norm not in seen:
                seen.add(norm)
                unique_parents.append(pair)
        item["parents"] = unique_parents

    with open(json_path, "w") as f:
        json.dump(data, f, indent=4)

# Example usage
remove_duplicate_parents("items.json")