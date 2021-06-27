import csv
from typing import final
import requests
import urllib.parse

# converts the placename to long/lat coordinates
def convertLocationToCoordinates(address):
    address = address + ", United States of America"

    url = 'https://nominatim.openstreetmap.org/search/' + urllib.parse.quote(address) +'?format=json'
    response = requests.get(url).json()
    lat, lon = float(response[0]["lat"]), float(response[0]["lon"])

    return { 'lat': lat, 'lng': lon }

def getToDo(value):
    return [value]

def main():
    final_arr = []
    with open("roadtrip map script.csv") as f:
        reader = csv.reader(f) # change contents to floats
        rowCount = 0
        for row in reader: # each row is a list
            dict = {}

            if rowCount != 0:
                # sets up variables
                placename, date, image, todo = row[0], row[1], row[2], row[4]

                # sets the placename as string
                dict['placename'] = placename

                # sets the date as string
                dict['date'] = date

                # sets image if there is one
                if len(image) > 0:
                    dict['image'] = image

                # sets the location as lat/long
                dict["location"] = convertLocationToCoordinates(placename)

                #sets to do tasks
                if len(todo) > 0:
                    dict["todo"] = getToDo(todo)
                else:
                    dict["todo"] = ["We are currently figuring out what to do lol"]

               # print(dict)
                final_arr.append(dict)
                print(dict)
                rowCount += 1
            else:
                rowCount += 1
        print(final_arr)
    # should take a minute or so to load
   # print(final_arr)

if __name__ == "__main__":
    main()