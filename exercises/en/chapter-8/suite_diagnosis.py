import time

def fetch_user_from_api(user_id):
    time.sleep(0.05)
    return {"id": user_id, "name": f"user_{user_id}"}

def setup_users_one_by_one(count):
    users = []
    for user_id in range(count):
        users.append(fetch_user_from_api(user_id))
    return users

start = time.perf_counter()
users = setup_users_one_by_one(40)
elapsed = time.perf_counter() - start

compute_start = time.perf_counter()
names = set()
duplicated = 0
for user in users:
    if user["name"] in names:
        duplicated = duplicated + 1
    names.add(user["name"])
compute_time = time.perf_counter() - compute_start

print(f"total time:     {elapsed:.2f} s")
print(f"waiting time:   {40 * 0.05:.2f} s")
print(f"compute time:   {compute_time:.4f} s")
print(f"waiting share:  {(40 * 0.05) / elapsed * 100:.0f}%")
