
import re
with open('/constants.ts', 'r') as f:
    lines = f.readlines()

keys = {}
for i, line in enumerate(lines):
    match = re.match(r'^  "([^"]+)"(?=: \{)', line)
    if match:
        key = match.group(1)
        if key in keys:
            print(f"Duplicate key: {key} at lines {keys[key]+1} and {i+1}")
        keys[key] = i
