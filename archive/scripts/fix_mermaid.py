import re

path = r'd:\Gitrepo\agora\WaveLens_Lite_v6_DaNang2026.md'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix gantt X
content = content.replace('dateFormat  X', 'dateFormat  x')

def replace_node(match):
    inner = match.group(1)
    if '<br/>' in inner or '<br>' in inner:
        # replace br with newline
        inner = re.sub(r'<br/?>', '\n', inner)
        return '["`' + inner + '`"]'
    return match.group(0)

parts = content.split('```mermaid')
for i in range(1, len(parts)):
    subparts = parts[i].split('```', 1)
    if len(subparts) == 2:
        mermaid_code = subparts[0]
        # Replace ["..."]
        new_code = re.sub(r'\["([^"]*)"\]', replace_node, mermaid_code)
        parts[i] = new_code + '```' + subparts[1]

new_content = '```mermaid'.join(parts)

def add_init(match):
    return match.group(0) + '\n%%{init: {"sequence": {"htmlLabels": true}} }%%'

new_content = re.sub(r'```mermaid\s+sequenceDiagram', add_init, new_content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Done')
