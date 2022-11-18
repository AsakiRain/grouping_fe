import json
import requests

list = []

for i in range(28):
  resp = requests.get("http://127.0.0.1:4523/m1/1919379-0-default/new_person")
  list.append(resp.json())

with open('data.json', 'w') as outfile:
  json.dump(list, outfile)