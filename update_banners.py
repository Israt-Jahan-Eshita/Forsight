import os
import re

files_info = [
    ('TeacherResources.tsx', 'Courses & Resources', 'Manage course materials and AI-generated quizzes. You can upload PDFs or Video/Audio lectures and generate contextual quizzes based on them.'),
    ('TeacherStudentsList.tsx', 'Student Roster', 'View and manage all enrolled students. You can see their current engagement status, risk levels, and quickly reach out if they need help.'),
    ('TeacherSubmissions.tsx', 'Assignment Inbox', 'Review all quizzes submitted by your students. The system automatically highlights late submissions or low scores that might need attention.'),
    ('AdminDashboard.tsx', 'System Overview', 'Monitor overall platform health. You can view total active users, course enrollment stats, and system performance metrics at a glance.'),
    ('AdminDocsEditor.tsx', 'Content Management System (CMS)', 'Edit global platform content and guidelines. Changes made here will be reflected across the platform for all users.'),
    ('AdminRegistration.tsx', 'User Provisioning', 'Register new teachers and administrators. This bypasses the standard student registration flow to grant elevated permissions.')
]

base_dir = r'd:\Forsight\frontend\src\pages'

for filename, title, desc in files_info:
    filepath = os.path.join(base_dir, filename)
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'JudgeBanner' in content:
        print(f'Skipping {filename}, already has JudgeBanner')
        continue

    # 1. Add import after the last import
    import_match = list(re.finditer(r'^import .*;?$', content, re.MULTILINE))
    if import_match:
        last_import = import_match[-1]
        insert_pos = last_import.end()
        content = content[:insert_pos] + '\nimport { JudgeBanner } from \'../components/ui/JudgeBanner\';' + content[insert_pos:]

    # 2. Add <JudgeBanner ... /> inside the first top-level div after return(
    return_match = re.search(r'return\s*\(\s*<div[^>]*>', content)
    if return_match:
        insert_pos = return_match.end()
        banner_tag = f'\n      <JudgeBanner \n        title="{title}"\n        description="{desc}"\n      />\n'
        content = content[:insert_pos] + banner_tag + content[insert_pos:]
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {filename}')
    else:
        print(f'Could not find return block in {filename}')
