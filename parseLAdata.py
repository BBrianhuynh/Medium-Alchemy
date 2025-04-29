import json

def getElements(combo):
    pElem1Start = 1
    pElem1End = combo.index('+') - 2
    pElem2Start = pElem1End + 4
    pElem2End = combo.index(':') - 2
    rElemStart = pElem2End + 5
    rElemEnd = len(combo) - 3

    parentElem1 = combo[pElem1Start:(pElem1End + 1)]
    parentElem2 = combo[pElem2Start:(pElem2End + 1)]
    resultElem = combo[rElemStart:(rElemEnd + 1)]

    return (parentElem1, parentElem2, resultElem)
    
def extractLines(path):
    lines = []
    with open(path) as file:
        for line in file:
            lines.append(line.strip())
    return lines

def findID(itemName, itemsData):
    itemID = ""
    keys = itemsData.keys()

    for id in keys:
        if(itemsData[id]["itemName"] == itemName):
            itemID = id
            break

    if(itemID == ""):
        return None

    return itemID

# Create parent associations
allItems = {}
with open('items.json') as file:
    allItems = json.load(file)

combos = extractLines("little_alchemy_combos.txt")
for comboLine in combos:
    elements = getElements(comboLine)
    pElem1ID = findID(elements[0], allItems)
    pElem2ID = findID(elements[1], allItems)
    rElemID = findID(elements[2], allItems)
    if(rElemID == None or pElem1ID == None or pElem2ID == None):
        print("ID not found for", elements, "|", (pElem1ID, pElem2ID, rElemID))
    allItems[rElemID]["parents"].append([pElem1ID, pElem2ID])

with open('items.json', 'w') as outF:
   json.dump(allItems, outF, indent=4)


# Generate item IDs
# allItems = {}
# with open('intermediate.txt') as file:
#     idNum = 0
#     for line in file:
#         itemName = line.strip()
#         itemIcon = itemName.replace(" ", "_") + ".png"
#         idStr = ""
#         if(idNum < 10):
#             idStr = "00" + str(idNum)
#         elif(idNum < 100):
#             idStr = "0" + str(idNum)
#         else:
#             idStr = str(idNum)

#         allItems[idStr] = {
#             "itemName": itemName,
#             "parents": [],
#             "isFinal": False,
#             "itemIcon": itemIcon
#         }
#         idNum += 1

# with open('items.json', 'w') as file:
#     json.dump(allItems, file, indent=4)