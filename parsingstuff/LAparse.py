import json
import re

#Acid Rain rain, smoke/rain, smog
#Bird air, life/life, sky/egg, air/egg, sky

def last_index_of_nth_capitalized_word(text, n):
    capitalized_words = list(re.finditer(r'\b[A-Z][a-z]*\b', text))
    
    if n > len(capitalized_words):
        return -1
    
    nth_match = capitalized_words[n - 1]
    return nth_match.end() - 1

def extractElements1(combo):
    comboElems = []

    rstart = 0
    p1end = combo.find(',') - 1
    p1start = -1
    for ind in reversed(range(0, p1end)):
        if(not combo[ind].isalpha()):
            p1start = ind + 1
            break
    rend = p1start - 2


    resElem = combo[rstart:(rend + 1)]
    p2start = p1end + 3
    p2end = -1

    while(True):
        if(combo.find('/', p2start) == -1):
            p2end = len(combo) - 1
            comboElems.append([combo[p1start:(p1end + 1)], combo[p2start:(p2end + 1)]])
            break # no more combos in the string
            
        p2end = combo.find('/', p2start) - 1
        comboElems.append([combo[p1start:(p1end + 1)], combo[p2start:(p2end + 1)]])
        print(resElem, ":", p1start, p1end, p2start, p2end)
        p1start = p2end + 2
        p1end = combo.find(',', p1start) - 1
        p2start = p1end + 3
        
    return resElem, comboElems
            
def extractLines(path):
    lines = []
    with open(path) as file:
        for line in file:
            lines.append(line.strip())
    return lines

# lines = extractLines('la_combos.txt')
# with open('inter.txt', 'w') as file:
#     for line in lines:
#         outStr = ""
#         resElem, pElems = extractElements(line)
#         resElem = resElem.lower()
#         for pair in pElems:
#             #"air + air": "pressure"
#             outStr = "\"" + pair[0] + " + " + pair[1] + "\": \"" + resElem + "\",\n"
#             file.write(outStr)

# NOT WORKING: "wild animal + armor": "armadillo", 
# WORKING:     "wild animal + dam": "beaver",
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

#get all items
# combos = extractLines("little_alchemy_combos.txt")
# with open('items.txt', 'a') as file:
#     for comboLine in combos:
#         elements = getElements(comboLine)
#         rElem = elements[2]
#         file.write(rElem + "\n")

# Generate item IDs
# allItems = {}
# with open('items.txt') as file:
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

# Create parent associations
allItems = {}
with open('items.json') as file:
    allItems = json.load(file)

combos = extractLines("little_alchemy_combos.txt")
with open('inter.txt', 'a') as f:
    for comboLine in combos:
        elements = getElements(comboLine)
        f.write(elements[0] + "|" + elements[1] + "|" + elements[2] + "\n")
        pElem1ID = findID(elements[0], allItems)
        pElem2ID = findID(elements[1], allItems)
        rElemID = findID(elements[2], allItems)
        #print(elements[0], " + ", elements[1], ':', elements[2], sep="")
        if(rElemID == None or pElem1ID == None or pElem2ID == None):
            print("ID not found for", elements, "|", (pElem1ID, pElem2ID, rElemID))
        else:
            allItems[rElemID]["parents"].append([pElem1ID, pElem2ID])

with open('items.json', 'w') as outF:
   json.dump(allItems, outF, indent=4)