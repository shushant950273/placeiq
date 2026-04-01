import os

project_path = r"c:\Users\aayud\Dropbox\My PC (LAPTOP-G96H3MML)\Desktop\project sp\campushire"

for root, dirs, files in os.walk(project_path):
    for f in files:
        path = os.path.join(root, f)
        try:
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
            if content.endswith('\\n'):
                content = content[:-2] + '\n'
                with open(path, 'w', encoding='utf-8') as file:
                    file.write(content)
        except Exception as e:
            pass
