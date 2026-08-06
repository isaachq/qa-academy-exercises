from bench import measure

def make_emails(n):
    return [f"user_{i}@example.com" for i in range(n)]

def create_users_scanning(emails):
    created = []
    for email in emails:
        already_used = False
        for user in created:
            if user["email"] == email:
                already_used = True
                break
        if not already_used:
            created.append({"email": email, "role": "tester"})
    return len(created)

def create_users_indexed(emails):
    created = []
    used_emails = set()
    for email in emails:
        if email not in used_emails:
            created.append({"email": email, "role": "tester"})
            used_emails.add(email)
    return len(created)

print("create_users_scanning")
measure(create_users_scanning, [1000, 2000, 4000, 8000],
        make_data=make_emails)

print()
print("create_users_indexed")
measure(create_users_indexed, [100000, 200000, 400000, 800000],
        make_data=make_emails)
